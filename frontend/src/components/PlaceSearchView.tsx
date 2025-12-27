import { useState, useRef } from "react";
import { Card } from "./ui/card";
import { Search, Loader2, MapPin, Star, Plus, MapPinPlus } from "lucide-react";
import { Destination } from "../types";
import { t } from "../locales/translations";
import { useThemeColors } from "../hooks/useThemeColors";
import { PlaceDetailsModal } from "./PlaceDetailsModal";
import { handleSearch, getPlaceById } from "../utils/serp";
interface PlaceSearchViewProps {
  onAddDestination: (place: Destination) => Promise<void>;
  language: "EN" | "VI";
  selectedDayId: string;
}

export function PlaceSearchView({
  onAddDestination,
  language,
  selectedDayId,
}: PlaceSearchViewProps) {
  const lang = language.toLowerCase() as "en" | "vi";
  const { primary, secondary, light } = useThemeColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Destination[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Destination | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const filterContainerRef = useRef<HTMLDivElement>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const onSearchInputChange = async (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      setIsSearching(true);
      const results = await handleSearch(value);
      console.log('Search results:', results);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handlePlaceClick = (place: Destination) => {
    setSelectedPlace(place);
    setIsModalOpen(true);
  };

  const handleAddToDay = async (place: Destination) => {
    await onAddDestination(place);
    setIsModalOpen(false);
    setSearchResults(searchResults.filter((p) => p.id !== place.id));
  };

  // Add button: fetch full place info and open modal
  const handleAddClick = async () => {
    if (!selectedPlaceId) return;
    setIsSearching(true);
    const place = await getPlaceById(selectedPlaceId);
    setIsSearching(false);
    if (place) {
      setSelectedPlace(place);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Card
        className="h-full sticky bg-white rounded-3xl pt-4 px-7 pb-8 border border-[#E5E7EB]"
        style={{
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
        }}
        data-tutorial-card="place-search"
      >
        <div className="space-y-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center text-gray-900 px-0 py-2.5 h-auto font-semibold text-[20px]">
            <MapPinPlus className="w-7 h-7 mr-2" style={{ color: primary }} />
            {t("placeSearch", lang)}
          </div>

          {/* Search Bar */}
          <div className="space-y-3">
            <div className="relative">
              <div className="relative flex items-center gap-2 h-10 px-4 bg-[#F3F4F6] rounded-2xl transition-all duration-300 hover:bg-[#E8EBED] focus-within:bg-white focus-within:ring-2 focus-within:shadow-lg group"
                style={{
                  ['--tw-ring-color' as any]: primary,
                }}
              >
                <input
                  type="text"
                  placeholder={
                    language === "EN"
                      ? "I'm looking for..."
                      : "Tôi đang tìm..."
                  }
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === "Enter") onSearchInputChange(searchQuery);
                  }}
                  disabled={isSearching}
                  className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder:text-gray-400 text-[14px] transition-all"
                />
              </div>
            </div>

            {/* Filter Chips Row */}
            <div className="relative" ref={filterContainerRef}>
              {/* Left Blur Gradient */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />

              {/* Right Blur Gradient */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

              {/* Scrollable Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {[
                  { id: "All", labelEN: "All", labelVI: "Tất cả" },
                  { id: "Must-see", labelEN: "Must-see", labelVI: "Phải xem" },
                  { id: "Food", labelEN: "Food", labelVI: "Ăn uống" },
                  { id: "Cafe", labelEN: "Cafe", labelVI: "Cà phê" },
                  { id: "Nature", labelEN: "Nature", labelVI: "Thiên nhiên" },
                  { id: "Saved", labelEN: "Saved", labelVI: "Đã lưu" },
                ].map((filter) => (
                  <div key={filter.id} id={`filter-chip-${filter.id}`}>
                    <button
                      onClick={() => {
                        setSelectedFilter(filter.id);

                        setTimeout(() => {
                          const chipElement = document.getElementById(
                            `filter-chip-${filter.id}`
                          );
                          if (chipElement && filterContainerRef.current) {
                            chipElement.scrollIntoView({
                              behavior: "smooth",
                              block: "nearest",
                              inline: "center",
                            });
                          }
                        }, 50);
                      }}
                      className={`
                        flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-medium h-[30px]
                        ${selectedFilter === filter.id
                          ? "text-white scale-100 animate-bounce-subtle"
                          : "bg-[#F1F5FF] text-[#1F2937] hover:bg-[#F6F9FF] hover:scale-[1.03] active:bg-[#E6EEFF] active:scale-[0.97]"
                        }
                      `}
                      style={{
                        backgroundColor:
                          selectedFilter === filter.id ? primary : undefined,
                        boxShadow:
                          selectedFilter === filter.id
                            ? `0 6px 16px ${primary}50`
                            : "none",
                        transitionDuration:
                          selectedFilter === filter.id ? "300ms" : "180ms",
                        transitionTimingFunction:
                          selectedFilter === filter.id
                            ? "cubic-bezier(0.34, 1.56, 0.64, 1)"
                            : "ease-out",
                        transitionProperty: "all",
                        whiteSpace: "nowrap",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedFilter !== filter.id) {
                          e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(0, 0, 0, 0.08)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedFilter !== filter.id) {
                          e.currentTarget.style.boxShadow = "none";
                        }
                      }}
                    >
                      {language === "EN" ? filter.labelEN : filter.labelVI}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Search className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-sm text-center">
                  {t("searchForPlaces", lang)}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 px-2">
                  {t("searchResults", lang)} ({searchResults.length})
                </p>
                {[...new Map(searchResults.map(place => [place.place_id, place])).values()].map((place: any) => (
                  <div
                    key={place.place_id}
                    className="bg-white border border-gray-200 rounded-xl p-3 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group flex gap-3"
                    onClick={() => handlePlaceClick(place)}
                    style={{
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = primary;
                      e.currentTarget.style.boxShadow = `0 8px 24px ${primary}20`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#E5E7EB";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
                    }}
                  >
                    {/* Place Image - Left Side */}
                    {place.imageUrl && (
                      <div className="w-32 h-32 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={place.imageUrl}
                          alt={place.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Place Info - Right Side */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="space-y-2">
                        {/* Name & Type */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-gray-900 font-medium break-words">{place.name}</h4>
                          {place.placeType && (
                            <span
                              className="text-xs px-2 py-1 rounded-md shrink-0"
                              style={{
                                backgroundColor: light,
                                color: primary,
                              }}
                            >
                              {place.placeType}
                            </span>
                          )}
                        </div>

                        {/* Rating */}
                        {place.rating && (
                          <div className="flex items-center gap-2">
                            <div
                              className="flex items-center gap-1 px-2 py-1 rounded-md"
                              style={{ backgroundColor: primary }}
                            >
                              <span className="text-white text-xs font-semibold">
                                {place.rating.toFixed(1)}
                              </span>
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            </div>
                            {place.reviewCount && (
                              <span className="text-xs text-gray-500">
                                ({place.reviewCount.toLocaleString()})
                              </span>
                            )}
                          </div>
                        )}

                        {/* Address */}
                        {place.address && (
                          <div className="flex items-start gap-2 text-xs text-gray-600">
                            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span className="break-words">{place.address}</span>
                          </div>
                        )}
                      </div>

                      {/* Add Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToDay(place);
                        }}
                        className="w-full mt-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:shadow-lg active:scale-95"
                        style={{
                          backgroundColor: secondary,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <Plus className="w-4 h-4 inline mr-1" />
                        {t("addToDay", lang)} {selectedDayId}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card >

      {/* Place Details Modal */}
      < PlaceDetailsModal
        place={selectedPlace}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)
        }
        language={language}
        onAddToDay={handleAddToDay}
        showAddButton={true}
      />
    </>
  );
}