import { Module } from '@nestjs/common';
import { SpecificationsService } from './specification.service';
import { SpecificationsController } from './specification.controller';
import { PrismaService } from '../../prisma/prisma.service'; // Import PrismaService

@Module({
  providers: [SpecificationsService, PrismaService], // Ensure PrismaService is provided
  controllers: [SpecificationsController],
  exports: [SpecificationsService], // Export if needed in other modules
})
export class SpecificationModule {}
