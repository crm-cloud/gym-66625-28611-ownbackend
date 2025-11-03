import prisma from '../config/database';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export class SystemService {
  /**
   * Get detailed system health
   */
  async getDetailedHealth() {
    try {
      // Database health
      const dbHealth = await this.checkDatabaseHealth();
      
      // Get system metrics
      const [gymCount, memberCount, paymentCount] = await Promise.all([
        prisma.$queryRaw<any[]>`SELECT COUNT(*)::int as count FROM gyms`,
        prisma.$queryRaw<any[]>`SELECT COUNT(*)::int as count FROM members`,
        prisma.$queryRaw<any[]>`SELECT COUNT(*)::int as count FROM payments WHERE created_at >= NOW() - INTERVAL '24 hours'`
      ]);

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: dbHealth,
        metrics: {
          total_gyms: gymCount[0].count,
          total_members: memberCount[0].count,
          payments_24h: paymentCount[0].count
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: 'connected',
        response_time_ms: 0 // TODO: Measure actual response time
      };
    } catch (error) {
      return {
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get list of available backups
   */
  async getBackups() {
    try {
      const backupDir = path.join(process.cwd(), 'backups');
      
      // Ensure backup directory exists
      await fs.mkdir(backupDir, { recursive: true });
      
      // Read backup directory
      const files = await fs.readdir(backupDir);
      
      // Filter for backup files and get their stats
      const backups = await Promise.all(
        files
          .filter(file => file.endsWith('.sql') || file.endsWith('.dump'))
          .map(async (file) => {
            const filePath = path.join(backupDir, file);
            const stats = await fs.stat(filePath);
            return {
              id: file,
              filename: file,
              size: stats.size,
              created_at: stats.birthtime,
              path: filePath,
              type: file.endsWith('.sql') ? 'sql' : 'dump'
            };
          })
      );
      
      // Sort by creation date (newest first)
      backups.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      
      return backups;
    } catch (error) {
      console.error('Error listing backups:', error);
      throw new Error('Failed to list backups');
    }
  }

  /**
   * Create database backup using pg_dump
   */
  async createBackup(createdBy: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    const backupDir = path.join(process.cwd(), 'backups');
    const backupPath = path.join(backupDir, filename);

    try {
      // Ensure backups directory exists
      await fs.mkdir(backupDir, { recursive: true });

      // Parse database URL
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) {
        throw new Error('DATABASE_URL not configured');
      }

      // Extract connection details from URL
      const url = new URL(dbUrl);
      const dbUser = url.username;
      const dbPass = url.password;
      const dbHost = url.hostname;
      const dbPort = url.port || '5432';
      const dbName = url.pathname.replace(/^\//, '');

      // Build pg_dump command
      const pgDumpPath = process.env.PG_DUMP_PATH || 'pg_dump';
      const env = { ...process.env };
      
      // Set PGPASSWORD in environment if password is provided
      if (dbPass) {
        env.PGPASSWORD = dbPass;
      }

      const command = [
        `"${pgDumpPath}"`,
        `-h ${dbHost}`,
        `-p ${dbPort}`,
        `-U ${dbUser}`,
        `-d ${dbName}`,
        '-F c', // Custom format (compressed)
        '-f', backupPath
      ].join(' ');

      // Execute pg_dump
      const { stderr } = await execAsync(command, { env });
      
      if (stderr && !stderr.includes('WARNING')) {
        console.error('pg_dump stderr:', stderr);
        throw new Error(`Backup failed: ${stderr}`);
      }

      // Get file stats
      const stats = await fs.stat(backupPath);

      // Log the backup in the database
      await prisma.system_backups.create({
        data: {
          filename,
          path: backupPath,
          size: stats.size,
          created_by: createdBy,
          status: 'completed'
        }
      });

      return {
        success: true,
        message: 'Backup created successfully',
        filename,
        path: backupPath,
        size: stats.size,
        created_at: new Date()
      };
    } catch (error) {
      // Log the failed backup attempt
      await prisma.system_backups.create({
        data: {
          filename,
          path: backupPath,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          created_by: createdBy
        }
      });
      
      console.error('Backup error:', error);
      throw new Error(`Backup creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Restore backup
   */
  async restoreBackup(backupId: string, restoredBy: string) {
    // TODO: Implement backup restoration
    return {
      success: true,
      message: 'Backup restoration will be implemented',
      backup_id: backupId
    };
  }

  /**
   * Get system logs with filtering
   */
  async getLogs(filters: {
    level?: string;
    from_date?: string;
    to_date?: string;
    limit?: number;
  }) {
    try {
      const { level, from_date, to_date, limit = 100 } = filters;
      
      // Build where clause
      const where: any = {};
      
      if (level) {
        where.level = level;
      }
      
      if (from_date || to_date) {
        where.timestamp = {};
        if (from_date) {
          where.timestamp.gte = new Date(from_date);
        }
        if (to_date) {
          where.timestamp.lte = new Date(to_date);
        }
      }
      
      // Query logs from database
      const logs = await prisma.system_logs.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: Math.min(Number(limit) || 100, 1000), // Max 1000 logs at once
        select: {
          id: true,
          level: true,
          message: true,
          timestamp: true,
          meta: true,
          user_id: true,
          ip_address: true,
          user_agent: true
        }
      });
      
      return logs;
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw new Error('Failed to fetch system logs');
    }
  }
}

export const systemService = new SystemService();
