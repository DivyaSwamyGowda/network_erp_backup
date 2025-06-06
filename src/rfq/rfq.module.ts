// correct 
import { Module } from '@nestjs/common';
import { RfqService } from './rfq.service';
import { RfqController } from './rfq.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadModule } from '../upload/upload.module'; // Import UploadModule
import { UploadService } from 'src/upload/upload.service';
import { EmailService } from '../email/email.service'; 
import { EmailModule } from 'src/email/email.module';
 import { CustomerModule } from '../customer/customer.module'; 
 import { NotificationModule } from '../notification/notification.module';
 import { NewRFQService } from './newrfq.service';


@Module({
  imports: [EmailModule,UploadModule,CustomerModule,NotificationModule],
  providers: [RfqService,PrismaService,UploadService,
    NewRFQService
  ],
  controllers: [RfqController],
  exports: [RfqService,
    NewRFQService
  ], 
})
export class RfqModule {}




