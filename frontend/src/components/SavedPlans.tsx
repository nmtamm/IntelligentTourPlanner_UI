import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Calendar, MapPin, DollarSign, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { DayPlan, Destination } from '../types';
import { t } from '../locales/translations';
import { useThemeColors } from '../hooks/useThemeColors';

interface SavedPlansProps {
  currentUser: string;
  onBack: () => void;
  onLoadPlan: (plan: { id: string; name: string; days: DayPlan[] }) => void;
  onCreateNew: () => void;
  language: 'EN' | 'VI';
}

interface PlanCardProps {
  plan: any;
  onLoadPlan: (plan: { id: string; name: string; days: DayPlan[] }) => void;
  onDelete: (planId: string) => void;
  lang: 'en' | 'vi';
}

function PlanCard({ plan, onLoadPlan, onDelete, lang }: PlanCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const totalDestinations = plan.days.reduce((sum: number, day: DayPlan) => sum + day.destinations.length, 0);
  const totalCost = plan.days.reduce((sum: number, day: DayPlan) =>
    sum + day.destinations.reduce((daySum: number, dest: Destination) =>
      daySum + dest.costs.reduce((costSum: number, cost: any) => costSum + (cost.amount || 0), 0)
      , 0)
    , 0);

  // Determine current state styling - same as DayView place card
  const getCardStyles = () => {
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
        border: '1px solid rgba(112,197,115,1)',
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
    onLoadPlan({ id: plan.id, name: plan.name, days: plan.days });
    toast.success(t('planLoaded', lang));
  };

  return (
    <div
      className="group relative rounded-[20px] p-6 cursor-pointer"
      style={{
        ...getCardStyles(),
        position: 'relative',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={handleCardClick}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-gray-900">{plan.name}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(plan.id);
            }}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            {plan.days.length} {plan.days.length === 1 ? t('day', lang) : t('days', lang)}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            {totalDestinations} {t('destinations', lang)}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign className="w-4 h-4" />
            ${totalCost.toFixed(2)} {t('total', lang)}
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Created {new Date(plan.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

export function SavedPlans({ currentUser, onBack, onLoadPlan, onCreateNew, language }: SavedPlansProps) {
  const [plans, setPlans] = useState<any[]>([]);
  const lang = language.toLowerCase() as 'en' | 'vi';
  const { primary } = useThemeColors();
  const [isCreateButtonHovered, setIsCreateButtonHovered] = useState(false);
  const [isCreateButtonPressed, setIsCreateButtonPressed] = useState(false);

  useEffect(() => {
    loadPlans();
  }, [currentUser]);

  const loadPlans = () => {
    const savedPlans = JSON.parse(localStorage.getItem('tourPlans') || '[]');
    const userPlans = savedPlans.filter((p: any) => p.user === currentUser);
    setPlans(userPlans);
  };

  const deletePlan = (planId: string) => {
    const savedPlans = JSON.parse(localStorage.getItem('tourPlans') || '[]');
    const filteredPlans = savedPlans.filter((p: any) => p.id !== planId);
    localStorage.setItem('tourPlans', JSON.stringify(filteredPlans));
    loadPlans();
    toast.success(t('planDeleted', lang));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg relative overflow-hidden group inline-flex items-center gap-2"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              color: '#374151',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${primary}10`;
              e.currentTarget.style.transform = 'translateX(-4px) scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateX(0) scale(1)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateX(-2px) scale(0.97)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateX(-4px) scale(1.05)';
            }}
          >
            {/* Ripple effect on click */}
            <span
              className="absolute inset-0 opacity-0 group-active:opacity-100 pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${primary}30 0%, transparent 70%)`,
                transition: 'opacity 0.3s ease-out',
              }}
            />

            {/* Shimmer effect on hover */}
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${primary}15 50%, transparent 100%)`,
                animation: 'shimmer 2s ease-in-out infinite',
              }}
            />

            {/* Arrow Icon with bounce animation */}
            <ArrowLeft
              className="w-4 h-4 transition-all duration-300 group-hover:-translate-x-2 group-hover:scale-125"
              style={{
                color: primary,
                filter: `drop-shadow(0 0 6px ${primary}40)`,
              }}
            />

            {/* Text with smooth transition */}
            <span
              className="relative z-10 transition-all duration-200 group-hover:tracking-wide"
              style={{
                color: '#374151',
              }}
            >
              {t('back', lang)}
            </span>
          </button>
        </div>
        <button
          onClick={onCreateNew}
          onMouseEnter={() => setIsCreateButtonHovered(true)}
          onMouseLeave={() => {
            setIsCreateButtonHovered(false);
            setIsCreateButtonPressed(false);
          }}
          onMouseDown={() => setIsCreateButtonPressed(true)}
          onMouseUp={() => setIsCreateButtonPressed(false)}
          className="shrink-0 transition-all"
          style={{
            height: '40px',
            paddingLeft: '24px',
            paddingRight: '24px',
            borderRadius: '999px',
            border: isCreateButtonHovered ? '1px solid #CBD5FF' : '1px solid #E0E7FF',
            background: isCreateButtonPressed ? '#E5ECFF' : (isCreateButtonHovered ? '#F3F6FF' : 'white'),
            color: '#111827',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: isCreateButtonPressed
              ? '0 2px 6px rgba(15,23,42,0.2)'
              : (isCreateButtonHovered ? '0 4px 12px rgba(15,23,42,0.12)' : 'none'),
            transform: isCreateButtonPressed ? 'scale(0.97)' : (isCreateButtonHovered ? 'scale(1.02)' : 'scale(1.00)'),
            transitionDuration: isCreateButtonPressed ? '120ms' : '150ms',
            transitionTimingFunction: isCreateButtonPressed ? 'ease-out' : (isCreateButtonHovered ? 'ease-out' : 'cubic-bezier(0.16,1,0.3,1)'),
          }}
        >
          <Plus
            className="w-4 h-4 transition-transform"
            style={{
              transform: isCreateButtonHovered ? 'rotate(90deg)' : 'rotate(0deg)',
              transitionDuration: '150ms',
              transitionTimingFunction: 'ease-out',
            }}
          />
          <span className="transition-transform" style={{
            transform: isCreateButtonHovered ? 'translateX(1px)' : 'translateX(0px)',
            transitionDuration: '150ms',
          }}>
            {t('createNewPlan', lang)}
          </span>
        </button>
      </div>

      {plans.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">{t('noSavedPlans', lang)}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => {
            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                onLoadPlan={onLoadPlan}
                onDelete={deletePlan}
                lang={lang}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}