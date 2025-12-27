import { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DayPlan, Destination } from "../types";
import { MapPin, Navigation, X, Map, List, Plus, Loader2, Search, Star, ExternalLink, Clock, DollarSign, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { t } from "../locales/translations";
import { useThemeColors } from "../hooks/useThemeColors";

interface MapViewProps {
  days: DayPlan[];
  viewMode: 'single' | 'all' | 'route-guidance';
  selectedDayId: string;
  onRouteGuidance: (from: Destination, to: Destination) => void;
  resetMapView?: boolean;
  language: 'EN' | 'VI';
  mode?: 'custom' | 'view';
  onAddDestination: (name: string) => Promise<void>;
  onRemoveDestination: (destinationId: string) => Promise<void>;
  focusedDestination?: Destination | null;
  onOptimizeRoute?: () => Promise<void>;
  isOptimizing?: boolean;
  onDestinationClick?: (destination: Destination) => void;
}

export function MapView({
  days,
  viewMode,
  selectedDayId,
  onRouteGuidance,
  resetMapView,
  language,
  mode,
  onAddDestination,
  onRemoveDestination,
  focusedDestination,
  onOptimizeRoute,
  isOptimizing,
  onDestinationClick,
}: MapViewProps) {
  const lang = language.toLowerCase() as 'en' | 'vi';
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [newDestinationName, setNewDestinationName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [previewDestination, setPreviewDestination] = useState<Destination | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const filterContainerRef = useRef<HTMLDivElement>(null);

  // Initialize mapListView to "list" if there's an optimized route
  const currentDay = days.find((d) => d.id === selectedDayId);
  const hasOptimizedRoute =
    viewMode === "single" &&
    currentDay &&
    currentDay.optimizedRoute.length > 0;

  const [mapListView, setMapListView] = useState<
    "map" | "list"
  >(hasOptimizedRoute ? "list" : "map");
  const [selectedPairIndex, setSelectedPairIndex] = useState<
    number | null
  >(null);

  // Reset to map view when resetMapView is triggered
  useEffect(() => {
    if (resetMapView) {
      setMapListView("map");
      setSelectedDestination(null);
      setSelectedPairIndex(null);
      setNewDestinationName('');
      setIsAdding(false);
      setPreviewDestination(null);
    }
  }, [resetMapView]);

  // Handle focused destination from DayView card click
  useEffect(() => {
    if (focusedDestination) {
      setSelectedDestination(focusedDestination);
      // Switch to map view if in list view
      if (mapListView === 'list') {
        setMapListView('map');
      }
    }
  }, [focusedDestination]);

  const handleSearchPlace = () => {
    if (!newDestinationName.trim()) return;

    // Mock place types
    const placeTypes = ['Restaurant', 'Museum', 'Hotel', 'Café', 'Park', 'Shopping Mall', 'Tourist Attraction'];
    const randomPlaceType = placeTypes[Math.floor(Math.random() * placeTypes.length)];

    // Create a preview destination with random coordinates and mock data
    const preview: Destination = {
      id: 'preview-' + Date.now(),
      name: newDestinationName.trim(),
      address: '123 Sample Street, Paris, France',
      costs: [{ id: `${Date.now()}-1`, amount: 0, detail: '' }],
      lat: 48.8566 + (Math.random() - 0.5) * 0.1,
      lng: 2.3522 + (Math.random() - 0.5) * 0.1,
      imageUrl: `https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=200&fit=crop`,
      rating: 3.5 + Math.random() * 1.5, // Random rating between 3.5 and 5
      reviewCount: Math.floor(Math.random() * 4950) + 50, // Random review count 50-5000
      placeType: randomPlaceType,
      openHours: '9:00 AM - 10:00 PM',
      priceLevel: Math.floor(Math.random() * 4) + 1, // 1-4
      website: 'https://example.com'
    };

    setPreviewDestination(preview);
    setSelectedDestination(preview);
    setNewDestinationName('');
  };

  const handleAddDestination = async () => {
    if (!previewDestination) return;

    setIsAdding(true);
    try {
      await onAddDestination(previewDestination.name);
      setPreviewDestination(null);
      setSelectedDestination(null);
      toast.success(t('destinationAdded', lang));
    } catch (error) {
      toast.error(t('errorAddingDestination', lang));
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveDestination = async (destinationId: string) => {
    setIsAdding(true);
    try {
      await onRemoveDestination(destinationId);
      setSelectedDestination(null);
      toast.success(t('destinationRemoved', lang));
    } catch (error) {
      toast.error(t('errorRemovingDestination', lang));
    } finally {
      setIsAdding(false);
    }
  };

  // Get destinations based on view mode
  const getDestinations = () => {
    if (viewMode === "single") {
      const day = days.find((d) => d.id === selectedDayId);
      return day?.optimizedRoute.length
        ? day.optimizedRoute
        : day?.destinations || [];
    } else {
      return days.flatMap((d) => d.destinations);
    }
  };

  const destinations = getDestinations();

  // Include preview destination in coordinate calculations
  const allLocations = [...destinations];
  if (previewDestination) {
    allLocations.push(previewDestination);
  }

  // Use default coordinates if no locations
  const lats = allLocations.length > 0 ? allLocations.map((d) => d.lat) : [48.8566];
  const lngs = allLocations.length > 0 ? allLocations.map((d) => d.lng) : [2.3522];
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  const mapWidth = 700;
  const mapHeight = 600;
  const padding = 60;

  const latRange = maxLat - minLat || 0.1;
  const lngRange = maxLng - minLng || 0.1;

  const toMapX = (lng: number) => {
    return (
      padding +
      ((lng - minLng) / lngRange) * (mapWidth - 2 * padding)
    );
  };

  const toMapY = (lat: number) => {
    return (
      mapHeight -
      (padding +
        ((lat - minLat) / latRange) * (mapHeight - 2 * padding))
    );
  };

  // Generate route pairs
  const getRoutePairs = (): Array<
    [Destination, Destination]
  > => {
    if (!hasOptimizedRoute || !currentDay) return [];
    const route = currentDay.optimizedRoute;
    const pairs: Array<[Destination, Destination]> = [];
    for (let i = 0; i < route.length - 1; i++) {
      pairs.push([route[i], route[i + 1]]);
    }
    return pairs;
  };

  const routePairs = getRoutePairs();

  const { primary, secondary, accent, light } = useThemeColors();

  return (
    <Card
      className="h-full sticky bg-white rounded-3xl pt-4 px-7 pb-8 border border-[#E5E7EB]"
      style={{
        boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)'
      }}
      data-tutorial-card="map-view"
    >
      <div className="space-y-4 h-full flex flex-col">
        {/* Map View Header - Always shown, but only clickable in View Mode */}
        <div className="flex items-center justify-between gap-3">
          {mode === 'custom' ? (
            // Header in Custom Mode - not clickable
            <div
              className="flex items-center text-gray-900 px-0 py-2.5 h-auto font-semibold text-[20px]"
              data-tutorial="map-view-header"
            >
              <Map className="w-6 h-6 mr-2" />
              {t('mapView', lang)}
            </div>
          ) : (
            // Button in View Mode - clickable toggle with animations
            <button
              onClick={() => {
                setMapListView(
                  mapListView === "map" ? "list" : "map",
                );
              }}
              className="text-gray-900 px-4 py-2.5 h-auto font-semibold text-[20px] rounded-lg relative overflow-hidden group"
              data-tutorial="map-view-header"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${secondary}15`;
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
            >
              {/* Animated ripple effect on click */}
              <span
                className="absolute inset-0 opacity-0 group-active:opacity-100 pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${secondary}40 0%, transparent 70%)`,
                  transition: 'opacity 0.3s ease-out',
                }}
              />

              {/* Animated glow effect on hover */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, ${secondary}10 0%, ${primary}08 100%)`,
                  transition: 'opacity 0.4s ease-in-out',
                  borderRadius: '0.5rem',
                }}
              />

              {/* Button content with icon flip animation */}
              <span className="relative z-10 flex items-center transition-all duration-400">
                {mapListView === "map" ? (
                  <>
                    <Map
                      className="w-6 h-6 mr-2 transition-all duration-400 group-hover:scale-110 group-hover:rotate-12"
                      style={{
                        color: primary,
                        filter: `drop-shadow(0 0 8px ${primary}40)`,
                      }}
                    />
                    <span className="transition-all duration-300 group-hover:tracking-wide">
                      {t('mapView', lang)}
                    </span>
                  </>
                ) : (
                  <>
                    <List
                      className="w-5 h-5 mr-2 transition-all duration-400 group-hover:scale-110 group-hover:rotate-12"
                      style={{
                        color: secondary,
                        filter: `drop-shadow(0 0 8px ${secondary}40)`,
                      }}
                    />
                    <span className="transition-all duration-300 group-hover:tracking-wide">
                      {t('routeList', lang)}
                    </span>
                  </>
                )}
              </span>
            </button>
          )}

          {/* Find Optimal Route Button - Only in View Mode and Map View - On Same Line */}
          {mode === 'view' && mapListView === 'map' && onOptimizeRoute && (
            <Button
              onClick={onOptimizeRoute}
              disabled={isOptimizing || (currentDay && currentDay.destinations.length < 2)}
              className="bg-[#70C573] hover:bg-[#5E885D] text-white shrink-0"
              data-tutorial="find-optimal-route"
              style={{ height: '40px' }}
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('optimizing', lang)}...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 mr-2" />
                  {t('findOptimalRoute', lang)}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Search Place Input - Only in Custom Mode and Map View */}
        {mode !== 'view' && mapListView === "map" && (
          <div className="space-y-3" data-tutorial="search-place">
            {/* Hero Search Bar */}
            <div className="relative">
              {/* Search Container */}
              <div className="relative flex items-center gap-2 h-10 px-4 bg-[#F3F4F6] rounded-2xl transition-all duration-300 hover:bg-[#E8EBED] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5B67CA] focus-within:ring-opacity-30 focus-within:shadow-lg group">
                {/* Input Field */}
                <input
                  type="text"
                  placeholder={language === 'EN'
                    ? 'I\'m looking for...'
                    : 'Tôi đang tìm...'}
                  value={newDestinationName}
                  onChange={(e) => setNewDestinationName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isAdding && handleSearchPlace()}
                  disabled={isAdding}
                  className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder:text-gray-400 text-[14px] transition-all"
                />

                {/* Circular Search Button */}
                <button
                  onClick={handleSearchPlace}
                  disabled={isAdding || !newDestinationName.trim()}
                  className="absolute right-0 top-0 bottom-0 px-4 rounded-xl bg-[#5B67CA] hover:bg-[#4A56B9] text-white flex items-center justify-center transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:scale-105 active:scale-95 group-focus-within:shadow-xl"
                >
                  {isAdding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 transition-transform group-focus-within:scale-110" />
                  )}
                </button>
              </div>
            </div>

            {/* Filter Chips Row - Horizontally Scrollable with Blur Edges */}
            <div className="relative" ref={filterContainerRef}>
              {/* Left Blur Gradient */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />

              {/* Right Blur Gradient */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

              {/* Scrollable Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {/* 
                  FILTER TAGS CONFIGURATION
                  Add new filter tags here by adding objects to the array
                  Format: { id: 'unique-id', labelEN: 'English Label', labelVI: 'Vietnamese Label' }
                */}
                {[
                  { id: 'All', labelEN: 'All', labelVI: 'Tất cả' },
                  { id: 'Must-see', labelEN: 'Must-see', labelVI: 'Phải xem' },
                  { id: 'Food', labelEN: 'Food', labelVI: 'Ăn uống' },
                  { id: 'Cafe', labelEN: 'Cafe', labelVI: 'Cà phê' },
                  { id: 'Nature', labelEN: 'Nature', labelVI: 'Thiên nhiên' },
                  { id: 'Saved', labelEN: 'Saved', labelVI: 'Đã lưu' },
                  // Add more tags below this line:
                  // { id: 'Shopping', labelEN: 'Shopping', labelVI: 'Mua sắm' },
                  // { id: 'Culture', labelEN: 'Culture', labelVI: 'Văn hóa' },
                  // { id: 'Adventure', labelEN: 'Adventure', labelVI: 'Phiêu lưu' },
                ].map((filter) => (
                  <div key={filter.id} id={`filter-chip-${filter.id}`}>
                    <button
                      onClick={() => {
                        setSelectedFilter(filter.id);

                        // Scroll to show the clicked filter chip
                        setTimeout(() => {
                          const chipElement = document.getElementById(`filter-chip-${filter.id}`);
                          if (chipElement && filterContainerRef.current) {
                            chipElement.scrollIntoView({
                              behavior: 'smooth',
                              block: 'nearest',
                              inline: 'center'
                            });
                          }
                        }, 50);
                      }}
                      className={`
                        flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-medium h-[30px]
                        ${selectedFilter === filter.id
                          ? 'bg-[#1D4ED8] text-white scale-100 animate-bounce-subtle'
                          : 'bg-[#F1F5FF] text-[#1F2937] hover:bg-[#F6F9FF] hover:scale-[1.03] active:bg-[#E6EEFF] active:scale-[0.97]'
                        }
                      `}
                      style={{
                        boxShadow: selectedFilter === filter.id
                          ? '0 6px 16px rgba(29, 78, 216, 0.35)'
                          : 'none',
                        transitionDuration: selectedFilter === filter.id ? '300ms' : '180ms',
                        transitionTimingFunction: selectedFilter === filter.id
                          ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                          : 'ease-out',
                        transitionProperty: 'all',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedFilter !== filter.id) {
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedFilter !== filter.id) {
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                      onMouseDown={(e) => {
                        if (selectedFilter !== filter.id) {
                          e.currentTarget.style.transitionDuration = '120ms';
                        }
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transitionDuration = selectedFilter === filter.id ? '300ms' : '180ms';
                      }}
                    >
                      {language === 'EN' ? filter.labelEN : filter.labelVI}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* List View - Only in View Mode */}
        {mode === 'view' && mapListView === "list" && hasOptimizedRoute && (
          <div className="space-y-3" data-tutorial="route-list">
            <div className="bg-[#DAF9D8] rounded-lg p-4 max-h-[600px] overflow-y-auto">
              <p className="text-sm text-[#004DB6] mb-3">
                {t('clickToNavigate', lang)}
              </p>
              <div className="space-y-2">
                {routePairs.map((pair, idx) => (
                  <div key={idx} className="space-y-2">
                    {/* Route Pair Button with Animations */}
                    <button
                      onClick={() =>
                        setSelectedPairIndex(
                          selectedPairIndex === idx
                            ? null
                            : idx,
                        )
                      }
                      className="w-full justify-start text-left h-auto py-3 px-4 rounded-lg relative overflow-hidden group transition-all duration-300"
                      style={{
                        backgroundColor: selectedPairIndex === idx ? primary : 'white',
                        color: selectedPairIndex === idx ? 'white' : '#374151',
                        border: selectedPairIndex === idx ? 'none' : '1.5px solid #E5E7EB',
                        boxShadow: selectedPairIndex === idx
                          ? `0 8px 24px ${primary}40`
                          : '0 2px 8px rgba(0,0,0,0.05)',
                        transform: 'scale(1)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedPairIndex !== idx) {
                          e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                          e.currentTarget.style.boxShadow = `0 6px 20px ${primary}20`;
                          e.currentTarget.style.borderColor = primary;
                        } else {
                          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                          e.currentTarget.style.boxShadow = `0 12px 32px ${primary}50`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedPairIndex !== idx) {
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                          e.currentTarget.style.borderColor = '#E5E7EB';
                        } else {
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.boxShadow = `0 8px 24px ${primary}40`;
                        }
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
                      }}
                      onMouseUp={(e) => {
                        if (selectedPairIndex !== idx) {
                          e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                        } else {
                          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                        }
                      }}
                    >
                      {/* Animated ripple effect on click */}
                      <span
                        className="absolute inset-0 opacity-0 group-active:opacity-100 pointer-events-none"
                        style={{
                          background: selectedPairIndex === idx
                            ? `radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)`
                            : `radial-gradient(circle, ${primary}30 0%, transparent 70%)`,
                          transition: 'opacity 0.3s ease-out',
                        }}
                      />

                      {/* Shimmer effect on hover */}
                      <span
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                        style={{
                          background: selectedPairIndex === idx
                            ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)'
                            : `linear-gradient(135deg, ${primary}08 0%, ${secondary}05 100%)`,
                          transition: 'opacity 0.4s ease-in-out',
                        }}
                      />

                      <div className="flex items-center gap-2 w-full relative z-10">
                        {/* Number Badge with Animation */}
                        <span
                          className="rounded-full w-6 h-6 flex items-center justify-center text-xs shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12"
                          style={{
                            backgroundColor: selectedPairIndex === idx ? light : '#DAF9D8',
                            color: selectedPairIndex === idx ? primary : '#004DB6',
                            boxShadow: selectedPairIndex === idx
                              ? '0 2px 8px rgba(0,0,0,0.15)'
                              : '0 1px 3px rgba(0,0,0,0.1)',
                          }}
                        >
                          {idx + 1}
                        </span>

                        <div className="flex-1 min-w-0">
                          {/* From Destination */}
                          <div
                            className="text-sm truncate transition-all duration-200 group-hover:translate-x-1"
                            style={{
                              color: selectedPairIndex === idx ? 'white' : '#1F2937',
                            }}
                          >
                            {pair[0].name}
                          </div>

                          {/* Arrow with Animation */}
                          <div
                            className="text-xs mt-1 transition-all duration-300 group-hover:translate-y-1"
                            style={{
                              color: selectedPairIndex === idx ? 'rgba(255,255,255,0.8)' : '#9CA3AF',
                            }}
                          >
                            ↓
                          </div>

                          {/* To Destination */}
                          <div
                            className="text-sm truncate transition-all duration-200 group-hover:translate-x-1"
                            style={{
                              color: selectedPairIndex === idx ? 'white' : '#1F2937',
                            }}
                          >
                            {pair[1].name}
                          </div>
                        </div>

                        {/* Navigation Icon with Animation */}
                        <Navigation
                          className="w-4 h-4 shrink-0 transition-all duration-300 group-hover:scale-125 group-hover:rotate-45"
                          style={{
                            color: selectedPairIndex === idx ? 'white' : primary,
                            filter: selectedPairIndex === idx
                              ? 'drop-shadow(0 0 6px rgba(255,255,255,0.5))'
                              : `drop-shadow(0 0 4px ${primary}40)`,
                          }}
                        />
                      </div>
                    </button>

                    {/* Start Navigation Button with Animations */}
                    {selectedPairIndex === idx && (
                      <button
                        onClick={() =>
                          onRouteGuidance(pair[0], pair[1])
                        }
                        className="w-full h-12 rounded-lg relative overflow-hidden group transition-all duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${secondary} 0%, ${accent} 100%)`,
                          color: 'white',
                          border: 'none',
                          boxShadow: `0 6px 20px ${secondary}40`,
                          transform: 'scale(1)',
                          cursor: 'pointer',
                          animation: 'slideDown 0.3s ease-out',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                          e.currentTarget.style.boxShadow = `0 12px 32px ${secondary}60`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.boxShadow = `0 6px 20px ${secondary}40`;
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scale(0.97)';
                          e.currentTarget.style.boxShadow = `0 4px 12px ${secondary}35`;
                        }}
                        onMouseUp={(e) => {
                          e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                          e.currentTarget.style.boxShadow = `0 12px 32px ${secondary}60`;
                        }}
                      >
                        {/* Animated gradient overlay */}
                        <span
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
                            transition: 'opacity 0.4s ease-in-out',
                          }}
                        />

                        {/* Pulse effect on hover */}
                        <span
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                          style={{
                            background: 'radial-gradient(circle at center, rgba(255,255,255,0.25) 0%, transparent 70%)',
                            animation: 'pulse 2s ease-in-out infinite',
                          }}
                        />

                        {/* Ripple on click */}
                        <span
                          className="absolute inset-0 opacity-0 group-active:opacity-100 pointer-events-none"
                          style={{
                            background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
                            transition: 'opacity 0.2s ease-out',
                          }}
                        />

                        {/* Button content */}
                        <span className="relative z-10 flex items-center justify-center gap-2 font-medium">
                          <Navigation
                            className="w-5 h-5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-45"
                            style={{
                              filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.6))',
                            }}
                          />
                          <span className="transition-all duration-200 group-hover:tracking-wide">
                            {t('goStartNavigation', lang)}
                          </span>
                        </span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-600 text-center">
              {routePairs.length} {routePairs.length !== 1 ? t('routeSegments', lang) : t('routeSegment', lang)}
            </div>
          </div>
        )}

        {/* Map View */}
        {mapListView === "map" && (
          <>
            {/* Map */}
            <div className="bg-gray-50 rounded-lg overflow-hidden border relative flex-1 p-4">
              <svg
                viewBox={`0 0 ${mapWidth} ${mapHeight}`}
                className="w-full h-full"
                style={{ maxHeight: "550px" }}
              >
                {/* Background */}
                <rect
                  width={mapWidth}
                  height={mapHeight}
                  fill="#f0f9ff"
                />

                {/* Grid */}
                {Array.from({ length: 10 }).map((_, i) => (
                  <g key={i} opacity="0.1">
                    <line
                      x1={i * (mapWidth / 10)}
                      y1={0}
                      x2={i * (mapWidth / 10)}
                      y2={mapHeight}
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />
                    <line
                      x1={0}
                      y1={i * (mapHeight / 10)}
                      x2={mapWidth}
                      y2={i * (mapHeight / 10)}
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />
                  </g>
                ))}

                {/* Route Lines */}
                {hasOptimizedRoute &&
                  currentDay &&
                  currentDay.optimizedRoute.map((dest, idx) => {
                    if (idx === 0) return null;
                    const prev =
                      currentDay.optimizedRoute[idx - 1];
                    return (
                      <line
                        key={`line-${dest.id}`}
                        x1={toMapX(prev.lng)}
                        y1={toMapY(prev.lat)}
                        x2={toMapX(dest.lng)}
                        y2={toMapY(dest.lat)}
                        stroke="#6366f1"
                        strokeWidth="3"
                        strokeDasharray="5,5"
                        opacity="0.6"
                      />
                    );
                  })}

                {/* Destination Markers */}
                {destinations.map((dest, idx) => {
                  const x = toMapX(dest.lng);
                  const y = toMapY(dest.lat);
                  const isSelected =
                    selectedDestination?.id === dest.id;

                  return (
                    <g
                      key={dest.id}
                      onClick={() => {
                        setSelectedDestination(dest);
                        // Notify parent component about the click in View Mode
                        if (mode === 'view' && onDestinationClick) {
                          onDestinationClick(dest);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {/* Marker Pin */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? "12" : "10"}
                        fill="white"
                        stroke={
                          isSelected
                            ? "#f59e0b"
                            : hasOptimizedRoute
                              ? "#6366f1"
                              : "#10b981"
                        }
                        strokeWidth={isSelected ? "4" : "3"}
                      />
                      {hasOptimizedRoute && (
                        <text
                          x={x}
                          y={y + 1}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="10"
                          fill="#6366f1"
                          className="pointer-events-none"
                        >
                          {idx + 1}
                        </text>
                      )}

                      {/* Label */}
                      <text
                        x={x}
                        y={y - 18}
                        textAnchor="middle"
                        fontSize="11"
                        fill="#1e293b"
                        className="pointer-events-none"
                      >
                        {dest.name.length > 15
                          ? dest.name.substring(0, 15) + "..."
                          : dest.name}
                      </text>
                    </g>
                  );
                })}

                {/* Preview Destination Marker */}
                {previewDestination && (
                  <g
                    onClick={() =>
                      setSelectedDestination(previewDestination)
                    }
                    className="cursor-pointer"
                  >
                    {/* Marker Pin - Orange/Yellow for Preview */}
                    <circle
                      cx={toMapX(previewDestination.lng)}
                      cy={toMapY(previewDestination.lat)}
                      r={selectedDestination?.id === previewDestination.id ? "12" : "10"}
                      fill="white"
                      stroke="#f59e0b"
                      strokeWidth={selectedDestination?.id === previewDestination.id ? "4" : "3"}
                    />

                    {/* Question Mark Icon for Preview */}
                    <text
                      x={toMapX(previewDestination.lng)}
                      y={toMapY(previewDestination.lat) + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="12"
                      fill="#f59e0b"
                      className="pointer-events-none"
                    >
                      ?
                    </text>

                    {/* Label */}
                    <text
                      x={toMapX(previewDestination.lng)}
                      y={toMapY(previewDestination.lat) - 18}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#f59e0b"
                      className="pointer-events-none"
                    >
                      {previewDestination.name.length > 15
                        ? previewDestination.name.substring(0, 15) + "..."
                        : previewDestination.name}
                    </text>
                  </g>
                )}
              </svg>

              {/* Selected Destination Details - Only show in Custom Mode */}
              {mode !== 'view' && selectedDestination && (
                <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-gray-100 max-w-md mx-auto">
                  {/* Close Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedDestination(null);
                      if (selectedDestination.id.startsWith('preview-')) {
                        setPreviewDestination(null);
                      }
                    }}
                    className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white rounded-full w-8 h-8 p-0 shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </Button>

                  {/* Place Image */}
                  {selectedDestination.imageUrl && (
                    <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-blue-50 relative overflow-hidden">
                      <img
                        src={selectedDestination.imageUrl}
                        alt={selectedDestination.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-4 space-y-3">
                    {/* Place Name - Moved to Top */}
                    <h4 className="text-gray-900 text-lg">
                      {selectedDestination.name}
                    </h4>

                    {/* Rating & Review Count */}
                    {selectedDestination.rating && (
                      <div className="flex items-center gap-2">
                        {/* Rating Badge with Score + Stars */}
                        <div className="flex items-center gap-1.5 bg-[#004DB6] text-white px-3 py-1.5 rounded-md">
                          {/* Rating Score */}
                          <span className="text-sm font-semibold">
                            {selectedDestination.rating.toFixed(1)}
                          </span>

                          {/* 5 Star Rating Display */}
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((starIndex) => {
                              const rating = selectedDestination.rating || 0;
                              const isFullStar = starIndex <= Math.floor(rating);
                              const isHalfStar = starIndex === Math.ceil(rating) && rating % 1 !== 0;

                              return (
                                <div key={starIndex} className="relative w-3 h-3">
                                  {/* Background gray star */}
                                  <Star className="w-3 h-3 fill-gray-400 text-gray-400 absolute" />

                                  {/* Foreground yellow star (full or half) */}
                                  {isFullStar && (
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 absolute" />
                                  )}
                                  {isHalfStar && (
                                    <div className="absolute overflow-hidden w-1/2 h-full">
                                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Review Count - Outside Badge */}
                        {selectedDestination.reviewCount && (
                          <span className="text-sm text-gray-600">
                            ({selectedDestination.reviewCount.toLocaleString()} {language === 'EN' ? 'reviews' : 'đánh giá'})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Place Type - Below Rating */}
                    {selectedDestination.placeType && (
                      <div>
                        <span className="inline-block text-xs bg-[#DAF9D8] text-[#004DB6] px-2 py-1 rounded-md">
                          {selectedDestination.placeType}
                        </span>
                      </div>
                    )}

                    {/* Address */}
                    {selectedDestination.address && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{selectedDestination.address}</span>
                      </div>
                    )}

                    {/* Open Hours */}
                    {selectedDestination.openHours && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>{selectedDestination.openHours}</span>
                      </div>
                    )}

                    {/* Price Level */}
                    {selectedDestination.priceLevel && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 shrink-0" />
                        <span>
                          {'💰'.repeat(selectedDestination.priceLevel)}
                          <span className="text-gray-300">{'💰'.repeat(4 - selectedDestination.priceLevel)}</span>
                        </span>
                      </div>
                    )}

                    {/* Show costs for non-preview destinations */}
                    {!selectedDestination.id.startsWith('preview-') && selectedDestination.costs.length > 0 && selectedDestination.costs[0].amount > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-500 mb-1">{language === 'EN' ? 'Your Costs:' : 'Chi phí của bạn:'}</p>
                        <div className="space-y-1">
                          {selectedDestination.costs.map((cost) => (
                            <div key={cost.id} className="text-sm text-gray-600 flex justify-between">
                              <span>{cost.detail || (language === 'EN' ? 'Cost' : 'Chi phí')}</span>
                              <span className="text-gray-900">${cost.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      {/* Website Link */}
                      {selectedDestination.website && (
                        <Button
                          variant="outline"
                          className="flex-1 text-sm relative overflow-hidden group transition-all duration-200"
                          onClick={() => window.open(selectedDestination.website, '_blank')}
                          style={{
                            borderColor: '#E5E7EB',
                            borderWidth: '1.5px',
                            transform: 'scale(1)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,77,182,0.15)';
                            e.currentTarget.style.borderColor = '#004DB6';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                            e.currentTarget.style.borderColor = '#E5E7EB';
                          }}
                          onMouseDown={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(0.97)';
                            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
                          }}
                          onMouseUp={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,77,182,0.15)';
                          }}
                        >
                          {/* Animated gradient overlay on hover */}
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{
                              background: 'linear-gradient(135deg, rgba(0,77,182,0.05) 0%, rgba(0,77,182,0) 100%)',
                              pointerEvents: 'none',
                            }}
                          />

                          {/* Ripple effect on click */}
                          <div
                            className="absolute inset-0 opacity-0 group-active:opacity-100 transition-opacity duration-150"
                            style={{
                              background: 'radial-gradient(circle, rgba(0,77,182,0.15) 0%, transparent 70%)',
                              pointerEvents: 'none',
                            }}
                          />

                          {/* Button content */}
                          <span className="relative z-10 flex items-center justify-center">
                            <ExternalLink className="w-4 h-4 mr-1 transition-all duration-200 group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                            <span className="font-medium transition-colors duration-200 group-hover:text-[#004DB6]">
                              {language === 'EN' ? 'Website' : 'Trang web'}
                            </span>
                          </span>
                        </Button>
                      )}

                      {/* Add to Day Plan button for preview destinations */}
                      {selectedDestination.id.startsWith('preview-') && (
                        <Button
                          className="flex-1 text-white text-sm relative overflow-hidden group transition-all duration-200"
                          onClick={handleAddDestination}
                          disabled={isAdding}
                          style={{
                            background: isAdding
                              ? 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)'
                              : 'linear-gradient(135deg, #004DB6 0%, #003d8f 100%)',
                            boxShadow: isAdding
                              ? '0 4px 12px rgba(0,0,0,0.15)'
                              : '0 6px 20px rgba(0,77,182,0.35)',
                            transform: 'scale(1)',
                            border: 'none',
                          }}
                          onMouseEnter={(e) => {
                            if (!isAdding) {
                              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,77,182,0.45)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isAdding) {
                              e.currentTarget.style.transform = 'translateY(0) scale(1)';
                              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,77,182,0.35)';
                            }
                          }}
                          onMouseDown={(e) => {
                            if (!isAdding) {
                              e.currentTarget.style.transform = 'translateY(0) scale(0.97)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,77,182,0.30)';
                            }
                          }}
                          onMouseUp={(e) => {
                            if (!isAdding) {
                              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,77,182,0.45)';
                            }
                          }}
                        >
                          {/* Animated gradient overlay on hover */}
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%)',
                              pointerEvents: 'none',
                            }}
                          />

                          {/* Ripple effect background */}
                          <div
                            className="absolute inset-0 opacity-0 group-active:opacity-100 transition-opacity duration-150"
                            style={{
                              background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)',
                              pointerEvents: 'none',
                            }}
                          />

                          {/* Button content */}
                          <span className="relative z-10 flex items-center justify-center">
                            {isAdding ? (
                              <>
                                <Loader2
                                  className="w-4 h-4 mr-1.5 animate-spin"
                                  style={{
                                    animation: 'spin 1s linear infinite',
                                  }}
                                />
                                <span className="font-medium">
                                  {language === 'EN' ? 'Adding...' : 'Đang thêm...'}
                                </span>
                              </>
                            ) : (
                              <>
                                <Plus
                                  className="w-4 h-4 mr-1.5 transition-transform duration-200 group-hover:rotate-90 group-hover:scale-110"
                                />
                                <span className="font-medium">
                                  {language === 'EN'
                                    ? `Add to Day ${currentDay?.dayNumber || 1}`
                                    : `Thêm vào Ngày ${currentDay?.dayNumber || 1}`}
                                </span>
                              </>
                            )}
                          </span>
                        </Button>
                      )}

                      {/* Remove Destination button for non-preview destinations */}
                      {!selectedDestination.id.startsWith('preview-') && (
                        <Button
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm"
                          onClick={() => handleRemoveDestination(selectedDestination.id)}
                          disabled={isAdding}
                        >
                          {isAdding ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              {language === 'EN' ? 'Removing...' : 'Đang xóa...'}
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-1" />
                              {language === 'EN' ? 'Remove' : 'Xóa'}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Map Info */}
            <div className="text-sm text-gray-600 flex items-center justify-between">
              <span>
                {destinations.length} {destinations.length !== 1 ? t('destinations', lang) : t('destination', lang)}
              </span>
              {viewMode === "all" && (
                <span className="text-[#004DB6]">
                  {t('showingAllDays', lang)}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}