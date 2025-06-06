import { Module } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';
import { AuthorizationController } from './authorization.controller';
import { PrismaModule } from 'prisma/prisma.module';
 


@Module({
  imports: [PrismaModule],
  providers: [AuthorizationService],
  controllers: [AuthorizationController],
  exports: [AuthorizationService]
})
export class AuthorizationModule { }
