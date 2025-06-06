// correct
import { forwardRef, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from 'prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { RfqModule } from './rfq/rfq.module';
import { UploadModule } from './upload/upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ServiceModule } from './service/service.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
 
import { AllExceptionsFilter } from './utils/all-exceptions.filter';
import { ApiResponseInterceptor } from './utils/api-response.interceptor';
import { ContactModule } from './contact/contact.module';
import { SpecificationModule } from './specification/specification.module';
import { EmailModule } from './email/email.module';
import { CustomerModule } from './customer/customer.module';
import { SpecificationGroupModule} from './specgroup/specgroup.module'; // Import SpecGroupModule
import { NotificationModule } from './notification/notification.module';
import { NotificationsGateway } from './notification/notification.gateway';



@Module({
  imports: [
    UploadModule, PrismaModule, UserModule, NotificationsGateway,CommonModule, AuthModule, AuthorizationModule, RfqModule,ContactModule,CustomerModule,SpecificationGroupModule,NotificationModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../assets'), // Point this to the directory containing your static files
      serveRoot: '/cdn',
      exclude: ['/index.html'],
    }),
    ServiceModule,
    SpecificationModule,
    EmailModule,
  ],
  controllers: [AppController,],
  providers: [AppService,
    // {
    //   provide:APP_GUARD,
    //   useClass:JwtAuthGuard
    // },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiResponseInterceptor,
    },
  
  ],
})
export class AppModule { }

