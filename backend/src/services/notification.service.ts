import { prisma } from '../lib/prisma';

/**
 * Notification Service
 * Handles all notification operations
 */

export interface CreateNotificationData {
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  action_url?: string;
  metadata?: any;
}

class NotificationService {
  /**
   * Create notification
   */
  async createNotification(data: CreateNotificationData) {
    return prisma.notification.create({
      data: {
        user_id: data.user_id,
        title: data.title,
        message: data.message,
        type: data.type,
        action_url: data.action_url,
        metadata: data.metadata,
        is_read: false,
      },
    });
  }

  /**
   * Create bulk notifications
   */
  async createBulkNotifications(notifications: CreateNotificationData[]) {
    return prisma.notification.createMany({
      data: notifications.map(n => ({
        ...n,
        is_read: false,
      })),
    });
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, options?: {
    is_read?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { user_id: userId };
    
    if (options?.is_read !== undefined) {
      where.is_read = options.is_read;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      prisma.notification.count({ where }),
    ]);

    return { notifications, total };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string) {
    return prisma.notification.update({
      where: { notification_id: notificationId },
      data: { 
        is_read: true,
        read_at: new Date(),
      },
    });
  }

  /**
   * Mark all user notifications as read
   */
  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { 
        user_id: userId,
        is_read: false,
      },
      data: { 
        is_read: true,
        read_at: new Date(),
      },
    });
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string) {
    return prisma.notification.delete({
      where: { notification_id: notificationId },
    });
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        user_id: userId,
        is_read: false,
      },
    });
  }

  /**
   * Send membership expiry notifications
   */
  async sendMembershipExpiryNotifications() {
    // Get memberships expiring in next 7 days
    const expiringMemberships = await prisma.membershipSubscription.findMany({
      where: {
        end_date: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        status: 'active',
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    const notifications = expiringMemberships.map(sub => ({
      user_id: sub.member.user_id,
      title: 'Membership Expiring Soon',
      message: `Your membership will expire on ${sub.end_date.toLocaleDateString()}. Please renew to continue.`,
      type: 'warning' as const,
      action_url: '/memberships/renew',
    }));

    if (notifications.length > 0) {
      await this.createBulkNotifications(notifications);
    }

    return notifications.length;
  }

  /**
   * Send payment reminder notifications
   */
  async sendPaymentReminders() {
    // Get pending payments
    const pendingPayments = await prisma.payment.findMany({
      where: {
        status: 'pending',
        due_date: {
          lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Due in 3 days
        },
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    const notifications = pendingPayments.map(payment => ({
      user_id: payment.member.user_id,
      title: 'Payment Reminder',
      message: `You have a pending payment of ₹${payment.amount} due on ${payment.due_date.toLocaleDateString()}.`,
      type: 'info' as const,
      action_url: '/payments',
    }));

    if (notifications.length > 0) {
      await this.createBulkNotifications(notifications);
    }

    return notifications.length;
  }
}

export const notificationService = new NotificationService();
