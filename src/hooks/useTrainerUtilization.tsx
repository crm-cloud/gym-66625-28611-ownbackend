import { useState, useCallback, useEffect } from 'react';
import { TrainerProfile, TrainerAssignment } from '@/types/trainer';
import { TrainerUtilizationMetrics, TrainerUtilizationTracker, UtilizationConfig } from '@/utils/trainerUtilization';
import { mockTrainers } from '@/utils/mockData';

const DEFAULT_UTILIZATION_CONFIG: UtilizationConfig = {
  maxDailySessions: 8,
  maxWeeklyHours: 40,
  maxClientsPerTrainer: 25,
  targetUtilizationPercentage: 75,
  loadBalancingWeight: 0.3
};

interface UseTrainerUtilizationReturn {
  metrics: Map<string, TrainerUtilizationMetrics>;
  getTrainerMetrics: (trainerId: string) => TrainerUtilizationMetrics | null;
  updateMetrics: (trainers: TrainerProfile[], assignments: TrainerAssignment[]) => void;
  getUtilizationScore: (trainerId: string) => number;
  isTrainerAvailable: (trainerId: string) => boolean;
  getTrainersByUtilization: (trainerIds: string[]) => string[];
  getOverutilizedTrainers: () => TrainerUtilizationMetrics[];
  getUnderutilizedTrainers: () => TrainerUtilizationMetrics[];
  getBranchUtilizationSummary: (branchId: string) => {
    averageUtilization: number;
    totalTrainers: number;
    activeTrainers: number;
    overutilizedCount: number;
    underutilizedCount: number;
  };
  isLoading: boolean;
  config: UtilizationConfig;
}

export const useTrainerUtilization = (
  branchId: string,
  customConfig?: Partial<UtilizationConfig>
): UseTrainerUtilizationReturn => {
  const [metrics, setMetrics] = useState<Map<string, TrainerUtilizationMetrics>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  
  const config: UtilizationConfig = {
    ...DEFAULT_UTILIZATION_CONFIG,
    ...customConfig
  };

  const [utilizationTracker] = useState(() => new TrainerUtilizationTracker(config));

  const updateMetrics = useCallback((
    trainers: TrainerProfile[], 
    assignments: TrainerAssignment[]
  ) => {
    setIsLoading(true);
    
    try {
      const newMetrics = new Map<string, TrainerUtilizationMetrics>();
      const dateRange = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)     // 7 days ahead
      };

      trainers
        .filter(trainer => trainer.branchId === branchId)
        .forEach(trainer => {
          const trainerMetrics = utilizationTracker.calculateUtilization(
            trainer, 
            assignments, 
            dateRange
          );
          newMetrics.set(trainer.id, trainerMetrics);
        });

      setMetrics(newMetrics);
    } finally {
      setIsLoading(false);
    }
  }, [branchId, utilizationTracker]);

  const getTrainerMetrics = useCallback((trainerId: string): TrainerUtilizationMetrics | null => {
    return metrics.get(trainerId) || null;
  }, [metrics]);

  const getUtilizationScore = useCallback((trainerId: string): number => {
    return utilizationTracker.getUtilizationScore(trainerId);
  }, [utilizationTracker]);

  const isTrainerAvailable = useCallback((trainerId: string): boolean => {
    return utilizationTracker.isTrainerAvailableForAssignment(trainerId);
  }, [utilizationTracker]);

  const getTrainersByUtilization = useCallback((trainerIds: string[]): string[] => {
    return utilizationTracker.getTrainersByUtilization(trainerIds);
  }, [utilizationTracker]);

  const getOverutilizedTrainers = useCallback((): TrainerUtilizationMetrics[] => {
    return Array.from(metrics.values())
      .filter(metric => metric.capacityUsed > config.targetUtilizationPercentage + 10)
      .sort((a, b) => b.capacityUsed - a.capacityUsed);
  }, [metrics, config.targetUtilizationPercentage]);

  const getUnderutilizedTrainers = useCallback((): TrainerUtilizationMetrics[] => {
    return Array.from(metrics.values())
      .filter(metric => metric.capacityUsed < config.targetUtilizationPercentage - 15)
      .sort((a, b) => a.capacityUsed - b.capacityUsed);
  }, [metrics, config.targetUtilizationPercentage]);

  const getBranchUtilizationSummary = useCallback((branchId: string) => {
    const branchTrainers = mockTrainers.filter(t => t.branchId === branchId);
    const branchMetrics = Array.from(metrics.values())
      .filter(metric => branchTrainers.some(t => t.id === metric.trainerId));

    const totalTrainers = branchTrainers.length;
    const activeTrainers = branchTrainers.filter(t => t.isActive && t.status === 'active').length;
    
    const averageUtilization = branchMetrics.length > 0 
      ? branchMetrics.reduce((sum, m) => sum + m.capacityUsed, 0) / branchMetrics.length 
      : 0;

    const overutilizedCount = branchMetrics.filter(
      m => m.capacityUsed > config.targetUtilizationPercentage + 10
    ).length;

    const underutilizedCount = branchMetrics.filter(
      m => m.capacityUsed < config.targetUtilizationPercentage - 15
    ).length;

    return {
      averageUtilization,
      totalTrainers,
      activeTrainers,
      overutilizedCount,
      underutilizedCount
    };
  }, [metrics, config.targetUtilizationPercentage]);

  // Auto-update metrics when component mounts or branch changes
  useEffect(() => {
    // In a real app, this would fetch assignments from an API
    const mockAssignments: TrainerAssignment[] = []; // Add mock assignments here if needed
    const branchTrainers = mockTrainers.filter(t => t.branchId === branchId);
    
    if (branchTrainers.length > 0) {
      updateMetrics(branchTrainers, mockAssignments);
    }
  }, [branchId, updateMetrics]);

  return {
    metrics,
    getTrainerMetrics,
    updateMetrics,
    getUtilizationScore,
    isTrainerAvailable,
    getTrainersByUtilization,
    getOverutilizedTrainers,
    getUnderutilizedTrainers,
    getBranchUtilizationSummary,
    isLoading,
    config
  };
};