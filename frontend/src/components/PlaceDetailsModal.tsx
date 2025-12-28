import React, { useState, useEffect } from "react";
import { X, MapPin, Star, Clock, DollarSign, ExternalLink, Trash2, Wallet } from "lucide-react";
import { Button } from "./ui/button";
import { Destination } from "../types";
import { t } from "../locales/translations";
import { useThemeColors } from "../hooks/useThemeColors";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvent, Polyline } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import { getPlaceById } from "../utils/serp";
import { parseAmount } from "../utils/parseAmount";
interface PlaceDetailsModalProps {
  place: Destination | null;
  isOpen?: boolean;
  onClose: () => void;
  language: "EN" | "VI";
  onAddToDay?: (place: Destination) => void;
  showAddButton?: boolean;
  onDelete?: (placeId: string) => void;
  showDeleteButton?: boolean;
  currency: "USD" | "VND";
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
  currency,
}: PlaceDetailsModalProps) {
  if (!isOpen || !place) return null;

  const lang = language.toLowerCase() as "en" | "vi";
  const { primary, secondary, light } = useThemeColors();
  const [detailedDestination, setDetailedDestination] = useState<Destination | null>(null);
  const currencySymbol = currency === 'USD' ? 'USD' : 'VND';

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

  useEffect(() => {
    let isMounted = true;
    getPlaceById(place.id).then((result) => {
      if (isMounted) setDetailedDestination(result);
    });
    return () => { isMounted = false; };
  }, [place.id]);

  const hasValidCoords =
    typeof place.latitude === "number" &&
    typeof place.longitude === "number" &&
    !isNaN(place.latitude) &&
    !isNaN(place.longitude);

  const defaultCenter: [number, number] = [10.770048, 106.699707];
  const mapCenter: [number, number] = hasValidCoords
    ? [place.latitude, place.longitude]
    : defaultCenter;

  function MapCenterUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
      map.setView(center);
    }, [center, map]);
    return null;
  }
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
              {detailedDestination?.thumbnail && (
                <div className="w-full h-64 rounded-xl overflow-hidden shrink-0">
                  <img
                    src={detailedDestination.thumbnail}
                    alt={place.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Map */}
              <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <div className="relative w-full h-full flex items-center justify-center">
                  <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <MapCenterUpdater center={mapCenter} />
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {hasValidCoords && (
                      <Marker position={mapCenter}>
                        <Popup>{place.name}</Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
              </div>
            </div>

            {/* Right Side - Details (Scrollable) */}
            <div className="w-full md:w-1/2 p-6 overflow-y-auto h-full">
              <div className="space-y-4">
                {/* Place Name */}
                <h2 className="text-gray-900 text-2xl">{place.name}</h2>

                {/* Place Type */}
                {detailedDestination?.type && (
                  <div>
                    <span
                      className="inline-block text-sm px-3 py-1.5 rounded-lg"
                      style={{
                        backgroundColor: light,
                        color: primary,
                      }}
                    >
                      {detailedDestination.type}
                    </span>
                  </div>
                )}

                {/* Rating & Review Count */}
                {detailedDestination?.rating && (
                  <div className="flex items-center gap-2">
                    {/* Rating Badge */}
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ backgroundColor: primary }}
                    >
                      <span className="text-white text-sm">
                        {detailedDestination.rating.toFixed(1)}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((starIndex) => {
                          const rating = detailedDestination?.rating !== undefined && detailedDestination?.rating !== null
                            ? detailedDestination.rating
                            : 4.5;
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
                    {detailedDestination?.reviews && (
                      <span className="text-sm text-gray-600">
                        ({detailedDestination?.reviews.toLocaleString()}{" "}
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
                {detailedDestination?.hours && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="w-5 h-5 shrink-0" style={{ color: primary }} />
                    <span className="text-sm">
                      {detailedDestination.hours.split("·").map((part, idx) => (
                        <React.Fragment key={idx}>
                          {part.trim()}
                          {idx < detailedDestination.hours.split("·").length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </span>
                  </div>
                )}

                {/* Price Level */}
                {detailedDestination?.price && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Wallet className="w-4 h-4" />
                    {(() => {
                      const parsed = parseAmount(detailedDestination.price);
                      return parsed.isApprox && parsed.min !== parsed.max
                        ? `${parsed.min.toLocaleString()} \u2013 ${parsed.max.toLocaleString()}`
                        : parsed.min.toLocaleString();
                    })()} {currencySymbol}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  {/* Website Link */}
                  {detailedDestination?.website && (
                    <Button
                      variant="outline"
                      className="flex-1 relative overflow-hidden group transition-all duration-200"
                      onClick={() => window.open(detailedDestination.website, "_blank")}
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