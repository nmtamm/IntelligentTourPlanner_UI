import { useState, useEffect } from "react";
import { X, MapPin, Star, Clock, DollarSign, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Destination } from "../types";
import { t } from "../locales/translations";
import { useThemeColors } from "../hooks/useThemeColors";

interface PlaceDetailsModalProps {
  place: Destination | null;
  isOpen: boolean;
  onClose: () => void;
  language: "EN" | "VI";
  onAddToDay?: (place: Destination) => void;
  showAddButton?: boolean;
  onDelete?: (placeId: string) => void;
  showDeleteButton?: boolean;
}

export function PlaceDetailsModal({
  place,
  isOpen,
  onClose,
  language,
  onAddToDay,
  showAddButton = false,
  onDelete,
  showDeleteButton = false,
}: PlaceDetailsModalProps) {
  const lang = language.toLowerCase() as "en" | "vi";
  const { primary, secondary, light } = useThemeColors();

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !place) return null;

  // Simple map coordinates calculation
  const mapWidth = 500;
  const mapHeight = 600;
  const centerLat = place.lat;
  const centerLng = place.lng;
  const padding = 60;

  // Add some zoom offset to show more area
  const latOffset = 0.02;
  const lngOffset = 0.02;

  const minLat = centerLat - latOffset;
  const maxLat = centerLat + latOffset;
  const minLng = centerLng - lngOffset;
  const maxLng = centerLng + lngOffset;

  const latRange = maxLat - minLat;
  const lngRange = maxLng - minLng;

  const toMapX = (lng: number) => {
    return padding + ((lng - minLng) / lngRange) * (mapWidth - 2 * padding);
  };

  const toMapY = (lat: number) => {
    return (
      mapHeight - (padding + ((lat - minLat) / latRange) * (mapHeight - 2 * padding))
    );
  };

  const markerX = toMapX(centerLng);
  const markerY = toMapY(centerLat);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
        style={{ backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full h-[90vh] overflow-hidden pointer-events-auto animate-modal-appear"
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: "modalAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all duration-200 hover:scale-110 active:scale-95"
            style={{ border: `2px solid ${primary}` }}
          >
            <X className="w-5 h-5" style={{ color: primary }} />
          </button>

          {/* Content */}
          <div className="flex flex-col md:flex-row h-full">
            {/* Left Side - Thumbnail and Map (Stacked Vertically) */}
            <div
              className="w-full md:w-1/2 bg-gradient-to-br from-blue-50 to-blue-100 p-6 flex flex-col gap-4 overflow-y-auto"
              style={{ height: "100%" }}
            >
              {/* Thumbnail Image */}
              {place.imageUrl && (
                <div className="w-full h-64 rounded-xl overflow-hidden shrink-0">
                  <img
                    src={place.imageUrl}
                    alt={place.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Map */}
              <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <div className="relative w-full h-full flex items-center justify-center">
                  <svg
                    width="90%"
                    height="90%"
                    viewBox={`0 0 ${mapWidth} ${mapHeight}`}
                    className="rounded-xl"
                    style={{ background: "#f0f9ff", maxHeight: "90%" }}
                  >
                    {/* Grid lines for realistic map feel */}
                    <defs>
                      <pattern
                        id="grid"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 40 0 L 0 0 0 40"
                          fill="none"
                          stroke="#e0f2fe"
                          strokeWidth="0.5"
                        />
                      </pattern>
                    </defs>
                    <rect width={mapWidth} height={mapHeight} fill="url(#grid)" />

                    {/* Marker Shadow */}
                    <ellipse
                      cx={markerX}
                      cy={markerY + 20}
                      rx="12"
                      ry="4"
                      fill="rgba(0,0,0,0.2)"
                    />

                    {/* Marker Pin */}
                    <g
                      style={{
                        filter: `drop-shadow(0 4px 8px rgba(0,0,0,0.2))`,
                      }}
                    >
                      <circle
                        cx={markerX}
                        cy={markerY}
                        r="14"
                        fill="white"
                        stroke={primary}
                        strokeWidth="4"
                      />
                      <circle cx={markerX} cy={markerY} r="6" fill={primary} />
                    </g>

                    {/* Location name label */}
                    <text
                      x={markerX}
                      y={markerY - 25}
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="600"
                      fill="#1e293b"
                      style={{
                        filter: "drop-shadow(0 1px 2px rgba(255,255,255,0.8))",
                      }}
                    >
                      {place.name.length > 20
                        ? place.name.substring(0, 20) + "..."
                        : place.name}
                    </text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Right Side - Details (Scrollable) */}
            <div className="w-full md:w-1/2 p-6 overflow-y-auto h-full">
              <div className="space-y-4">
                {/* Place Name */}
                <h2 className="text-gray-900 text-2xl">{place.name}</h2>

                {/* Place Type */}
                {place.placeType && (
                  <div>
                    <span
                      className="inline-block text-sm px-3 py-1.5 rounded-lg"
                      style={{
                        backgroundColor: light,
                        color: primary,
                      }}
                    >
                      {place.placeType}
                    </span>
                  </div>
                )}

                {/* Rating & Review Count */}
                {place.rating && (
                  <div className="flex items-center gap-2">
                    {/* Rating Badge */}
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ backgroundColor: primary }}
                    >
                      <span className="text-white text-sm">
                        {place.rating.toFixed(1)}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((starIndex) => {
                          const rating = place.rating || 0;
                          const isFullStar = starIndex <= Math.floor(rating);
                          const isHalfStar =
                            starIndex === Math.ceil(rating) && rating % 1 !== 0;

                          return (
                            <div key={starIndex} className="relative w-3.5 h-3.5">
                              <Star className="w-3.5 h-3.5 fill-gray-400 text-gray-400 absolute" />
                              {isFullStar && (
                                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 absolute" />
                              )}
                              {isHalfStar && (
                                <div className="absolute overflow-hidden w-1/2 h-full">
                                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Review Count */}
                    {place.reviewCount && (
                      <span className="text-sm text-gray-600">
                        ({place.reviewCount.toLocaleString()}{" "}
                        {language === "EN" ? "reviews" : "đánh giá"})
                      </span>
                    )}
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-gray-200" />

                {/* Address */}
                {place.address && (
                  <div className="flex items-start gap-3 text-gray-700">
                    <MapPin className="w-5 h-5 mt-0.5 shrink-0" style={{ color: primary }} />
                    <span className="text-sm">{place.address}</span>
                  </div>
                )}

                {/* Open Hours */}
                {place.openHours && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="w-5 h-5 shrink-0" style={{ color: primary }} />
                    <span className="text-sm">{place.openHours}</span>
                  </div>
                )}

                {/* Price Level */}
                {place.priceLevel && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <DollarSign className="w-5 h-5 shrink-0" style={{ color: primary }} />
                    <span className="text-sm">
                      {"💰".repeat(place.priceLevel)}
                      <span className="text-gray-300">
                        {"💰".repeat(4 - place.priceLevel)}
                      </span>
                    </span>
                  </div>
                )}

                {/* Costs (if already added to trip) */}
                {place.costs &&
                  place.costs.length > 0 &&
                  place.costs[0].amount > 0 && (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">
                        {language === "EN" ? "Your Costs:" : "Chi phí của bạn:"}
                      </p>
                      <div className="space-y-1">
                        {place.costs.map((cost) => (
                          <div
                            key={cost.id}
                            className="text-sm text-gray-600 flex justify-between"
                          >
                            <span>
                              {cost.detail ||
                                (language === "EN" ? "Cost" : "Chi phí")}
                            </span>
                            <span className="text-gray-900">${cost.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  {/* Website Link */}
                  {place.website && (
                    <Button
                      variant="outline"
                      className="flex-1 relative overflow-hidden group transition-all duration-200"
                      onClick={() => window.open(place.website, "_blank")}
                      style={{
                        borderColor: primary,
                        borderWidth: "2px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = `0 8px 20px ${primary}20`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" style={{ color: primary }} />
                      <span style={{ color: primary }}>
                        {language === "EN" ? "Website" : "Trang web"}
                      </span>
                    </Button>
                  )}

                  {/* Add to Day Button */}
                  {showAddButton && onAddToDay && (
                    <Button
                      className="flex-1 relative overflow-hidden group transition-all duration-200"
                      onClick={() => onAddToDay(place)}
                      style={{
                        backgroundColor: secondary,
                        color: "white",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = `0 8px 20px ${secondary}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {t("addToDay", lang)}
                    </Button>
                  )}

                  {/* Delete Button */}
                  {showDeleteButton && onDelete && (
                    <Button
                      className="flex-1 relative overflow-hidden group transition-all duration-200"
                      onClick={() => onDelete(place.id)}
                      style={{
                        backgroundColor: "red",
                        color: "white",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = `0 8px 20px red40`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" style={{ color: "white" }} />
                      {t("delete", lang)}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>
        {`
          @keyframes modalAppear {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}
      </style>
    </>
  );
}