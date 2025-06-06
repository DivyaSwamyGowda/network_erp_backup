import { Controller, Post, Get, Body, Param, Delete, BadRequestException } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';

@Controller('authorization')
export class AuthorizationController {
  constructor(private readonly authorizationService: AuthorizationService) { }

  // Fetch all roles
  @Get('roles')
  async getAllRoles() {
    return await this.authorizationService.getAllRoles();
  }

  // Create a new role
  @Post('roles')
  async createRole(@Body() body: { name: string; description?: string ; organizationId:string; }) {
    return await this.authorizationService.createRole(body.name, body.description,body.organizationId);
  }

  // Fetch all permissions
  @Get('permissions')
  async getAllPermissions() {
    return await this.authorizationService.getAllPermissions();
  }

  // Create a new permission
  @Post('permissions')
  async createPermission(
    @Body() body: { id: string; name: string; description?: string },
  ) {
    console.log(`Creating permission with id: ${body.id}`);
    return await this.authorizationService.createPermission(
      body.id,
      body.name,
      body.description,
    );
  }
//  Assign a permission to a role
  @Post('roles/:roleId/permissions')
  async assignPermissionToRole(
    @Param('roleId') roleId: string,
    @Body() body: { id: string },
  ) {
    const permissionId = body.id; // Extract permissionId from body
    console.log(`Inputs roleId: ${roleId}, permissionId: ${permissionId}`);
    
    if (!permissionId) {
      throw new BadRequestException('permissionId is required in the body');
    }
  
    return await this.authorizationService.assignPermissionToRole(roleId, permissionId);
  }

  // Fetch permissions for a role
  @Get('roles/:roleId/permissions')
  async getPermissionsForRole(@Param('roleId') roleId: string) {
    return await this.authorizationService.getPermissionsForRole(roleId);
  }

  // Remove a permission from a role
  @Delete('roles/:roleId/permissions/:permissionId')
  async removePermissionFromRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return await this.authorizationService.removePermissionFromRole(roleId, permissionId);
  }
}
