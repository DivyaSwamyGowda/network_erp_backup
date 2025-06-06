import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Notification } from '@prisma/client';
import { formatToIST } from '../utils/date.utils';
import { NotificationsGateway } from './notification.gateway';
import { Cron, CronExpression } from '@nestjs/schedule';
import { parse, format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { getPastDateInIST } from '../utils/date.utils';


@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService,private readonly notificationGateway: NotificationsGateway) {}


  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteOldReadNotifications() {
    const twoDaysAgoIST = getPastDateInIST(2); // Get date in IST
  
    const deleted = await this.prisma.notification.deleteMany({
      where: {
        isRead: true,
        createdAt: { lte: twoDaysAgoIST }, // Use IST-based date
      },
    });
  
    console.log(`🗑️ Deleted ${deleted.count} old read notifications.`);
  }
  



  async createNotification({ rfqId, user, customerId,message, contactId,}
  : {
    rfqId?: string;
    user: string;
    customerId: string;
    message: string;
    contactId?: string;
  }) {
    try {
      console.log(`🚀 [createNotification] Called with:`, { rfqId, user, customerId, message, contactId });
  
      // ✅ Validate required fields before proceeding
      if (!customerId) {
        console.error('❌ Missing customerId. Notification not created.');
        return;
      }
      const type = rfqId ? 'RFQ' : 'MESSAGE';
      if (type === 'MESSAGE') { rfqId = null;}
      if (type === 'RFQ') {contactId = null;}
        
      let finalMessage = message || '';
      // 🔍 Check if notification already exists for this RFQ (only if RFQ type)
      if (type === 'RFQ' && rfqId) {
        const rfqDetails = await this.prisma.rfq.findUnique({
          where: { id: rfqId },
          include: {
            services: true, 
          },
        });
        if (!rfqDetails) {
          console.warn(`⚠️ RFQ not found: ${rfqId}. Skipping notification.`);
          return;
        }
        console.log(`🎯 [createNotification] RFQ Services Found:`, rfqDetails.services);
  
        const serviceNames = rfqDetails.services.map(service => service.name).join(', ') || 'No services selected';
        finalMessage = `New RFQ created. Services: ${serviceNames}`;
      }
  
      // ✅ Create a new notification
      const newNotification = await this.prisma.notification.create({
        data: {
          type,
          user: user || 'Unknown',
          // message: message || (type === 'RFQ' ? 'New RFQ created' : 'New message arrived')
          message:finalMessage,
          rfqId,
          contactId,
          customerId,
          isRead: false,
          createdAt: new Date(),
        },
      });
      const { date, time } = formatToIST(newNotification.createdAt);

  
      console.log(`✅ [createNotification] Notification created successfully: ${newNotification.id}`);
  
      // ✅ Count unread notifications for RFQs and messages
      const unreadRfqCount = await this.prisma.notification.count({
        where: { type: 'RFQ', isRead: false },
      });
  
      const unreadMessageCount = await this.prisma.notification.count({
        where: { type: 'MESSAGE', isRead: false },
      });

      console.log(`🔍 Unread Counts - RFQs: ${unreadRfqCount}, Messages: ${unreadMessageCount}`);
  
      // 🔄 Update the notification with the correct counts
      await this.prisma.notification.updateMany({
        where: { id: newNotification.id },
        // where: { customerId },
        data: {
          rfqCount: unreadRfqCount,
          messageCount: unreadMessageCount,
        },
      });
  
      console.log(`🔔 [createNotification] Notification updated with counts for ${type}: ${rfqId || contactId}`);


      this.notificationGateway.server.emit('newNotification', {
        type,
        user,
        message: finalMessage,
        rfqId,
        contactId,
        customerId,
        unreadRfqCount,
        unreadMessageCount,
      });

  
      return {
        ...newNotification,
        date,  
        time,  
      };
    } catch (error) {
      console.error('❌ Error in createNotification:', error);
      throw error;
    }
  }
          
  

  async markAllAsRead() {
    try {
      await this.prisma.notification.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      });
  
      const unreadRfqCount = await this.prisma.notification.count({
        where: { type: 'RFQ', isRead: false },
      });
  
      const unreadMessageCount = await this.prisma.notification.count({
        where: { type: 'MESSAGE', isRead: false },
      });
  
      this.notificationGateway.server.emit('notificationRead', {
        unreadRfqCount,
        unreadMessageCount,
      });
  
      return { message: 'All notifications marked as read' };
    } catch (error) {
      console.error('❌ Error marking notifications as read:', error);
      throw error;
    }
  }
  

  async getNotificationCounts() {
    const rfqCount = await this.prisma.notification.count({
      where: { type: "RFQ", isRead: false },
    });
    const messageCount = await this.prisma.notification.count({
      where: { type: "MESSAGE", isRead: false },
    });
    return { rfqCount, messageCount };

 }
  

  async getAllNotifications() {
    // Fetch unread notifications
    const notifications = await this.prisma.notification.findMany({
      where: { isRead: false },
      orderBy: { createdAt: 'desc' },
    });
  
    // Count unread RFQs and Messages
    const unreadRfqCount = await this.prisma.notification.count({
      where: { type: 'RFQ', isRead: false },
    });
  
    const unreadMessageCount = await this.prisma.notification.count({
      where: { type: 'MESSAGE', isRead: false },
    });
  
    // Format notifications with date, time, and counts
    return notifications.map(notification => {
      const { date, time } = formatToIST(notification.createdAt);
      return {
        ...notification,
        date,
        time,
        rfqCount: unreadRfqCount,       // ✅ Adding RFQ count
        messageCount: unreadMessageCount // ✅ Adding Message count
      };
    });
  }
  
  async markAsRead(notificationId: string) {
    // Mark the notification as read
    const notification = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  
    // Update the unread counts
    const unreadRfqCount = await this.prisma.notification.count({
      where: { type: "RFQ", isRead: false },
    });
  
    const unreadMessageCount = await this.prisma.notification.count({
      where: { type: "MESSAGE", isRead: false },
    });
  
    // Optionally, update the notification counts wherever you store them
    await this.prisma.notification.updateMany({
      data: {
        rfqCount: unreadRfqCount,
        messageCount: unreadMessageCount,
      },
    });
  
    console.log(`✅ Notification ${notificationId} marked as read. Counts updated.`);
    return notification;
  }
}  