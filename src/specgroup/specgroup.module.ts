

import { Module } from "@nestjs/common";
import { SpecificationGroupService } from "./specgroup.service";
import { SpecificationGroupController } from "./specgroup.controller";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
  controllers: [SpecificationGroupController],
  providers: [SpecificationGroupService, PrismaService],
  exports: [SpecificationGroupService], // ✅ Export if needed in other modules
})
export class SpecificationGroupModule {}
