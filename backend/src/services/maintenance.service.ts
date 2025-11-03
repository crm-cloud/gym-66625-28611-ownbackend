import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../config/database.js';
import { ApiError } from '../middleware/errorHandler.js';

// Define maintenance record status type
type MaintenanceStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// Define maintenance record type
export interface MaintenanceRecord {
  id: string;
  equipment_id: string;
  reported_by: string | null;
  assigned_to: string | null;
  title: string;
  description: string | null;
  status: MaintenanceStatus;
  priority: 'low' | 'medium' | 'high';
  scheduled_date: Date | null;
  completed_date: Date | null;
  created_at: Date;
  updated_at: Date;
  user?: {
    full_name: string | null;
    email: string;
  } | null;
  equipment?: {
    name: string;
    serial_number: string | null;
  } | null;
}

export class MaintenanceService {
  /**
   * Get maintenance records with filters
   */
  async getRecords(filters: {
    equipment_id?: string;
    status?: string;
    from_date?: string;
    to_date?: string;
  }) {
    const { equipment_id, status, from_date, to_date } = filters;

    const where: Prisma.maintenance_recordsWhereInput = {};
    
    if (equipment_id) where.equipment_id = equipment_id;
    if (status) where.status = status as any;
    
    if (from_date || to_date) {
      where.maintenance_date = {};
      if (from_date) where.maintenance_date.gte = new Date(from_date);
      if (to_date) where.maintenance_date.lte = new Date(to_date);
    }

    const records = await prisma.maintenance_records.findMany({
      where,
      include: {
        equipment: {
          select: {
            name: true,
            type: true,
          },
        },
        performer: {
          select: {
            full_name: true,
          },
        },
      },
      orderBy: {
        maintenance_date: 'desc',
      },
    });

    return records.map(record => ({
      ...record,
      equipment_name: record.equipment?.name,
      equipment_type: record.equipment?.type,
      performed_by_name: record.performer?.full_name,
    }));
  }

  /**
   * Get maintenance record by ID
   */
  async getRecordById(id: string) {
    const record = await prisma.maintenance_records.findUnique({
      where: { id },
      include: {
        equipment: {
          select: {
            name: true,
            type: true,
          },
        },
        performer: {
          select: {
            full_name: true,
          },
        },
      },
    });

    if (!record) {
      throw new ApiError('Maintenance record not found', 404);
    }

    return {
      ...record,
      equipment_name: record.equipment?.name,
      equipment_type: record.equipment?.type,
      performed_by_name: record.performer?.full_name,
    };
  }

  /**
   * Create a new maintenance record
   */
  async createRecord(
    data: {
      equipment_id: string;
      maintenance_date?: Date;
      maintenance_type: string;
      description?: string;
      cost?: number;
      status?: string;
      next_maintenance_date?: Date;
      notes?: string;
    },
    performedBy: string
  ) {
    const record = await prisma.maintenance_records.create({
      data: {
        equipment_id: data.equipment_id,
        maintenance_date: data.maintenance_date || new Date(),
        maintenance_type: data.maintenance_type as any,
        description: data.description,
        cost: data.cost ? new Prisma.Decimal(data.cost) : undefined,
        performed_by: performedBy,
        status: (data.status as any) || 'pending',
        next_maintenance_date: data.next_maintenance_date,
        notes: data.notes,
      },
    });

    return { id: record.id, message: 'Maintenance record created' };
  }

  /**
   * Update an existing maintenance record
   */
  async updateRecord(
    id: string,
    data: {
      status?: string;
      description?: string;
      cost?: number;
      next_maintenance_date?: Date;
      notes?: string;
      resolved_at?: Date;
      resolved_by?: string;
    }
  ) {
    const updateData: Prisma.maintenance_recordsUpdateInput = {
      updated_at: new Date(),
    };

    if (data.status) updateData.status = data.status as any;
    if (data.description) updateData.description = data.description;
    if (data.cost !== undefined) updateData.cost = new Prisma.Decimal(data.cost);
    if (data.next_maintenance_date) updateData.next_maintenance_date = data.next_maintenance_date;
    if (data.notes) updateData.notes = data.notes;
    if (data.resolved_at) updateData.resolved_at = data.resolved_at;
    if (data.resolved_by) updateData.resolved_by = data.resolved_by;

    await prisma.maintenance_records.update({
      where: { id },
      data: updateData,
    });

    return { success: true, message: 'Maintenance record updated' };
  }

  /**
   * Delete a maintenance record
   */
  async deleteRecord(id: string) {
    await prisma.maintenance_records.delete({
      where: { id },
    });
  }
}

export const maintenanceService = new MaintenanceService();
