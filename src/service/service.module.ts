
import { Module } from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { PrismaService } from '../../prisma/prisma.service'; // ✅ Ensure PrismaService is imported

@Module({
  providers: [ServiceService, PrismaService], // ✅ PrismaService must be in providers
  controllers: [ServiceController],
  exports: [ServiceService], // ✅ Export if needed in other modules
})
export class ServiceModule {}
