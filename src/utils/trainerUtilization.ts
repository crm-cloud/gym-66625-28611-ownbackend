import { TrainerProfile, TrainerAssignment, TrainerSpecialty } from '@/types/trainer';

export interface TrainerUtilizationMetrics {
  trainerId: string;
  dailySessions: number;
  weeklyHours: number;
  monthlyRevenue: number;
  clientCount: number;
  capacityUsed: number; // percentage 0-100
  specialtyDistribution: Record<string, number>;
  averageSessionRating: number;
  lastAssignmentDate: Date | null;
}

export interface UtilizationConfig {
  maxDailySessions: number;
  maxWeeklyHours: number;
  maxClientsPerTrainer: number;
  targetUtilizationPercentage: number;
  loadBalancingWeight: number;
}

export class TrainerUtilizationTracker {
  private config: UtilizationConfig;
  private metrics: Map<string, TrainerUtilizationMetrics> = new Map();

  constructor(config: UtilizationConfig) {
    this.config = config;
  }

  calculateUtilization(
    trainer: TrainerProfile,
    assignments: TrainerAssignment[],
    dateRange: { start: Date; end: Date }
  ): TrainerUtilizationMetrics {
    const trainerAssignments = assignments.filter(
      a => a.trainerId === trainer.id &&
      a.scheduledDate >= dateRange.start &&
      a.scheduledDate <= dateRange.end
    );

    const dailySessions = this.countDailySessions(trainerAssignments, new Date());
    const weeklyHours = this.calculateWeeklyHours(trainerAssignments);
    const monthlyRevenue = this.calculateMonthlyRevenue(trainerAssignments);
    const clientCount = new Set(trainerAssignments.map(a => a.memberId)).size;
    
    const maxPossibleHours = this.config.maxWeeklyHours;
    const capacityUsed = Math.min((weeklyHours / maxPossibleHours) * 100, 100);

    const specialtyDistribution = this.calculateSpecialtyDistribution(trainerAssignments);
    const averageSessionRating = this.calculateAverageRating(trainerAssignments);
    const lastAssignmentDate = this.getLastAssignmentDate(trainerAssignments);

    const metrics: TrainerUtilizationMetrics = {
      trainerId: trainer.id,
      dailySessions,
      weeklyHours,
      monthlyRevenue,
      clientCount,
      capacityUsed,
      specialtyDistribution,
      averageSessionRating,
      lastAssignmentDate
    };

    this.metrics.set(trainer.id, metrics);
    return metrics;
  }

  private countDailySessions(assignments: TrainerAssignment[], date: Date): number {
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return assignments.filter(a => {
      const assignmentDate = new Date(a.scheduledDate);
      return assignmentDate >= today && assignmentDate < tomorrow;
    }).length;
  }

  private calculateWeeklyHours(assignments: TrainerAssignment[]): number {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    return assignments
      .filter(a => a.scheduledDate >= weekStart && a.scheduledDate < weekEnd)
      .reduce((total, a) => total + (a.duration / 60), 0);
  }

  private calculateMonthlyRevenue(assignments: TrainerAssignment[]): number {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return assignments
      .filter(a => 
        a.scheduledDate >= monthStart && 
        a.scheduledDate <= monthEnd &&
        a.isPaid
      )
      .reduce((total, a) => total + a.amount, 0);
  }

  private calculateSpecialtyDistribution(assignments: TrainerAssignment[]): Record<string, number> {
    const distribution: Record<string, number> = {};

    assignments.forEach(a => {
      if (a.sessionType_detail) {
        const specialty = a.sessionType_detail as string;
        distribution[specialty] = (distribution[specialty] || 0) + 1;
      }
    });

    return distribution;
  }

  private calculateAverageRating(assignments: TrainerAssignment[]): number {
    const ratedAssignments = assignments.filter(a => a.memberRating !== undefined);
    if (ratedAssignments.length === 0) return 0;
    
    const totalRating = ratedAssignments.reduce((sum, a) => sum + (a.memberRating || 0), 0);
    return totalRating / ratedAssignments.length;
  }

  private getLastAssignmentDate(assignments: TrainerAssignment[]): Date | null {
    if (assignments.length === 0) return null;
    
    return new Date(Math.max(...assignments.map(a => a.scheduledDate.getTime())));
  }

  getUtilizationScore(trainerId: string): number {
    const metrics = this.metrics.get(trainerId);
    if (!metrics) return 0;

    // Lower utilization = higher score for load balancing
    const utilizationScore = 100 - metrics.capacityUsed;
    const recentActivityBonus = this.getRecentActivityBonus(metrics);
    const capacityAvailabilityBonus = this.getCapacityAvailabilityBonus(metrics);

    return (utilizationScore * 0.6) + (recentActivityBonus * 0.2) + (capacityAvailabilityBonus * 0.2);
  }

  private getRecentActivityBonus(metrics: TrainerUtilizationMetrics): number {
    if (!metrics.lastAssignmentDate) return 100; // New trainers get high priority
    
    const daysSinceLastAssignment = Math.floor(
      (Date.now() - metrics.lastAssignmentDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastAssignment <= 1) return 0;
    if (daysSinceLastAssignment <= 3) return 25;
    if (daysSinceLastAssignment <= 7) return 50;
    return 100;
  }

  private getCapacityAvailabilityBonus(metrics: TrainerUtilizationMetrics): number {
    const sessionsToday = metrics.dailySessions;
    const remainingCapacity = this.config.maxDailySessions - sessionsToday;
    
    return Math.max(0, (remainingCapacity / this.config.maxDailySessions) * 100);
  }

  isTrainerAvailableForAssignment(trainerId: string): boolean {
    const metrics = this.metrics.get(trainerId);
    if (!metrics) return true;

    return (
      metrics.dailySessions < this.config.maxDailySessions &&
      metrics.capacityUsed < 95 && // 95% max capacity
      metrics.clientCount < this.config.maxClientsPerTrainer
    );
  }

  getTrainersByUtilization(trainerIds: string[]): string[] {
    return trainerIds
      .map(id => ({
        id,
        score: this.getUtilizationScore(id)
      }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.id);
  }
}