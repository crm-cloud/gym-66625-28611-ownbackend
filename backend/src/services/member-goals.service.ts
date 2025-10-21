import prisma from '../config/database';
import { CreateGoalInput, UpdateGoalInput, LogProgressInput, GoalsQueryInput } from '../validation/member-goals.validation';

export class MemberGoalsService {
  async createGoal(data: CreateGoalInput, createdBy: string) {
    const member = await prisma.members.findUnique({
      where: { id: data.member_id }
    });

    if (!member) {
      throw new Error('Member not found');
    }

    const goal = await prisma.member_goals.create({
      data: {
        ...data,
        start_date: new Date(data.start_date),
        target_date: new Date(data.target_date),
        created_by: createdBy
      },
      include: {
        member: {
          select: {
            id: true,
            full_name: true,
            email: true
          }
        }
      }
    });

    return goal;
  }

  async getGoals(query: GoalsQueryInput) {
    const { member_id, goal_type, status, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (member_id) where.member_id = member_id;
    if (goal_type) where.goal_type = goal_type;
    if (status) where.status = status;

    const [goals, total] = await Promise.all([
      prisma.member_goals.findMany({
        where,
        include: {
          member: {
            select: {
              id: true,
              full_name: true,
              email: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.member_goals.count({ where })
    ]);

    return {
      goals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getGoalById(goalId: string) {
    const goal = await prisma.member_goals.findUnique({
      where: { id: goalId },
      include: {
        member: {
          select: {
            id: true,
            full_name: true,
            email: true
          }
        }
      }
    });

    if (!goal) {
      throw new Error('Goal not found');
    }

    return goal;
  }

  async updateGoal(goalId: string, data: UpdateGoalInput) {
    const updateData: any = { ...data };
    if (data.target_date) {
      updateData.target_date = new Date(data.target_date);
    }

    const goal = await prisma.member_goals.update({
      where: { id: goalId },
      data: updateData,
      include: {
        member: {
          select: {
            id: true,
            full_name: true,
            email: true
          }
        }
      }
    });

    return goal;
  }

  async deleteGoal(goalId: string) {
    await prisma.member_goals.delete({
      where: { id: goalId }
    });
  }

  async logProgress(goalId: string, data: LogProgressInput) {
    const goal = await prisma.member_goals.findUnique({
      where: { id: goalId }
    });

    if (!goal) {
      throw new Error('Goal not found');
    }

    const progress = await prisma.progress_entries.create({
      data: {
        goal_id: goalId,
        value: data.value,
        notes: data.notes,
        recorded_at: data.recorded_at ? new Date(data.recorded_at) : new Date()
      }
    });

    // Update current value on goal
    await prisma.member_goals.update({
      where: { id: goalId },
      data: { current_value: data.value }
    });

    return progress;
  }

  async getProgress(goalId: string) {
    const entries = await prisma.progress_entries.findMany({
      where: { goal_id: goalId },
      orderBy: { recorded_at: 'desc' }
    });

    return entries;
  }
}

export const memberGoalsService = new MemberGoalsService();
