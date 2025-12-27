import { useState, useRef, useEffect, React } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Plus,
  Trash2,
  DollarSign,
  Loader2,
  Star,
  Clock,
  GripVertical,
} from "lucide-react";
import { DayPlan, Destination, CostItem } from "../types";
import { toast } from "sonner";
import { t } from "../locales/translations";
import { ErrorNotification } from "./ErrorNotification";
import { PlaceDetailsModal } from "./PlaceDetailsModal";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface DayViewProps {
  day: DayPlan;
  onUpdate: (day: DayPlan) => void;
  currency: "USD" | "VND";
  onCurrencyToggle: () => void;
  language: "EN" | "VI";
  onDestinationClick?: (destination: Destination) => void;
}

interface DraggableDestinationCardProps {
  destination: Destination;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  onRemove: (id: string) => void;
  onClick: (destination: Destination) => void;
  lang: "en" | "vi";
  isSelected: boolean;
  onSelect: (id: string) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  onDragStateChange?: (isDragging: boolean) => void;
}

const ITEM_TYPE = "DESTINATION_CARD";

function DraggableDestinationCard({
  destination,
  index,
  moveCard,
  onRemove,
  onClick,
  lang,
  isSelected,
  onSelect,
  scrollContainerRef,
  onDragStateChange,
}: DraggableDestinationCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [{ handlerId }, drop] = useDrop({
    accept: ITEM_TYPE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect =
        ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY =
        clientOffset!.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (
        dragIndex < hoverIndex &&
        hoverClientY < hoverMiddleY
      ) {
        return;
      }

      // Dragging upwards
      if (
        dragIndex > hoverIndex &&
        hoverClientY > hoverMiddleY
      ) {
        return;
      }

      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: () => {
      return { id: destination.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Notify parent when drag state changes
  useEffect(() => {
    if (onDragStateChange) {
      onDragStateChange(isDragging);
    }
  }, [isDragging, onDragStateChange]);

  // Attach drag to the grip handle, drop to the whole card
  drag(drop(ref));

  // Determine current state styling
  const getCardStyles = () => {
    // 5. DRAGGING STATE
    if (isDragging) {
      return {
        transform: 'translateY(-4px) scale(1.02)',
        opacity: 0.92,
        boxShadow: '0 16px 40px rgba(15,23,42,0.20)',
        transition: 'all 80ms ease-out',
      };
    }

    // 4. SELECTED STATE
    if (isSelected) {
      return {
        background: '#F8FBFF',
        border: '1px solid rgba(37,99,235,0.4)',
        boxShadow: '0 8px 20px rgba(15,23,42,0.08), 0 0 0 1px rgba(37,99,235,0.30)',
        transform: 'scale(1.00)',
        transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
      };
    }

    // 3. PRESSED STATE
    if (isPressed) {
      return {
        transform: 'scale(0.97)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        background: 'rgba(243,244,246,0.6)',
        transition: 'all 120ms ease-out',
      };
    }

    // 2. HOVER STATE
    if (isHovered) {
      return {
        transform: 'translateY(-2px) scale(1.01)',
        boxShadow: '0 10px 28px rgba(0,0,0,0.08)',
        background: '#FCFEFF',
        border: '1px solid rgba(209,213,219,1)',
        transition: 'all 160ms ease-out',
      };
    }

    // 1. DEFAULT STATE
    return {
      background: '#FFFFFF',
      border: '1px solid rgba(229,231,235,0.7)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
      transform: 'scale(1.00)',
      transition: 'all 160ms ease-out',
    };
  };

  const handleCardClick = () => {
    onSelect(destination.id);
    onClick(destination);
  };

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      tabIndex={0}
      className="group relative rounded-[20px] p-6 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004DB6] focus-visible:ring-offset-2"
      style={{
        ...getCardStyles(),
        position: 'relative',
      }}
      data-destination-item
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={handleCardClick}
    >
      {/* Left Accent Strip - Only visible in SELECTED state */}
      {isSelected && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[20px]"
          style={{
            background: '#1D4ED8',
            animation: 'slideIn 200ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      )}

      <div className="flex items-start gap-4">
        {/* Optional Thumbnail - uncomment to enable */}
        {/* <div className="shrink-0">
          <img 
            src={destination.imageUrl || "https://via.placeholder.com/72"} 
            alt={destination.name}
            className="w-[72px] h-[72px] rounded-[12px] object-cover"
            style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}
          />
        </div> */}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header Row: Drag Handle + Name + Delete */}
          <div className="flex items-start gap-3 mb-2">
            {/* Drag Handle - Enhanced Animation */}
            <div
              className="cursor-move pt-0.5 transition-all duration-150"
              style={{
                color: isDragging ? '#4B5563' : (isHovered ? '#6B7280' : '#9CA3AF'),
                opacity: isDragging ? 1 : (isHovered ? 1 : 0.8),
                transform: isDragging ? 'rotate(-3deg)' : (isHovered ? 'translateX(-2px)' : 'translateX(0)'),
              }}
            >
              <GripVertical className="w-4 h-4" />
            </div>

            {/* Name */}
            <h3
              className="flex-1 text-[16px] font-semibold text-[#111827] leading-snug"
              onClick={(e) => {
                e.stopPropagation();
                onClick(destination);
              }}
            >
              {destination.name}
            </h3>

            {/* Delete Button - Enhanced States */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(destination.id);
              }}
              className="h-8 w-8 p-0 rounded-full transition-all duration-150"
              style={{
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.16)';
                e.currentTarget.style.transform = 'scale(0.92)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
            >
              <Trash2 className="w-4 h-4 text-[#EF4444]" />
            </Button>
          </div>

          {/* Category Tag - Moved right below name */}
          <div className="mb-2 ml-7">
            <span className="inline-block bg-[#E8FBEA] text-[#16A34A] text-[13px] font-medium px-[10px] py-1 rounded-full">
              {destination.placeType || "Tourist Attraction"}
            </span>
          </div>

          {/* Rating Section - Enhanced Star Animation */}
          <div className="flex items-center gap-2 mb-2 ml-7">
            <span className="text-[16px] font-semibold text-[#111827]">
              {destination.rating?.toFixed(1) || "4.5"}
            </span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const rating = destination.rating || 4.5;
                const isFilled = star <= Math.floor(rating) || (star === Math.ceil(rating) && rating % 1 !== 0);
                return (
                  <Star
                    key={star}
                    className={`w-4 h-4 transition-all duration-140 ${isFilled ? "fill-[#FACC15] text-[#FACC15]" : "fill-gray-300 text-gray-300"}`}
                    style={{
                      borderRadius: '2px',
                      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                      filter: isHovered && isFilled ? 'drop-shadow(0 0 6px rgba(250,204,21,0.65))' : 'none',
                    }}
                  />
                );
              })}
            </div>
            <span className="text-[13px] text-[#6B7280]">
              ({destination.reviewCount?.toLocaleString() || "1,234"})
            </span>
          </div>

          {/* Price Level */}
          <div className="flex items-center gap-1.5 ml-7">
            <DollarSign className="w-4 h-4 shrink-0 text-[#6B7280]" />
            <span className="text-[14px] text-[#374151]">
              {"💰".repeat(destination.priceLevel || 3)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DayViewContent({
  day,
  onUpdate,
  currency,
  onCurrencyToggle,
  language,
  onDestinationClick,
}: DayViewProps) {
  const lang = language.toLowerCase() as "en" | "vi";
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAnyCardDragging, setIsAnyCardDragging] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Destination | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle destination click to open modal
  const handleDestinationClick = (destination: Destination) => {
    setSelectedPlace(destination);
    setIsModalOpen(true);
    onDestinationClick?.(destination);
  };

  // AUTO-SCROLL EFFECT - Scrolls the list when dragging near edges
  useEffect(() => {
    if (!isAnyCardDragging || !scrollContainerRef.current) return;

    let rafId: number;
    let mouseY = 0;
    const SCROLL_ZONE = 350; // px from edge - VERY LARGE for easy triggering
    const MAX_SPEED = 50; // px per frame - VERY FAST
    const MIN_SPEED = 8; // px per frame - START IMMEDIATELY

    const handleMouseMove = (e: MouseEvent) => {
      mouseY = e.clientY;
    };

    const autoScrollLoop = () => {
      const container = scrollContainerRef.current;
      if (!container) {
        rafId = requestAnimationFrame(autoScrollLoop);
        return;
      }

      const rect = container.getBoundingClientRect();
      const distFromTop = mouseY - rect.top;
      const distFromBottom = rect.bottom - mouseY;

      let speed = 0;

      // Scroll UP when mouse is in top zone (even if outside container)
      if (distFromTop < SCROLL_ZONE && distFromTop > -100) {
        // Allow detection even 100px above container
        const effectiveDistance = Math.max(0, distFromTop);
        const rawIntensity = 1 - (effectiveDistance / SCROLL_ZONE);
        const intensity = rawIntensity * rawIntensity;
        speed = -(MIN_SPEED + (intensity * (MAX_SPEED - MIN_SPEED)));
      }
      // Scroll DOWN when mouse is in bottom zone (even if outside container)
      else if (distFromBottom < SCROLL_ZONE && distFromBottom > -100) {
        // Allow detection even 100px below container
        const effectiveDistance = Math.max(0, distFromBottom);
        const rawIntensity = 1 - (effectiveDistance / SCROLL_ZONE);
        const intensity = rawIntensity * rawIntensity;
        speed = MIN_SPEED + (intensity * (MAX_SPEED - MIN_SPEED));
      }

      if (speed !== 0) {
        container.scrollTop += speed;
      }

      rafId = requestAnimationFrame(autoScrollLoop);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafId = requestAnimationFrame(autoScrollLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isAnyCardDragging]);

  const addDestination = async () => {
    const newDestinationName = prompt(
      t("enterDestinationName", lang),
    );
    if (!newDestinationName?.trim()) {
      setError(t("pleaseEnterDestinationName", lang));
      return;
    }

    setIsAdding(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock place types for variety
    const placeTypes = [
      "Restaurant",
      "Museum",
      "Hotel",
      "Café",
      "Park",
      "Shopping Mall",
      "Tourist Attraction",
    ];
    const randomPlaceType =
      placeTypes[Math.floor(Math.random() * placeTypes.length)];

    const destination: Destination = {
      id: Date.now().toString(),
      name: newDestinationName,
      address: "123 Sample Street, Paris, France",
      costs: [{ id: `${Date.now()}-1`, amount: 0, detail: "" }],
      lat: 48.8566 + (Math.random() - 0.5) * 0.1,
      lng: 2.3522 + (Math.random() - 0.5) * 0.1,
      imageUrl: `https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=200&fit=crop`,
      rating: 3.5 + Math.random() * 1.5, // Random rating between 3.5 and 5
      reviewCount: Math.floor(Math.random() * 4950) + 50, // Random review count 50-5000
      placeType: randomPlaceType,
      openHours: "9:00 AM - 10:00 PM",
      priceLevel: Math.floor(Math.random() * 4) + 1, // 1-4
      website: "https://example.com",
    };

    onUpdate({
      ...day,
      destinations: [...day.destinations, destination],
      optimizedRoute: [],
    });

    toast.success(t("destinationAdded", lang));
    setIsAdding(false);
    setError(null);

    // Auto-scroll to show the new destination - using requestAnimationFrame for reliability
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          // Scroll to bottom with smooth animation
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        }
      });
    });
  };

  const removeDestination = (id: string) => {
    onUpdate({
      ...day,
      destinations: day.destinations.filter((d) => d.id !== id),
      optimizedRoute: [],
    });
  };

  const moveCard = (dragIndex: number, hoverIndex: number) => {
    const draggedDestination = day.destinations[dragIndex];
    const newDestinations = [...day.destinations];

    // Remove the dragged item
    newDestinations.splice(dragIndex, 1);

    // Insert it at the new position
    newDestinations.splice(hoverIndex, 0, draggedDestination);

    onUpdate({
      ...day,
      destinations: newDestinations,
      optimizedRoute: [], // Clear optimized route when manually reordering
    });
  };

  const updateDestination = (
    id: string,
    updates: Partial<Destination>,
  ) => {
    onUpdate({
      ...day,
      destinations: day.destinations.map((d) =>
        d.id === id ? { ...d, ...updates } : d,
      ),
      optimizedRoute: day.optimizedRoute.map((d) =>
        d.id === id ? { ...d, ...updates } : d,
      ),
    });
  };

  const addCostItem = (destinationId: string) => {
    const destination = day.destinations.find(
      (d) => d.id === destinationId,
    );
    if (!destination) return;

    const newCost: CostItem = {
      id: `${Date.now()}-${destination.costs.length}`,
      amount: 0,
      detail: "",
    };

    updateDestination(destinationId, {
      costs: [...destination.costs, newCost],
    });
  };

  const updateCostItem = (
    destinationId: string,
    costId: string,
    updates: Partial<CostItem>,
  ) => {
    const destination = day.destinations.find(
      (d) => d.id === destinationId,
    );
    if (!destination) return;

    updateDestination(destinationId, {
      costs: destination.costs.map((c) =>
        c.id === costId ? { ...c, ...updates } : c,
      ),
    });
  };

  const removeCostItem = (
    destinationId: string,
    costId: string,
  ) => {
    const destination = day.destinations.find(
      (d) => d.id === destinationId,
    );
    if (!destination || destination.costs.length === 1) {
      setError(t("mustHaveOneCostItem", lang));
      return;
    }

    updateDestination(destinationId, {
      costs: destination.costs.filter((c) => c.id !== costId),
    });
  };

  const calculateDayTotal = () => {
    return day.destinations.reduce((total, dest) => {
      return (
        total +
        dest.costs.reduce(
          (sum, cost) => sum + (cost.amount || 0),
          0,
        )
      );
    }, 0);
  };

  const currencySymbol = currency === "USD" ? "$" : "₫";

  return (
    <>
      <Card
        className="h-full flex flex-col overflow-hidden transition-all duration-150 ease-out hover:-translate-y-[1px]"
        style={{
          background: 'linear-gradient(180deg, #F4FBFF 0%, #FFFFFF 40%, #FFFFFF 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(229, 231, 235, 0.6)',
          boxShadow: '0 18px 40px rgba(15, 23, 42, 0.06)',
          padding: '28px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 22px 50px rgba(15, 23, 42, 0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 18px 40px rgba(15, 23, 42, 0.06)';
        }}
        data-tutorial-card="day-view"
      >
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header - Styled Pill */}
          <div className="flex items-center text-[#1D4ED8] px-4 pt-1 pb-2.5 h-auto font-semibold text-[20px] border-b border-gray-200 mb-4 shrink-0">
            {t("day", lang)} {day.dayNumber}
          </div>

          {/* Destinations List */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2" ref={scrollContainerRef}>
            {day.destinations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="flex flex-col items-center gap-2 max-w-[420px] text-center">
                  {/* Title */}
                  <p className="text-[#4B5563] text-[16px]" style={{ fontWeight: 500 }}>
                    {lang === 'en' ? 'No destinations for this day yet' : 'Chưa có điểm đến nào cho ngày này'}
                  </p>

                  {/* Subtitle */}
                  <p className="text-[#9CA3AF] text-[13px]">
                    {lang === 'en'
                      ? 'Search for a place or click on the map to add your first stop.'
                      : 'Tìm kiếm địa điểm hoặc nhấp vào bản đồ để thêm điểm dừng đầu tiên.'}
                  </p>
                </div>
              </div>
            ) : (
              day.destinations.map((destination, index) => (
                <DraggableDestinationCard
                  key={destination.id}
                  destination={destination}
                  index={index}
                  moveCard={moveCard}
                  onRemove={removeDestination}
                  onClick={handleDestinationClick}
                  lang={lang}
                  isSelected={selectedCardId === destination.id}
                  onSelect={setSelectedCardId}
                  scrollContainerRef={scrollContainerRef}
                  onDragStateChange={setIsAnyCardDragging}
                />
              ))
            )}
          </div>

          {/* Day Total */}
          {day.destinations.length > 0 && (
            <div className="pt-4 border-t mt-4 shrink-0">
              <div className="flex items-center justify-between bg-[#DAF9D8] rounded-lg p-4">
                <span className="text-[#004DB6]">
                  {t("day", lang)} {day.dayNumber}{" "}
                  {t("total", lang)}:
                </span>
                <span className="text-[#004DB6]">
                  {currencySymbol}
                  {calculateDayTotal().toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {error && (
          <ErrorNotification
            message={error}
            onClose={() => setError(null)}
          />
        )}
      </Card>

      {/* Place Details Modal - Outside Card for full-screen backdrop */}
      <PlaceDetailsModal
        place={selectedPlace}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        language={language}
        showAddButton={false}
        onDelete={(placeId) => {
          removeDestination(placeId);
          setIsModalOpen(false);
        }}
        showDeleteButton={true}
      />
    </>
  );
}

export function DayView(props: DayViewProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <DayViewContent {...props} />
    </DndProvider>
  );
}