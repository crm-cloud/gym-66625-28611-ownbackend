import prisma from '../config/database';
import { CreateTeamMemberInput, UpdateTeamMemberInput, CreateShiftInput, UpdateShiftInput, TeamQueryInput, ShiftsQueryInput } from '../validation/team.validation';

export class TeamService {
  async createTeamMember(data: CreateTeamMemberInput, createdBy: string) {
    const teamMember = await prisma.team_members.create({
      data: {
        ...data,
        hire_date: new Date(data.hire_date),
        created_by: createdBy
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return teamMember;
  }

  async getTeamMembers(query: TeamQueryInput) {
    const { branch_id, position, employment_type, is_active, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (branch_id) where.branch_id = branch_id;
    if (position) where.position = { contains: position, mode: 'insensitive' };
    if (employment_type) where.employment_type = employment_type;
    if (is_active !== undefined) where.is_active = is_active;

    const [members, total] = await Promise.all([
      prisma.team_members.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              full_name: true
            }
          },
          branch: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { hire_date: 'desc' },
        skip,
        take: limit
      }),
      prisma.team_members.count({ where })
    ]);

    return {
      members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getTeamMember(memberId: string) {
    const member = await prisma.team_members.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!member) {
      throw new Error('Team member not found');
    }

    return member;
  }

  async updateTeamMember(memberId: string, data: UpdateTeamMemberInput) {
    const updateData: any = { ...data };
    if (data.hire_date) {
      updateData.hire_date = new Date(data.hire_date);
    }

    const member = await prisma.team_members.update({
      where: { id: memberId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return member;
  }

  async deleteTeamMember(memberId: string) {
    await prisma.team_members.delete({
      where: { id: memberId }
    });
  }

  async createShift(data: CreateShiftInput, createdBy: string) {
    const shift = await prisma.work_shifts.create({
      data: {
        ...data,
        shift_date: new Date(data.shift_date),
        created_by: createdBy
      },
      include: {
        team_member: {
          include: {
            user: {
              select: {
                id: true,
                full_name: true
              }
            }
          }
        }
      }
    });

    return shift;
  }

  async getShifts(query: ShiftsQueryInput) {
    const { team_member_id, branch_id, from_date, to_date, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (team_member_id) where.team_member_id = team_member_id;
    if (branch_id) where.branch_id = branch_id;
    if (from_date || to_date) {
      where.shift_date = {};
      if (from_date) where.shift_date.gte = new Date(from_date);
      if (to_date) where.shift_date.lte = new Date(to_date);
    }

    const [shifts, total] = await Promise.all([
      prisma.work_shifts.findMany({
        where,
        include: {
          team_member: {
            include: {
              user: {
                select: {
                  id: true,
                  full_name: true
                }
              }
            }
          }
        },
        orderBy: { shift_date: 'desc' },
        skip,
        take: limit
      }),
      prisma.work_shifts.count({ where })
    ]);

    return {
      shifts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updateShift(shiftId: string, data: UpdateShiftInput) {
    const updateData: any = { ...data };
    if (data.shift_date) {
      updateData.shift_date = new Date(data.shift_date);
    }

    const shift = await prisma.work_shifts.update({
      where: { id: shiftId },
      data: updateData
    });

    return shift;
  }

  async deleteShift(shiftId: string) {
    await prisma.work_shifts.delete({
      where: { id: shiftId }
    });
  }
}

export const teamService = new TeamService();
