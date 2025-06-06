import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AuthorizationService {
    constructor(private readonly prisma: PrismaService) { }

    // Assign a role to a user
    async assignRoleToUser(userId: string, roleId: string) {
        return await this.prisma.user.update({
            where: { id: userId },
            data: { roleId },
        });
    }

    // Fetch all roles
    async getAllRoles() {
        return await this.prisma.role.findMany();
    }
    
    async createRole(name: string, organizationId: string, description?: string) {
      return await this.prisma.role.create({
          data: {
              name,
              description,
              organization: {
                  connect: { id: organizationId },
              },
          },
      });
  }

    // Fetch all permissions
    async getAllPermissions() {
        return await this.prisma.permission.findMany();
    }

   // Create a new permission
  async createPermission(permissionId: string, name: string, description?: string) {
    return await this.prisma.permission.create({
      data: {
        id: permissionId,
        name: name,
        description: description || null,
        isActive: true,
      },
    });
  }

    // Assign a permission to a role
  async assignPermissionToRole(roleId: string, permissionId: string) {
    return await this.prisma.rolePermission.create({
      data: {
        role: { connect: { id: roleId } },
        permission: { connect: { id: permissionId } },
      },
    });
  }

    // Fetch permissions for a specific role
    async getPermissionsForRole(roleId: string) {
        return await this.prisma.rolePermission.findMany({
            where: { roleId },
            include: { permission: true,role:true },
        });
    }

    // Remove a permission from a role
    async removePermissionFromRole(roleId: string, permissionId: string) {
        return await this.prisma.rolePermission.deleteMany({
            where: { roleId, permissionId },
        });
    }
}
