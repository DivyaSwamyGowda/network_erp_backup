import { Controller, Post, Get, Patch, Delete, Body, Param, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
// import { AuthGuard } from '@nestjs/passport';
import { Prisma } from '@prisma/client';
import { UserType } from '@prisma/client';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('types')
getUserTypes() {
  console.log('UserType Enum:', UserType);
  return Object.values(UserType); // ['ADMIN', 'EMPLOYEE', 'CUSTOMER']
}
  
@Post()
async createUser(@Body() body: CreateUserDto) {
  return await this.userService.createUser(body);
}

  // Assign a role to a user
  @Post(':id/roles/:roleId')
  async assignRoleToUser(
    @Param('id') userId: string,
    @Param('roleId') roleId: string,
  ) {
    // Call the service to assign the role
    return this.userService.assignRoleToUser(userId, roleId);
  }
 
  

  @Get()
  async getAllUsers() {
    return await this.userService.getAllUsers();
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return await this.userService.getUserById(id);
  }

  // get user by email
  @Get(':email')
  async getUserByEmail(@Param('email') email: string) {

    try {
      const user = await this.userService.getUserByEmail(email);
      if (user) {
        return user;
      } else {
        return { message: 'User not found' };
      }
    } catch (error) {
      return { message: error.message };
    }
  }

  //changing role from user
 @Patch(':id/role')
async changeUserRole(
  @Param('id') userId: string,
  @Body() body: { roleId: string }
) {
  return this.userService.changeRoleFromUser(userId, body.roleId);
}


//updating user
  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return await this.userService.updateUser(id, body);
  }

  
  // delete a role from user 
  @Delete(':id/roles')
  async removeRoleFromUser(
    @Param('id') userId: string
  ) {
    return this.userService.removeRoleFromUser(userId);
  }

  // delete user
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return await this.userService.softDeleteUser(id);
  }
}
