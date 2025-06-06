import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsGateway } from './notification.gateway';


@Module({
  controllers: [NotificationController],
  providers: [NotificationService, PrismaService,NotificationsGateway],
  exports: [NotificationService,NotificationsGateway],
})
export class NotificationModule {}
