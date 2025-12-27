import { Card } from "./ui/card";
import { Destination } from "../types";
import { t } from "../locales/translations";
import { useThemeColors } from "../hooks/useThemeColors";
import { MapPin, Star, Clock, DollarSign, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

interface ViewModePlaceDetailsProps {
  place: Destination | null;
  language: "EN" | "VI";
  currency: "USD" | "VND";
}

export function ViewModePlaceDetails({
  place,
  language,
  currency,
}: ViewModePlaceDetailsProps) {
  const lang = language.toLowerCase() as "en" | "vi";
  const { primary, secondary, light } = useThemeColors();

  const calculateTotalCost = (costs: { amount: number }[]) => {
    return costs.reduce((sum, cost) => sum + cost.amount, 0);
  };

  const convertCurrency = (amount: number) => {
    if (currency === "VND") {
      return (amount * 24000).toLocaleString("vi-VN");
    }
    return amount.toFixed(2);
  };

  if (!place) {
    return (
      <Card
        className="flex-1 rounded-[24px] border border-[#E5E7EB] flex items-center justify-center"
        style={{
          background: "#FFFFFF",
          boxShadow: "0 18px 40px rgba(15,23,42,0.06)",
        }}
      >
        <div className="text-center text-gray-400 p-8">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">{t("selectPlaceToView", lang)}</p>
        </div>
      </Card>
    );
  }

  const totalCost = place.costs?.length
    ? calculateTotalCost(place.costs)
    : null;

  return (
    <Card
      className="flex-1 rounded-[24px] border border-[#E5E7EB] overflow-hidden"
      style={{
        background: "#FFFFFF",
        boxShadow: "0 18px 40px rgba(15,23,42,0.06)",
      }}
    >
      <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="p-6 space-y-4">
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
              <MapPin
                className="w-5 h-5 mt-0.5 shrink-0"
                style={{ color: primary }}
              />
              <span className="text-sm">{place.address}</span>
            </div>
          )}

          {/* Open Hours */}
          {place.openHours && (
            <div className="flex items-center gap-3 text-gray-700">
              <Clock
                className="w-5 h-5 shrink-0"
                style={{ color: primary }}
              />
              <span className="text-sm">{place.openHours}</span>
            </div>
          )}

          {/* Price Level */}
          {place.priceLevel && (
            <div className="flex items-center gap-3 text-gray-700">
              <DollarSign
                className="w-5 h-5 shrink-0"
                style={{ color: primary }}
              />
              <span className="text-sm">
                {"💰".repeat(place.priceLevel)}
                <span className="text-gray-300">
                  {"💰".repeat(4 - place.priceLevel)}
                </span>
              </span>
            </div>
          )}

          {/* Total Cost Display */}
          {totalCost !== null && totalCost > 0 && (
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {t("totalCost", lang)}:
                </span>
                <span
                  className="text-lg"
                  style={{ color: primary, fontWeight: 600 }}
                >
                  {currency === "USD" ? "$" : "₫"}
                  {convertCurrency(totalCost)}
                </span>
              </div>
            </div>
          )}

          {/* Costs Breakdown */}
          {place.costs && place.costs.length > 0 && place.costs[0].amount > 0 && (
            <div className="pt-2">
              <p className="text-xs text-gray-500 mb-2">
                {t("costBreakdown", lang)}:
              </p>
              <div className="space-y-1">
                {place.costs.map((cost) => (
                  <div
                    key={cost.id}
                    className="text-sm text-gray-600 flex justify-between"
                  >
                    <span>
                      {cost.detail || (language === "EN" ? "Cost" : "Chi phí")}
                    </span>
                    <span className="text-gray-900">
                      {currency === "USD" ? "$" : "₫"}
                      {convertCurrency(cost.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Website Button */}
          {place.website && (
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full relative overflow-hidden group transition-all duration-200"
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
                <ExternalLink
                  className="w-4 h-4 mr-2"
                  style={{ color: primary }}
                />
                <span style={{ color: primary }}>
                  {language === "EN" ? "Website" : "Trang web"}
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}