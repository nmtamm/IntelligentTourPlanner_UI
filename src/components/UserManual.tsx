import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, BookOpen, CheckCircle2, Circle, Home, Settings, Map, Route, Save, Sparkles } from "lucide-react";
import { t } from "../locales/translations";
import { useThemeColors } from "../hooks/useThemeColors";

interface TutorialStep {
  id: string;
  titleKey: string;
  descriptionKey: string;
  targetSelector: string;
  position: "top" | "bottom" | "left" | "right" | "center";
}

interface Chapter {
  id: string;
  titleKey: string;
  icon: any;
  steps: TutorialStep[];
}

const getTutorialChapters = (): Chapter[] => [
  {
    id: "getting-started",
    titleKey: "chapter_getting_started",
    icon: Home,
    steps: [
      {
        id: "welcome",
        titleKey: "tutorial_welcome_title",
        descriptionKey: "tutorial_welcome_desc",
        targetSelector: "",
        position: "center",
      },
      {
        id: "login",
        titleKey: "tutorial_login_title",
        descriptionKey: "tutorial_login_desc",
        targetSelector: '[data-tutorial="login"]',
        position: "bottom",
      },
      {
        id: "language",
        titleKey: "tutorial_language_title",
        descriptionKey: "tutorial_language_desc",
        targetSelector: '[data-tutorial="language"]',
        position: "bottom",
      },
      {
        id: "currency",
        titleKey: "tutorial_currency_title",
        descriptionKey: "tutorial_currency_desc",
        targetSelector: '[data-tutorial="currency"]',
        position: "bottom",
      },
    ],
  },
  {
    id: "planning",
    titleKey: "chapter_planning",
    icon: Settings,
    steps: [
      {
        id: "generate-plan",
        titleKey: "tutorial_generate_title",
        descriptionKey: "tutorial_generate_desc",
        targetSelector: '[data-tutorial="generate-plan"]',
        position: "bottom",
      },
      {
        id: "trip-name",
        titleKey: "tutorial_tripname_title",
        descriptionKey: "tutorial_tripname_desc",
        targetSelector: '[data-tutorial="trip-name"]',
        position: "bottom",
      },
      {
        id: "members",
        titleKey: "tutorial_members_title",
        descriptionKey: "tutorial_members_desc",
        targetSelector: '[data-tutorial="members"]',
        position: "bottom",
      },
      {
        id: "start-date",
        titleKey: "tutorial_startdate_title",
        descriptionKey: "tutorial_startdate_desc",
        targetSelector: '[data-tutorial="start-date"]',
        position: "bottom",
      },
      {
        id: "end-date",
        titleKey: "tutorial_enddate_title",
        descriptionKey: "tutorial_enddate_desc",
        targetSelector: '[data-tutorial="end-date"]',
        position: "bottom",
      },
    ],
  },
  {
    id: "destinations",
    titleKey: "chapter_destinations",
    icon: Map,
    steps: [
      {
        id: "day-tabs",
        titleKey: "tutorial_daytabs_title",
        descriptionKey: "tutorial_daytabs_desc",
        targetSelector: '[data-tutorial="day-tabs"]',
        position: "bottom",
      },
      {
        id: "view-all-days",
        titleKey: "tutorial_viewalldays_title",
        descriptionKey: "tutorial_viewalldays_desc",
        targetSelector: '[data-tutorial="view-all-days"]',
        position: "bottom",
      },
      {
        id: "add-destination",
        titleKey: "tutorial_adddest_title",
        descriptionKey: "tutorial_adddest_desc",
        targetSelector: '[data-tutorial="add-destination"]',
        position: "bottom",
      },
      {
        id: "add-cost-item",
        titleKey: "tutorial_addcost_title",
        descriptionKey: "tutorial_addcost_desc",
        targetSelector: '[data-tutorial="add-cost-item"]',
        position: "bottom",
      },
      {
        id: "auto-estimate",
        titleKey: "tutorial_autoestimate_title",
        descriptionKey: "tutorial_autoestimate_desc",
        targetSelector: '[data-tutorial="auto-estimate"]',
        position: "bottom",
      },
    ],
  },
  {
    id: "navigation",
    titleKey: "chapter_navigation",
    icon: Route,
    steps: [
      {
        id: "optimize-route",
        titleKey: "tutorial_optimize_title",
        descriptionKey: "tutorial_optimize_desc",
        targetSelector: '[data-tutorial="optimize-route"]',
        position: "bottom",
      },
      {
        id: "map-view",
        titleKey: "tutorial_mapview_title",
        descriptionKey: "tutorial_mapview_desc",
        targetSelector: '[data-tutorial="map-view"]',
        position: "top",
      },
      {
        id: "route-list",
        titleKey: "tutorial_routelist_title",
        descriptionKey: "tutorial_routelist_desc",
        targetSelector: '[data-tutorial="route-list"]',
        position: "bottom",
      },
      {
        id: "route-guidance",
        titleKey: "tutorial_routeguidance_title",
        descriptionKey: "tutorial_routeguidance_desc",
        targetSelector: '[data-tutorial="route-guidance"]',
        position: "center",
      },
    ],
  },
];

interface UserManualProps {
  isOpen: boolean;
  onClose: () => void;
  language: "EN" | "VI";
}

type ViewMode = "overview" | "tutorial";

export function UserManual({ isOpen, onClose, language }: UserManualProps) {
  const lang = language.toLowerCase() as "en" | "vi";
  const { primary, secondary, accent, light } = useThemeColors();
  const chapters = getTutorialChapters();

  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [tooltipPosition, setTooltipPosition] = useState<any>(null);
  const [highlightBox, setHighlightBox] = useState<any>(null);
  const [cutoutBox, setCutoutBox] = useState<any>(null);

  const currentChapter = chapters[currentChapterIndex];
  const currentStep = currentChapter?.steps[currentStepIndex];
  const isLastStepInChapter = currentStepIndex === currentChapter?.steps.length - 1;
  const isLastChapter = currentChapterIndex === chapters.length - 1;

  // Load completed steps from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tutorial-progress");
    if (saved) {
      try {
        setCompletedSteps(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error("Failed to load tutorial progress");
      }
    }
  }, []);

  // Save completed steps to localStorage
  const markStepCompleted = (stepId: string) => {
    const updated = new Set(completedSteps);
    updated.add(stepId);
    setCompletedSteps(updated);
    localStorage.setItem("tutorial-progress", JSON.stringify(Array.from(updated)));
  };

  useEffect(() => {
    if (!isOpen) {
      setViewMode("overview");
      setCurrentChapterIndex(0);
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  // Calculate position for the tooltip
  const getTooltipPosition = () => {
    if (!currentStep?.targetSelector) {
      return {
        position: "fixed" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10002,
      };
    }

    const element = document.querySelector(currentStep.targetSelector);
    if (!element) {
      return {
        position: "fixed" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10002,
      };
    }

    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    switch (currentStep.position) {
      case "top":
        return {
          position: "absolute" as const,
          top: `${rect.top + scrollTop - 20}px`,
          left: `${rect.left + scrollLeft + rect.width / 2}px`,
          transform: "translate(-50%, -100%)",
          zIndex: 10002,
        };
      case "bottom":
        return {
          position: "absolute" as const,
          top: `${rect.bottom + scrollTop + 20}px`,
          left: `${rect.left + scrollLeft + rect.width / 2}px`,
          transform: "translateX(-50%)",
          zIndex: 10002,
        };
      case "left":
        return {
          position: "absolute" as const,
          top: `${rect.top + scrollTop + rect.height / 2}px`,
          left: `${rect.left + scrollLeft - 20}px`,
          transform: "translate(-100%, -50%)",
          zIndex: 10002,
        };
      case "right":
        return {
          position: "absolute" as const,
          top: `${rect.top + scrollTop + rect.height / 2}px`,
          left: `${rect.right + scrollLeft + 20}px`,
          transform: "translateY(-50%)",
          zIndex: 10002,
        };
      default:
        return {
          position: "fixed" as const,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10002,
        };
    }
  };

  const getHighlightStyle = () => {
    if (!currentStep?.targetSelector) return null;

    const element = document.querySelector(currentStep.targetSelector);
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    return {
      top: rect.top + scrollTop - 8,
      left: rect.left + scrollLeft - 8,
      width: rect.width + 16,
      height: rect.height + 16,
    };
  };

  const getCutoutStyle = () => {
    if (!currentStep?.targetSelector) return null;

    const element = document.querySelector(currentStep.targetSelector);
    if (!element) return null;

    const shouldSpanCard =
      currentStep.id === "add-destination" ||
      currentStep.id === "add-cost-item" ||
      currentStep.id === "map-view";

    if (shouldSpanCard) {
      const cardElement = element.closest("[data-tutorial-card]");
      if (cardElement) {
        const cardRect = cardElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        return {
          top: cardRect.top + scrollTop - 8,
          left: cardRect.left + scrollLeft - 8,
          width: cardRect.width + 16,
          height: cardRect.height + 16,
        };
      }
    }

    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    return {
      top: rect.top + scrollTop - 8,
      left: rect.left + scrollLeft - 8,
      width: rect.width + 16,
      height: rect.height + 16,
    };
  };

  // Update positions
  useEffect(() => {
    if (!isOpen || viewMode !== "tutorial") return;

    const updatePositions = () => {
      setTooltipPosition(getTooltipPosition());
      setHighlightBox(getHighlightStyle());
      setCutoutBox(getCutoutStyle());
    };

    updatePositions();

    if (currentStep?.targetSelector) {
      const element = document.querySelector(currentStep.targetSelector);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
      }
    }

    window.addEventListener("scroll", updatePositions, true);
    window.addEventListener("resize", updatePositions);

    return () => {
      window.removeEventListener("scroll", updatePositions, true);
      window.removeEventListener("resize", updatePositions);
    };
  }, [isOpen, viewMode, currentChapterIndex, currentStepIndex]);

  if (!isOpen) return null;

  const handleNext = () => {
    // Mark current step as completed
    if (currentStep) {
      markStepCompleted(currentStep.id);
    }

    if (isLastStepInChapter) {
      if (isLastChapter) {
        // Completed all chapters
        setViewMode("overview");
      } else {
        // Move to next chapter
        setCurrentChapterIndex(currentChapterIndex + 1);
        setCurrentStepIndex(0);
      }
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    } else if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
      setCurrentStepIndex(chapters[currentChapterIndex - 1].steps.length - 1);
    }
  };

  const handleStartChapter = (chapterIndex: number) => {
    setCurrentChapterIndex(chapterIndex);
    setCurrentStepIndex(0);
    setViewMode("tutorial");
  };

  const handleBackToOverview = () => {
    setViewMode("overview");
  };

  const getChapterProgress = (chapter: Chapter) => {
    const completed = chapter.steps.filter(step => completedSteps.has(step.id)).length;
    return (completed / chapter.steps.length) * 100;
  };

  const getTotalProgress = () => {
    const totalSteps = chapters.reduce((sum, ch) => sum + ch.steps.length, 0);
    return (completedSteps.size / totalSteps) * 100;
  };

  // Overview Mode
  if (viewMode === "overview") {
    return (
      <div
        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: "fadeInScale 0.3s ease-out",
          }}
        >
          {/* Header */}
          <div
            className="p-6 border-b relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
            }}
          >
            {/* Decorative elements */}
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20"
              style={{
                background: `radial-gradient(circle, ${light} 0%, transparent 70%)`,
                transform: "translate(30%, -30%)",
              }}
            />

            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-xl"
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white text-2xl mb-1">
                      {t("userManual", lang)}
                    </h2>
                    <p className="text-white/80 text-sm">
                      {t("learnHowToUse", lang)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg transition-all duration-200 hover:bg-white/20"
                  style={{ color: "white" }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Overall Progress */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/90 text-sm">
                    {t("overallProgress", lang)}
                  </span>
                  <span className="text-white font-medium">
                    {Math.round(getTotalProgress())}%
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${getTotalProgress()}%`,
                      background: light,
                      boxShadow: `0 0 12px ${light}`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Chapters Grid */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chapters.map((chapter, index) => {
                const Icon = chapter.icon;
                const progress = getChapterProgress(chapter);
                const isCompleted = progress === 100;

                return (
                  <button
                    key={chapter.id}
                    onClick={() => handleStartChapter(index)}
                    className="group relative p-6 rounded-xl border-2 text-left transition-all duration-300 overflow-hidden"
                    style={{
                      borderColor: isCompleted ? secondary : "#E5E7EB",
                      background: isCompleted
                        ? `linear-gradient(135deg, ${secondary}10 0%, ${accent}05 100%)`
                        : "white",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                      e.currentTarget.style.boxShadow = `0 12px 24px ${primary}20`;
                      e.currentTarget.style.borderColor = primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                      e.currentTarget.style.borderColor = isCompleted ? secondary : "#E5E7EB";
                    }}
                  >
                    {/* Shimmer effect */}
                    <span
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                      style={{
                        background: `linear-gradient(135deg, ${primary}08 0%, transparent 100%)`,
                        transition: "opacity 0.4s ease-in-out",
                      }}
                    />

                    <div className="relative z-10">
                      {/* Icon and Title */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="p-3 rounded-lg transition-all duration-300 group-hover:scale-110"
                            style={{
                              background: isCompleted
                                ? `linear-gradient(135deg, ${secondary} 0%, ${accent} 100%)`
                                : `${primary}15`,
                            }}
                          >
                            <Icon
                              className="w-6 h-6"
                              style={{
                                color: isCompleted ? "white" : primary,
                              }}
                            />
                          </div>
                          <div>
                            <h3
                              className="mb-1 transition-colors duration-200"
                              style={{
                                color: isCompleted ? secondary : "#374151",
                              }}
                            >
                              {t(chapter.titleKey, lang)}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {chapter.steps.length} {t("steps", lang)}
                            </p>
                          </div>
                        </div>

                        {/* Completion Badge */}
                        {isCompleted && (
                          <div
                            className="p-2 rounded-full"
                            style={{
                              background: `${secondary}20`,
                            }}
                          >
                            <CheckCircle2
                              className="w-5 h-5"
                              style={{ color: secondary }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{Math.round(progress)}% {t("complete", lang)}</span>
                          <span>
                            {chapter.steps.filter(s => completedSteps.has(s.id)).length}/
                            {chapter.steps.length}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${progress}%`,
                              background: isCompleted
                                ? `linear-gradient(90deg, ${secondary} 0%, ${accent} 100%)`
                                : primary,
                            }}
                          />
                        </div>
                      </div>

                      {/* Start/Continue Button */}
                      <div className="mt-4 flex items-center justify-between">
                        <span
                          className="text-sm font-medium transition-colors duration-200"
                          style={{
                            color: primary,
                          }}
                        >
                          {progress > 0 && progress < 100
                            ? t("continue", lang)
                            : progress === 100
                            ? t("review", lang)
                            : t("start", lang)}
                        </span>
                        <ChevronRight
                          className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                          style={{ color: primary }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tutorial Mode
  const totalStepsInChapter = currentChapter.steps.length;
  const currentStepNumber = chapters
    .slice(0, currentChapterIndex)
    .reduce((sum, ch) => sum + ch.steps.length, 0) + currentStepIndex + 1;
  const totalSteps = chapters.reduce((sum, ch) => sum + ch.steps.length, 0);

  return (
    <>
      {/* Backdrop with cutout */}
      <div
        className="fixed inset-0 z-[9999]"
        style={{
          pointerEvents: "all",
          cursor: "not-allowed",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <svg
          className="w-full h-full pointer-events-none"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <defs>
            <mask id="tutorial-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {cutoutBox && (
                <rect
                  x={
                    cutoutBox.left -
                    (window.pageXOffset || document.documentElement.scrollLeft)
                  }
                  y={
                    cutoutBox.top -
                    (window.pageYOffset || document.documentElement.scrollTop)
                  }
                  width={cutoutBox.width}
                  height={cutoutBox.height}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
            <filter id="blur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
            </filter>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.6)"
            mask="url(#tutorial-mask)"
            filter="url(#blur)"
          />
        </svg>
      </div>

      {/* Highlight box border with animation */}
      {highlightBox && (
        <div
          style={{
            position: "absolute",
            top: `${highlightBox.top}px`,
            left: `${highlightBox.left}px`,
            width: `${highlightBox.width}px`,
            height: `${highlightBox.height}px`,
            border: `3px solid ${secondary}`,
            borderRadius: "12px",
            pointerEvents: "none",
            zIndex: 10001,
            boxShadow: `0 0 0 4px ${secondary}40, 0 0 20px ${secondary}60`,
            animation: "pulse-border 2s ease-in-out infinite",
          }}
        />
      )}

      {/* Tooltip */}
      <div
        style={tooltipPosition}
        className="bg-white rounded-xl shadow-2xl max-w-md overflow-hidden"
      >
        <div
          className="p-4"
          style={{
            background: `linear-gradient(135deg, ${primary}10 0%, ${secondary}05 100%)`,
            borderBottom: `2px solid ${secondary}`,
          }}
        >
          {/* Chapter Badge */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: primary,
                color: "white",
              }}
            >
              {t(currentChapter.titleKey, lang)}
            </div>
            <div className="text-xs text-gray-500">
              {currentStepIndex + 1}/{totalStepsInChapter}
            </div>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3
                className="mb-2"
                style={{ color: primary }}
              >
                {t(currentStep.titleKey, lang)}
              </h3>
              <p className="text-gray-700 text-sm">
                {t(currentStep.descriptionKey, lang)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {t("step", lang)} {currentStepNumber} {t("of", lang)} {totalSteps}
              </span>
              <span>{Math.round((currentStepNumber / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(currentStepNumber / totalSteps) * 100}%`,
                  background: `linear-gradient(90deg, ${primary} 0%, ${secondary} 100%)`,
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleBackToOverview}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                color: "#6B7280",
                background: "#F3F4F6",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#E5E7EB";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#F3F4F6";
              }}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-2 flex-1 justify-end">
              {(currentStepIndex > 0 || currentChapterIndex > 0) && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                  style={{
                    color: primary,
                    border: `1.5px solid ${primary}`,
                    background: "white",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${primary}10`;
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t("previous", lang)}
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 flex items-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${secondary} 0%, ${accent} 100%)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = `0 8px 16px ${secondary}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {isLastStepInChapter && isLastChapter
                  ? t("finish", lang)
                  : t("next", lang)}
                {(!isLastStepInChapter || !isLastChapter) && (
                  <ChevronRight className="w-4 h-4" />
                )}
                {isLastStepInChapter && isLastChapter && (
                  <Sparkles className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
