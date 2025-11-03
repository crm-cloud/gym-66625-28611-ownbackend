import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';

export class MaintenanceService {
  /**
   * Get maintenance records
   */
  async getRecords(filters: any) {
    const { equipment_id, status, from_date, to_date } = filters;

    let whereConditions: string[] = [];
    if (equipment_id) whereConditions.push(`equipment_id = '${equipment_id}'`);
    if (status) whereConditions.push(`status = '${status}'`);
    if (from_date) whereConditions.push(`maintenance_date >= '${from_date}'`);
    if (to_date) whereConditions.push(`maintenance_date <= '${to_date}'`);

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const records = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        mr.*,
        e.name as equipment_name,
        e.type as equipment_type,
        p.full_name as performed_by_name
      FROM maintenance_records mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN profiles p ON mr.performed_by = p.user_id
      ${whereClause}
      ORDER BY mr.maintenance_date DESC
    `);

    return records;
  }

  /**
   * Get record by ID
   */
  async getRecordById(id: string) {
    const record = await prisma.$queryRaw<any[]>`
      SELECT 
        mr.*,
        e.name as equipment_name,
        e.type as equipment_type,
        p.full_name as performed_by_name
      FROM maintenance_records mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN profiles p ON mr.performed_by = p.user_id
      WHERE mr.id = ${id}
      LIMIT 1
    `;

    if (!record || record.length === 0) {
      throw new ApiError('Maintenance record not found', 404);
    }

    return record[0];
  }

  /**
   * Create maintenance record
   */
  async createRecord(data: any, performedBy: string) {
    const recordId = crypto.randomUUID();

    await prisma.$executeRaw`
      INSERT INTO maintenance_records (
        id, equipment_id, maintenance_date, maintenance_type,
        description, cost, performed_by, status, next_maintenance_date
      ) VALUES (
        ${recordId},
        ${data.equipment_id},
        ${data.maintenance_date || new Date()},
        ${data.maintenance_type},
        ${data.description || null},
        ${data.cost || null},
        ${performedBy},
        ${data.status || 'pending'},
        ${data.next_maintenance_date || null}
      )
    `;

    return { id: recordId, message: 'Maintenance record created' };
  }

  /**
   * Update maintenance record
   */
  async updateRecord(id: string, data: any) {
    await prisma.$executeRaw`
      UPDATE maintenance_records
      SET 
        status = COALESCE(${data.status}, status),
        description = COALESCE(${data.description}, description),
        cost = COALESCE(${data.cost}, cost),
        next_maintenance_date = COALESCE(${data.next_maintenance_date}, next_maintenance_date),
        updated_at = NOW()
      WHERE id = ${id}
    `;

    return { success: true, message: 'Maintenance record updated' };
  }

  /**
   * Delete maintenance record
   */
  async deleteRecord(id: string) {
    await prisma.$executeRaw`
      DELETE FROM maintenance_records WHERE id = ${id}
    `;
  }
}

export const maintenanceService = new MaintenanceService();
