

import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { SpecificationGroupService } from './specGroup.service';
import { CreateSpecificationGroupDto, UpdateSpecificationGroupDto } from './dto/specGroup.dto';

@Controller("specifications")
export class SpecificationGroupController {
  constructor(private readonly specificationGroupService: SpecificationGroupService) {}

  @Get("groups")
  async getAllGroups() {
    return this.specificationGroupService.getAllGroups();
  }

  @Get("group/:groupId")
  async getGroupById(@Param("groupId") groupId: string) {
    return this.specificationGroupService.getGroupById(groupId);
  }

  @Post("group")
  async createGroup(@Body() dto: CreateSpecificationGroupDto) {
    return this.specificationGroupService.createGroup(dto);
  }

  @Put("group/:groupId")
  async updateGroup(@Param("groupId") groupId: string, @Body() dto: UpdateSpecificationGroupDto) {
    return this.specificationGroupService.updateGroup(groupId, dto);
  }

  @Delete("group/:groupId")
  async deleteGroup(@Param("groupId") groupId: string) {
    return this.specificationGroupService.deleteGroup(groupId);
  }
}
