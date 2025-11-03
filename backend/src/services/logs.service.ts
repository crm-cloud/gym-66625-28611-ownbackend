import prisma from '../config/database';

export class LogsService {
  /**
   * Get email logs
   */
  async getEmailLogs(filters: any) {
    const { status, from_date, to_date, page = 1, limit = 50 } = filters;

    let whereConditions: string[] = [];
    if (status) whereConditions.push(`status = '${status}'`);
    if (from_date) whereConditions.push(`sent_at >= '${from_date}'`);
    if (to_date) whereConditions.push(`sent_at <= '${to_date}'`);

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    // Note: This assumes an email_logs table exists
    // If not, this will need to be created
    const [logs, totalResult] = await Promise.all([
      prisma.$queryRawUnsafe(`
        SELECT * FROM email_logs
        ${whereClause}
        ORDER BY sent_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `).catch(() => []), // Return empty array if table doesn't exist
      
      prisma.$queryRawUnsafe<any[]>(`
        SELECT COUNT(*)::int as total FROM email_logs ${whereClause}
      `).catch(() => [{ total: 0 }])
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total: totalResult[0].total,
        totalPages: Math.ceil(totalResult[0].total / limit)
      }
    };
  }

  /**
   * Get SMS logs
   */
  async getSMSLogs(filters: any) {
    const { status, from_date, to_date, page = 1, limit = 50 } = filters;

    let whereConditions: string[] = [];
    if (status) whereConditions.push(`status = '${status}'`);
    if (from_date) whereConditions.push(`sent_at >= '${from_date}'`);
    if (to_date) whereConditions.push(`sent_at <= '${to_date}'`);

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    // Note: This assumes an sms_logs table exists
    const [logs, totalResult] = await Promise.all([
      prisma.$queryRawUnsafe(`
        SELECT * FROM sms_logs
        ${whereClause}
        ORDER BY sent_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `).catch(() => []),
      
      prisma.$queryRawUnsafe<any[]>(`
        SELECT COUNT(*)::int as total FROM sms_logs ${whereClause}
      `).catch(() => [{ total: 0 }])
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total: totalResult[0].total,
        totalPages: Math.ceil(totalResult[0].total / limit)
      }
    };
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(filters: any) {
    const { action, user_id, from_date, to_date, page = 1, limit = 50 } = filters;

    let whereConditions: string[] = [];
    if (action) whereConditions.push(`action = '${action}'`);
    if (user_id) whereConditions.push(`user_id = '${user_id}'`);
    if (from_date) whereConditions.push(`created_at >= '${from_date}'`);
    if (to_date) whereConditions.push(`created_at <= '${to_date}'`);

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    // Note: This assumes an audit_logs table exists
    const [logs, totalResult] = await Promise.all([
      prisma.$queryRawUnsafe(`
        SELECT 
          al.*,
          p.full_name as user_name,
          p.email as user_email
        FROM audit_logs al
        LEFT JOIN profiles p ON al.user_id = p.user_id
        ${whereClause}
        ORDER BY al.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `).catch(() => []),
      
      prisma.$queryRawUnsafe<any[]>(`
        SELECT COUNT(*)::int as total FROM audit_logs ${whereClause}
      `).catch(() => [{ total: 0 }])
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total: totalResult[0].total,
        totalPages: Math.ceil(totalResult[0].total / limit)
      }
    };
  }
}

export const logsService = new LogsService();
