import { Controller, Post, Get, Param, Patch, Query, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/notification.dto';

 
  @Controller('notifications')
export class NotificationController {
  prisma: any;
  constructor(private readonly notificationService: NotificationService) {}


  @Get()
  async getAllNotifications() {
    return this.notificationService.getAllNotifications();
  }
  
  @Post("")
  async createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.createNotification(createNotificationDto);
  }


  @Get("counts")
  async getNotificationCounts() {
    return this.notificationService.getNotificationCounts();
  }
  @Patch('read/all')
  async markAllAsRead() {
    return this.notificationService.markAllAsRead();
  }
  
  @Patch(':notificationId/read')
  markAsRead(@Param('notificationId') notificationId: string) {
    return this.notificationService.markAsRead(notificationId);
  }
}