import { useState, useEffect, useRef } from "react";
import { DayView } from "./DayView";
import { AllDaysView } from "./AllDaysView";
import { MapView } from "./MapView";
import { RouteGuidance } from "./RouteGuidance";
import { ErrorNotification } from "./ErrorNotification";
import { ChatBox } from "./ChatBox";
import { DayChip } from "./DayChip";
import { AddDayButton } from "./AddDayButton";
import { DateSelector } from "./DateSelector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import {
  Plus,
  Save,
  X,
  Check,
  CalendarIcon,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  Sparkles,
  Waypoints,
  Loader2,
} from "lucide-react";
import { DayPlan, Destination, CostItem } from "../types";
import { toast } from "sonner@2.0.3";
import { optimizeRoute } from "../utils/routeOptimizer";
import { Calendar } from "./ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { format, addDays, differenceInDays } from "date-fns";
import { t } from "../locales/translations";

interface CustomModeProps {
  tripData: { name: string; days: DayPlan[] };
  onUpdate: (data: { name: string; days: DayPlan[] }) => void;
  currency: "USD" | "VND";
  onCurrencyToggle: () => void;
  language: "EN" | "VI";
  mode: "custom" | "view";
  isLoggedIn: boolean;
  currentUser: string | null;
  planId?: string | null;
  resetToDefault?: boolean;
  showAllDaysOnLoad?: boolean;
}

type ViewMode = "single" | "route-guidance";

export function CustomMode({
  tripData,
  onUpdate,
  currency,
  onCurrencyToggle,
  language,
  mode,
  isLoggedIn,
  currentUser,
  planId,
  resetToDefault,
  showAllDaysOnLoad,
}: CustomModeProps) {
  const lang = language.toLowerCase() as 'en' | 'vi';
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [selectedDay, setSelectedDay] = useState<string>("1");
  const [routeGuidancePair, setRouteGuidancePair] = useState<
    [Destination, Destination] | null
  >(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] =
    useState(false);
  const [localTripData, setLocalTripData] = useState(tripData);
  const [members, setMembers] = useState("");
  const [preferences, setPreferences] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isDateUserInput, setIsDateUserInput] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedDestination, setFocusedDestination] = useState<Destination | null>(null);
  
  // Ref for day chips scrollable container
  const dayChipsContainerRef = useRef<HTMLDivElement>(null);

  // Reset to default view states when User Manual is opened
  useEffect(() => {
    if (resetToDefault) {
      setViewMode("single");
      setSelectedDay("1");
      setIsMapExpanded(false);
      setRouteGuidancePair(null);
    }
  }, [resetToDefault]);

  // Watch for changes to tripData
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [tripData]);

  // Automatically adjust number of days based on Start Date and End Date (user input)
  useEffect(() => {
    if (startDate && endDate && isDateUserInput) {
      const daysDifference =
        differenceInDays(endDate, startDate) + 1;

      if (daysDifference < 1) {
        setError(t('endDateMustBeAfter', lang));
        return;
      }

      if (daysDifference !== localTripData.days.length) {
        const newDays: DayPlan[] = [];

        for (let i = 0; i < daysDifference; i++) {
          const existingDay = localTripData.days[i];
          newDays.push(
            existingDay
              ? {
                  ...existingDay,
                  id: String(i + 1),
                  dayNumber: i + 1,
                }
              : {
                  id: String(i + 1),
                  dayNumber: i + 1,
                  destinations: [],
                  optimizedRoute: [],
                },
          );
        }

        handleTripDataChange({
          ...localTripData,
          days: newDays,
        });
        toast.success(
          `${t('tripAdjusted', lang)} ${daysDifference} ${daysDifference > 1 ? t('days', lang) : t('day', lang)}`,
        );
      }
      setIsDateUserInput(false);
    }
  }, [startDate, endDate, isDateUserInput]);

  // Sync End Date when days are manually added/removed
  useEffect(() => {
    if (startDate && !isDateUserInput) {
      const calculatedEndDate = addDays(
        startDate,
        localTripData.days.length - 1,
      );
      setEndDate(calculatedEndDate);
    }
  }, [localTripData.days.length, startDate, isDateUserInput]);

  const handleTripDataChange = (newData: {
    name: string;
    days: DayPlan[];
  }) => {
    setLocalTripData(newData);
    setHasUnsavedChanges(true);
    onUpdate(newData);
  };

  const updateTripName = (name: string) => {
    handleTripDataChange({ ...localTripData, name });
  };

  const addDay = () => {
    const newDay: DayPlan = {
      id: String(localTripData.days.length + 1),
      dayNumber: localTripData.days.length + 1,
      destinations: [],
      optimizedRoute: [],
    };
    handleTripDataChange({
      ...localTripData,
      days: [...localTripData.days, newDay],
    });
    setSelectedDay(newDay.id);
    setViewMode("single");
    
    // Scroll to show the newly added day chip
    setTimeout(() => {
      if (dayChipsContainerRef.current) {
        dayChipsContainerRef.current.scrollTo({
          left: dayChipsContainerRef.current.scrollWidth,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const removeDay = (dayId: string) => {
    if (localTripData.days.length === 1) {
      setError(t('mustHaveOneDay', lang));
      return;
    }
    
    // Find the index of the day being deleted
    const deletedDayIndex = localTripData.days.findIndex((d) => d.id === dayId);
    
    const newDays = localTripData.days
      .filter((d) => d.id !== dayId)
      .map((day, index) => ({
        ...day,
        id: String(index + 1),
        dayNumber: index + 1,
      }));
    
    handleTripDataChange({ ...localTripData, days: newDays });
    
    // If the deleted day was selected, choose the next appropriate day
    if (selectedDay === dayId) {
      let newSelectedDayId: string;
      
      // Check if there's a day after the deleted day
      if (deletedDayIndex < newDays.length) {
        // Select the day that was after the deleted day (now at the same index)
        newSelectedDayId = newDays[deletedDayIndex].id;
      } else {
        // No day after, select the previous day (last day in the new array)
        newSelectedDayId = newDays[newDays.length - 1].id;
      }
      
      setSelectedDay(newSelectedDayId);
      
      // Scroll to show the newly selected day chip
      setTimeout(() => {
        const chipElement = document.getElementById(`day-chip-${newSelectedDayId}`);
        if (chipElement && dayChipsContainerRef.current) {
          chipElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
      }, 50);
    } else {
      // If we deleted a day before the currently selected day
      const selectedDayIndex = localTripData.days.findIndex((d) => d.id === selectedDay);
      if (deletedDayIndex < selectedDayIndex) {
        // The selected day's ID will decrease by 1 after renumbering
        const newSelectedDayId = String(Number(selectedDay) - 1);
        setSelectedDay(newSelectedDayId);
        
        // Scroll to show the newly selected day chip
        setTimeout(() => {
          const chipElement = document.getElementById(`day-chip-${newSelectedDayId}`);
          if (chipElement && dayChipsContainerRef.current) {
            chipElement.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'center'
            });
          }
        }, 50);
      }
    }
    
    toast.success(t('dayRemoved', lang));
  };

  const updateDay = (dayId: string, updatedDay: DayPlan) => {
    handleTripDataChange({
      ...localTripData,
      days: localTripData.days.map((d) =>
        d.id === dayId ? updatedDay : d,
      ),
    });
  };

  const findOptimalRoute = async () => {
    const day = localTripData.days.find(
      (d) => d.id === selectedDay,
    );
    if (!day || day.destinations.length < 2) {
      setError(t('addDestinationsFirst', lang));
      return;
    }

    setIsOptimizing(true);
    toast.success(t('optimizingRoute', lang));
    
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const optimized = optimizeRoute(day.destinations);
    updateDay(selectedDay, {
      ...day,
      optimizedRoute: optimized,
    });
    toast.success(t('routeOptimized', lang));
    setIsOptimizing(false);
  };

  const savePlan = async () => {
    if (!localTripData.name.trim()) {
      setError(t('pleaseEnterTripName', lang));
      return;
    }

    setIsSaving(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const savedPlans = JSON.parse(
      localStorage.getItem("tourPlans") || "[]",
    );

    if (planId) {
      // Update existing plan
      const planIndex = savedPlans.findIndex(
        (p: any) => p.id === planId,
      );
      if (planIndex !== -1) {
        savedPlans[planIndex] = {
          ...savedPlans[planIndex],
          name: localTripData.name,
          days: localTripData.days,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(
          "tourPlans",
          JSON.stringify(savedPlans),
        );
        setHasUnsavedChanges(false);
        toast.success(t('planUpdated', lang));
      } else {
        setError(t('planNotFound', lang));
      }
    } else {
      // Create new plan
      const plan = {
        id: Date.now().toString(),
        name: localTripData.name,
        days: localTripData.days,
        createdAt: new Date().toISOString(),
        user: currentUser,
      };
      savedPlans.push(plan);
      localStorage.setItem(
        "tourPlans",
        JSON.stringify(savedPlans),
      );
      setHasUnsavedChanges(false);
      toast.success(t('planSaved', lang));
    }
    
    setIsSaving(false);
  };

  const handleRouteGuidance = (
    from: Destination,
    to: Destination,
  ) => {
    setRouteGuidancePair([from, to]);
    setViewMode("route-guidance");
  };

  const handleAddDestination = async (name: string) => {
    const day = localTripData.days.find((d) => d.id === selectedDay);
    if (!day) return;

    const destination: Destination = {
      id: Date.now().toString(),
      name: name,
      address: '',
      costs: [{ id: `${Date.now()}-1`, amount: 0, detail: '' }],
      lat: 48.8566 + (Math.random() - 0.5) * 0.1,
      lng: 2.3522 + (Math.random() - 0.5) * 0.1
    };

    updateDay(selectedDay, {
      ...day,
      destinations: [...day.destinations, destination],
      optimizedRoute: []
    });
  };

  const handleRemoveDestination = async (destinationId: string) => {
    const day = localTripData.days.find((d) => d.id === selectedDay);
    if (!day) return;

    updateDay(selectedDay, {
      ...day,
      destinations: day.destinations.filter(d => d.id !== destinationId),
      optimizedRoute: []
    });
  };

  if (viewMode === "route-guidance" && routeGuidancePair) {
    return (
      <RouteGuidance
        from={routeGuidancePair[0]}
        to={routeGuidancePair[1]}
        onBack={() => {
          setViewMode("single");
          setRouteGuidancePair(null);
        }}
        language={language}
      />
    );
  }

  const currentDay = localTripData.days.find(
    (d) => d.id === selectedDay,
  );

  // View Mode Layout: Map (50%) | DayView (50%), No ChatBox
  if (mode === "view") {
    return (
      <div className="flex gap-4 h-[calc(100vh-32px)]">
        {/* Left Side - Map (50%) */}
        <div className="flex-1 h-full">
          <MapView
            days={localTripData.days}
            viewMode={viewMode}
            selectedDayId={selectedDay}
            onRouteGuidance={handleRouteGuidance}
            resetMapView={resetToDefault}
            language={language}
            mode={mode}
            onAddDestination={handleAddDestination}
            onRemoveDestination={handleRemoveDestination}
            focusedDestination={focusedDestination}
            onOptimizeRoute={findOptimalRoute}
            isOptimizing={isOptimizing}
          />
        </div>

        {/* Right Side - Trip Info + DayView (50%) */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Trip Info Card - View Mode (Read-Only) */}
          <Card 
            className="shrink-0 rounded-[24px] border border-[#E5E7EB]"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 18px 40px rgba(15,23,42,0.06)',
              paddingTop: '28px',
              paddingLeft: '28px',
              paddingRight: '28px',
              paddingBottom: '12px'
            }}
          >
            <div className="space-y-3">
              {/* Header / Title Area */}
              <div className="mb-4">
                <h3 className="flex items-center gap-2 text-gray-900 mb-1" style={{ fontSize: '20px', fontWeight: 600 }}>
                  <Sparkles className="w-5 h-5" />
                  {t('tripDetails', lang)}
                </h3>
              </div>

              {/* Trip Name & Number of Members - Read Only */}
              <div className="flex gap-5">
                <div 
                  className="flex-1 rounded-xl border bg-gray-50 flex items-center px-4"
                  style={{ 
                    height: '40px',
                    borderColor: '#E5E7EB',
                  }}
                >
                  {localTripData.name ? (
                    <span className="text-gray-900 text-sm">{localTripData.name}</span>
                  ) : (
                    <span className="text-gray-400 text-sm">{t('enterTripName', lang)}</span>
                  )}
                </div>

                <div 
                  className="flex-1 rounded-xl border bg-gray-50 flex items-center px-4"
                  style={{ 
                    height: '40px',
                    borderColor: '#E5E7EB',
                  }}
                >
                  {members ? (
                    <span className="text-gray-900 text-sm">{members} {t('members', lang)}</span>
                  ) : (
                    <span className="text-gray-400 text-sm">{t('numberOfMembers', lang)}</span>
                  )}
                </div>
              </div>

              {/* Date Display - Read Only */}
              <div className="flex gap-5">
                <div 
                  className="flex-1 rounded-xl border bg-gray-50 flex items-center px-4"
                  style={{ 
                    height: '40px',
                    borderColor: '#E5E7EB',
                  }}
                >
                  {startDate ? (
                    <span className="text-gray-900 text-sm">{format(startDate, "PPP")}</span>
                  ) : (
                    <span className="text-gray-400 text-sm">{t('startDate', lang)}</span>
                  )}
                </div>

                <div 
                  className="flex-1 rounded-xl border bg-gray-50 flex items-center px-4"
                  style={{ 
                    height: '40px',
                    borderColor: '#E5E7EB',
                  }}
                >
                  {endDate ? (
                    <span className="text-gray-900 text-sm">{format(endDate, "PPP")}</span>
                  ) : (
                    <span className="text-gray-400 text-sm">{t('endDate', lang)}</span>
                  )}
                </div>
              </div>

              {/* Day Navigation - Read Only (No Add/Delete) */}
              <div className="flex items-center gap-3" data-tutorial="day-tabs">
                <div className="flex gap-3 overflow-x-auto pb-1 flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ overflowY: 'visible', paddingTop: '8px', paddingBottom: '8px' }}>
                  {localTripData.days.map((day) => (
                    <div key={day.id} id={`day-chip-view-${day.id}`}>
                      <DayChip
                        dayNumber={day.dayNumber}
                        isSelected={selectedDay === day.id && viewMode === "single"}
                        onClick={() => {
                          setSelectedDay(day.id);
                          setViewMode("single");
                          
                          // Scroll to show the clicked day chip
                          setTimeout(() => {
                            const chipElement = document.getElementById(`day-chip-view-${day.id}`);
                            const container = chipElement?.parentElement?.parentElement;
                            if (chipElement && container) {
                              chipElement.scrollIntoView({
                                behavior: 'smooth',
                                block: 'nearest',
                                inline: 'center'
                              });
                            }
                          }, 50);
                        }}
                        onDelete={undefined}
                        label={t('day', lang)}
                        readOnly={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Main Content - DayView */}
          <div className="flex-1 overflow-y-auto">
            {viewMode === "single" && currentDay ? (
              <DayView
                day={currentDay}
                onUpdate={(updatedDay) =>
                  updateDay(selectedDay, updatedDay)
                }
                currency={currency}
                onCurrencyToggle={onCurrencyToggle}
                language={language}
                onDestinationClick={(destination) => setFocusedDestination(destination)}
              />
            ) : (
              <AllDaysView
                days={localTripData.days}
                onUpdate={(updatedDays) =>
                  handleTripDataChange({
                    ...localTripData,
                    days: updatedDays,
                  })
                }
                currency={currency}
                onCurrencyToggle={onCurrencyToggle}
                language={language}
              />
            )}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <ErrorNotification
            message={error}
            onClose={() => setError(null)}
          />
        )}
      </div>
    );
  }

  // Custom Mode Layout: Original layout with ChatBox
  return (
    <div className="flex gap-4 h-[calc(100vh-32px)]">
      {/* Left Side - 75% */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left: Map - Full Height */}
        <div className="flex-1 relative h-full">
          <MapView
            days={localTripData.days}
            viewMode={viewMode}
            selectedDayId={selectedDay}
            onRouteGuidance={handleRouteGuidance}
            resetMapView={resetToDefault}
            language={language}
            mode={mode}
            onAddDestination={handleAddDestination}
            onRemoveDestination={handleRemoveDestination}
            focusedDestination={focusedDestination}
            onOptimizeRoute={findOptimalRoute}
            isOptimizing={isOptimizing}
          />
        </div>

        {/* Right: Trip Info + Day View */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Trip Info Card */}
          <Card 
            className="shrink-0 rounded-[24px] border border-[#E5E7EB]"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 18px 40px rgba(15,23,42,0.06)',
              paddingTop: '28px',
              paddingLeft: '28px',
              paddingRight: '28px',
              paddingBottom: '12px'
            }}
          >
            <div className="space-y-3">
              {/* Header / Title Area */}
              <div className="mb-4">
                <h3 className="flex items-center gap-2 text-gray-900 mb-1" style={{ fontSize: '20px', fontWeight: 600 }}>
                  <Sparkles className="w-5 h-5" />
                  {t('tripDetails', lang)}
                </h3>
              </div>

              {/* Trip Name & Number of Members */}
              <div className="flex gap-5">
                <Input
                  value={localTripData.name}
                  onChange={(e) => updateTripName(e.target.value)}
                  placeholder={t('enterTripName', lang)}
                  className="flex-1 rounded-xl border-[#E2E8F0] bg-[#F8FAFC] placeholder:text-[#94A3B8] focus-visible:ring-[3px] focus-visible:ring-[rgba(59,130,246,0.20)] focus-visible:border-[#3B82F6] transition-all duration-200 hover:border-[#CBD5E1] hover:bg-white"
                  style={{ height: '40px' }}
                  data-tutorial="trip-name"
                />

                <Input
                  type="number"
                  value={members}
                  onChange={(e) => setMembers(e.target.value)}
                  placeholder={t('numberOfMembers', lang)}
                  min="1"
                  className="flex-1 rounded-xl border-[#E2E8F0] bg-[#F8FAFC] placeholder:text-[#94A3B8] focus-visible:ring-[3px] focus-visible:ring-[rgba(59,130,246,0.20)] focus-visible:border-[#3B82F6] transition-all duration-200 hover:border-[#CBD5E1] hover:bg-white"
                  style={{ height: '40px' }}
                  data-tutorial="members"
                />
              </div>

              {/* Date Selection with Increment/Decrement */}
              <div className="flex gap-5">
                <DateSelector
                  date={startDate}
                  onSelect={(date) => {
                    setStartDate(date);
                    setIsDateUserInput(true);
                  }}
                  placeholder={t('startDate', lang)}
                  disabled={(date) => {
                    if (endDate) {
                      return date > endDate;
                    }
                    return false;
                  }}
                  onIncrement={() => {
                    if (startDate) {
                      setStartDate(addDays(startDate, 1));
                      setIsDateUserInput(true);
                    }
                  }}
                  onDecrement={() => {
                    if (startDate) {
                      setStartDate(addDays(startDate, -1));
                      setIsDateUserInput(true);
                    }
                  }}
                />

                <DateSelector
                  date={endDate}
                  onSelect={(date) => {
                    setEndDate(date);
                    setIsDateUserInput(true);
                  }}
                  placeholder={t('endDate', lang)}
                  disabled={(date) => {
                    if (startDate) {
                      return date < startDate;
                    }
                    return false;
                  }}
                  onIncrement={() => {
                    if (endDate) {
                      setEndDate(addDays(endDate, 1));
                      setIsDateUserInput(true);
                    }
                  }}
                  onDecrement={() => {
                    if (endDate) {
                      setEndDate(addDays(endDate, -1));
                      setIsDateUserInput(true);
                    }
                  }}
                />
              </div>

              {/* Day Navigation - Timeline Chips */}
              <div className="flex items-center gap-3" data-tutorial="day-tabs">
                <div className="flex gap-3 overflow-x-auto pb-1 flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ overflowY: 'visible', paddingTop: '8px', paddingBottom: '8px' }} ref={dayChipsContainerRef}>
                  {localTripData.days.map((day) => (
                    <div key={day.id} id={`day-chip-${day.id}`}>
                      <DayChip
                        dayNumber={day.dayNumber}
                        isSelected={selectedDay === day.id && viewMode === "single"}
                        onClick={() => {
                          setSelectedDay(day.id);
                          setViewMode("single");
                          
                          // Scroll to show the clicked day chip
                          setTimeout(() => {
                            const chipElement = document.getElementById(`day-chip-${day.id}`);
                            if (chipElement && dayChipsContainerRef.current) {
                              chipElement.scrollIntoView({
                                behavior: 'smooth',
                                block: 'nearest',
                                inline: 'center'
                              });
                            }
                          }, 50);
                        }}
                        onDelete={(e) => {
                          e.stopPropagation();
                          removeDay(day.id);
                        }}
                        label={t('day', lang)}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Add Day Button */}
                <AddDayButton
                  onClick={addDay}
                  label={t('addDay', lang)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                {isLoggedIn && (
                  <Button
                    size="sm"
                    onClick={savePlan}
                    disabled={!hasUnsavedChanges || isSaving}
                    data-tutorial="save-plan"
                    className="transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 disabled:hover:scale-100 disabled:hover:shadow-none group"
                    style={{ height: '40px' }}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('saving', lang)}...
                      </>
                    ) : hasUnsavedChanges ? (
                      <>
                        <Save className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-0.5" />
                        {t('savePlan', lang)}
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2 transition-all duration-200 group-hover:scale-125" />
                        {t('saved', lang)}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Main Content - Map and Day View Side by Side */}
          <div className="flex-1 overflow-y-auto">
            {viewMode === "single" && currentDay ? (
              <DayView
                day={currentDay}
                onUpdate={(updatedDay) =>
                  updateDay(selectedDay, updatedDay)
                }
                currency={currency}
                onCurrencyToggle={onCurrencyToggle}
                language={language}
                onDestinationClick={(destination) => setFocusedDestination(destination)}
              />
            ) : (
              <AllDaysView
                days={localTripData.days}
                onUpdate={(updatedDays) =>
                  handleTripDataChange({
                    ...localTripData,
                    days: updatedDays,
                  })
                }
                currency={currency}
                onCurrencyToggle={onCurrencyToggle}
                language={language}
              />
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Chat Box (25%) */}
      <div className="w-1/4 min-w-[300px] h-full">
        <ChatBox language={language} />
      </div>

      {/* Error Notification */}
      {error && (
        <ErrorNotification
          message={error}
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
}