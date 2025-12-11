import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Calendar, MapPin, DollarSign, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { DayPlan, Destination } from '../types';
import { t } from '../locales/translations';

interface SavedPlansProps {
  currentUser: string;
  onBack: () => void;
  onLoadPlan: (plan: { id: string; name: string; days: DayPlan[] }) => void;
  onCreateNew: () => void;
  language: 'EN' | 'VI';
}

export function SavedPlans({ currentUser, onBack, onLoadPlan, onCreateNew, language }: SavedPlansProps) {
  const [plans, setPlans] = useState<any[]>([]);
  const lang = language.toLowerCase() as 'en' | 'vi';

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
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back', lang)}
          </Button>
          <h2 className="text-gray-900">{t('mySavedPlans', lang)}</h2>
        </div>
        <Button onClick={onCreateNew} className="bg-[#004DB6] hover:bg-[#003d8f]">
          <Plus className="w-4 h-4 mr-2" />
          {t('createNewPlan', lang)}
        </Button>
      </div>

      {plans.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">{t('noSavedPlans', lang)}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const totalDestinations = plan.days.reduce((sum: number, day: DayPlan) => sum + day.destinations.length, 0);
            const totalCost = plan.days.reduce((sum: number, day: DayPlan) => 
              sum + day.destinations.reduce((daySum: number, dest: Destination) => 
                daySum + dest.costs.reduce((costSum: number, cost: any) => costSum + (cost.amount || 0), 0)
              , 0)
            , 0);

            return (
              <Card 
                key={plan.id} 
                className="p-4 space-y-3 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-[#70C573]"
                onClick={() => {
                  onLoadPlan({ id: plan.id, name: plan.name, days: plan.days });
                  toast.success(t('planLoaded', lang));
                }}
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-gray-900">{plan.name}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePlan(plan.id);
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
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}