import { Prisma } from '@prisma/client';
import prisma from '../config/database.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { ApiError } from '../utils/ApiError.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { logger } from '../utils/logger.js';

interface SystemLog {
  id: string;
  severity: string;
  description: string;
  event_time: Date;
  details: Record<string, unknown>;
  user_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  user?: {
    full_name: string | null;
    email: string;
  } | null;
}

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
        prisma.gyms.count(),
        prisma.members.count(),
        prisma.payments.count({
          where: {
            created_at: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        })
      ]);

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: dbHealth,
        metrics: {
          total_gyms: gymCount,
          total_members: memberCount,
          payments_24h: paymentCount
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
    const start = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - start;
      
      return {
        status: 'connected',
        response_time_ms: responseTime
      };
    } catch (error) {
      return {
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        response_time_ms: Date.now() - start
      };
    }
  }

  /**
   * Get list of available backups
   */
  async getBackups() {
    try {
      const backups = await prisma.system_backups.findMany({
        orderBy: {
          created_at: 'desc',
        },
        select: {
          id: true,
          filename: true,
          path: true,
          size: true,
          status: true,
          created_at: true,
          completed_at: true,
          creator: {
            select: {
              user_id: true,
              full_name: true,
              email: true
            }
          }
        }
      });

      return backups;
    } catch (error) {
      console.error('Error listing backups:', error);
      throw new Error('Failed to retrieve backup list');
    }
  }

  /**
   * Create database backup using pg_dump
   */
  async createBackup(createdBy: string) {
    const backupId = uuidv4();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    const backupDir = path.join(process.cwd(), 'backups');
    const backupPath = path.join(backupDir, filename);

    // Create backup record in database
    const backupRecord = await prisma.system_backups.create({
      data: {
        id: backupId,
        filename,
        path: backupPath,
        status: 'in_progress',
        created_by: createdBy,
        metadata: {
          type: 'full',
          method: 'pg_dump'
        }
      }
    });

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
      const dbName = url.pathname.replace(/^\//, '').split('?')[0];

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
        '-f', `"${backupPath}"`
      ].join(' ');

      // Execute pg_dump
      const { stderr } = await execAsync(command, { env });
      
      if (stderr && !stderr.includes('WARNING')) {
        throw new Error(`pg_dump error: ${stderr}`);
      }

      // Get file stats
      const stats = await fs.stat(backupPath);

      // Update backup record
      await prisma.system_backups.update({
        where: { id: backupId },
        data: {
          status: 'completed',
          size: stats.size,
          completed_at: new Date(),
          metadata: {
            ...(backupRecord.metadata as Prisma.JsonObject || {}),
            size: stats.size,
            completed_at: new Date().toISOString()
          }
        }
      });

      return {
        id: backupId,
        success: true,
        message: 'Backup created successfully',
        filename,
        path: backupPath,
        size: stats.size,
        created_at: backupRecord.created_at,
        completed_at: new Date()
      };
    } catch (error) {
      // Update backup record with error
      await prisma.system_backups.update({
        where: { id: backupId },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          metadata: {
            ...(backupRecord.metadata as Prisma.JsonObject || {}),
            error: error instanceof Error ? error.message : 'Unknown error',
            failed_at: new Date().toISOString()
          }
        }
      });

      throw new Error(`Backup creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Restore database from backup
   */
  async restoreBackup(backupId: string, restoredBy: string) {
    // Get backup record
    const backup = await prisma.system_backups.findUnique({
      where: { id: backupId }
    });

    if (!backup) {
      throw new Error('Backup not found');
    }

    if (backup.status !== 'completed') {
      throw new Error('Cannot restore from an incomplete or failed backup');
    }

    try {
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
      const dbName = url.pathname.replace(/^\//, '').split('?')[0];

      // Build pg_restore command
      const pgRestorePath = process.env.PG_RESTORE_PATH || 'pg_restore';
      const env = { ...process.env };
      
      // Set PGPASSWORD in environment if password is provided
      if (dbPass) {
        env.PGPASSWORD = dbPass;
      }

      const command = [
        `"${pgRestorePath}"`,
        `-h ${dbHost}`,
        `-p ${dbPort}`,
        `-U ${dbUser}`,
        '-d', `"${dbName}"`,
        '--clean', // Clean (drop) database objects before recreating
        '--if-exists', // Use IF EXISTS when dropping objects
        '--no-owner', // Skip restoration of object ownership
        '--no-privileges', // Prevent restoration of access privileges
        '--no-comments', // Skip restoration of comments
        '--no-tablespaces', // Do not output commands to select tablespaces
        '--single-transaction', // Execute as a single transaction
        `"${backup.path}"`
      ].join(' ');

      // Execute pg_restore
      const { stderr } = await execAsync(command, { env });
      
      if (stderr && !stderr.includes('WARNING')) {
        throw new Error(`pg_restore error: ${stderr}`);
      }

      // Log the restoration
      await prisma.system_events.create({
        data: {
          event_category: 'system',
          event_type: 'backup_restored',
          description: `Database restored from backup: ${backup.filename}`,
          details: {
            backup_id: backup.id,
            restored_by: restoredBy,
            filename: backup.filename,
            path: backup.path,
            size: backup.size
          }
        }
      });

      return {
        success: true,
        message: 'Database restored successfully',
        backup_id: backupId,
        restored_at: new Date()
      };
    } catch (error) {
      // Log the error
      await prisma.system_events.create({
        data: {
          event_category: 'system',
          event_type: 'backup_restore_failed',
          severity: 'error',
          description: `Failed to restore database from backup: ${backup.filename}`,
          details: {
            backup_id: backup.id,
            error: error instanceof Error ? error.message : 'Unknown error',
            restored_by: restoredBy
          }
        }
      });

      throw new Error(`Backup restoration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get system logs with filtering
   */
  async getLogs(filters: {
    level?: string;
    from_date?: string;
    to_date?: string;
    limit?: number;
    search?: string;
  }) {
    const { level, from_date, to_date, limit = 100, search } = filters;
    
    try {
      const where: any = {};
      
      // Apply level filter
      if (level) where.level = level;
      
      // Apply date range filter
      if (from_date || to_date) {
        where.timestamp = {};
        if (from_date) where.timestamp.gte = new Date(from_date);
        if (to_date) where.timestamp.lte = new Date(to_date);
      }
      
      // Apply search filter
      if (search) {
        where.OR = [
          { message: { contains: search, mode: 'insensitive' } },
          { meta: { path: ['$'], string_contains: search } }
        ];
      }
      
      // Query logs from database
      const logs = await prisma.system_events.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: Math.min(Number(limit), 1000), // Max 1000 logs at once
        include: {
          user: {
            select: {
              full_name: true,
              email: true
            }
          }
        }
      });
      
      // Format the response
      return logs.map((log: SystemLog) => ({
        id: log.id,
        level: log.severity,
        message: log.description,
        timestamp: log.event_time,
        meta: log.details,
        user_id: log.user_id,
        ip_address: log.ip_address,
        user_agent: log.user_agent,
        user: log.user
      }));
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw new Error('Failed to fetch system logs');
    }
  }
}

export const systemService = new SystemService();
