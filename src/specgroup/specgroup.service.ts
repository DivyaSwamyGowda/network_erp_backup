
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSpecificationGroupDto, UpdateSpecificationGroupDto } from './dto/specGroup.dto';

@Injectable()
export class SpecificationGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllGroups() {
    return this.prisma.specificationGroup.findMany();
  }

  async getGroupById(groupId: string) {
    const group = await this.prisma.specificationGroup.findUnique({
      where: { id: groupId },
      include: {
        specifications: { // ✅ Use correct relation field
          where: { specificationGroupId: groupId }, // ✅ Fix: Use correct foreign key field
          orderBy: { priority: 'asc' } // Optional: Sort by priority
        }
      },
    });
  
    if (!group) {
      throw new NotFoundException('Specification group not found');
    }
  
    return {
      id: group.id,
      name: group.name,
      specifications: group.specifications ?? [], // ✅ Ensure specifications are included
    };
  }
  
  async createGroup(dto: CreateSpecificationGroupDto) {
    return this.prisma.specificationGroup.create({ data: { ...dto } });
  }

  async updateGroup(groupId: string, dto: UpdateSpecificationGroupDto) {
    const existingGroup = await this.prisma.specificationGroup.findUnique({ where: { id: groupId } });
    if (!existingGroup) throw new NotFoundException("Specification Group not found");

    return this.prisma.specificationGroup.update({
      where: { id: groupId },
      data: { ...dto },
    });
  }

  async deleteGroup(groupId: string) {
    const existingGroup = await this.prisma.specificationGroup.findUnique({ where: { id: groupId } });
    if (!existingGroup) throw new NotFoundException("Specification Group not found");

    return this.prisma.specificationGroup.delete({ where: { id: groupId } });
  }
}
