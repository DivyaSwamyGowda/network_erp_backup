
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AuthorizationService } from '../authorization/authorization.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { PasswordHelper } from 'src/common/helpers/password-helper';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authorizationService: AuthorizationService,
  ) { }

async createUser(dto: CreateUserDto) {
  const role = await this.prisma.role.findUnique({
    where: { name: dto.role }, // Find role by name
  });

  if (!role) {
    throw new Error('Invalid role');
  }

  const hashedPassword = await PasswordHelper.hashPassword(dto.password);

  return this.prisma.user.create({
    data: {
      fullname: dto.fullname,
      email: dto.email,
      password: hashedPassword,
      mobile: dto.mobile,
      username: dto.username,
      role: { connect: { id: role.id } }, // ✅ Use connect for Prisma relation
      createdBy: dto.createdBy,
    },
  });
}


// Get all users
async getAllUsers() {
  const users = await this.prisma.user.findMany();  // Fetch all users
  console.log('Fetched users:', users);  // Log fetched users to check the data
  return users;
}


async assignRoleToUser(userId: string, roleId: string) {
  const role = await this.prisma.role.findUnique({
    where: { id: roleId }, // ✅ use id directly
  });
  if (!role) {
    throw new Error(`Role ID "${roleId}" not found`);
  }
  return this.prisma.user.update({
    where: { id: userId },
    data: { roleId: role.id },
    include: { role: true },
  });
}

async changeRoleFromUser(userId: string, roleId: string) {
  const role = await this.prisma.role.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    throw new Error(`Role with ID "${roleId}" not found`);
  }

  return this.prisma.user.update({
    where: { id: userId },
    data: { roleId: role.id },
    include: { role: true },
  });
}

  async getUserByEmail(email: string) {
    console.log(`Fetching user with email: ${email}`);
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  
    console.log("User found in DB:", user);
    return user;
  }

  async removeRoleFromUser(userId: string) {
    try {
      // Define the default role ID you want to assign (you can hardcode this value if it's always the same)
      const defaultRoleId = 'cm78wkl3r0002p088mhaub66j';  // Set this to your predefined default role ID
  
      // Now, update the user and directly assign the default role ID
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          roleId: defaultRoleId,  // Directly assign the default role ID
        },
      });
    } catch (error) {
      throw new Error(`Error removing role from user: ${error.message}`);
    }
  }
  
  async updateUser(id: string, data: Partial<{ email: string; password: string; roleId: string; refreshToken: string }>) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }
  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },  
    });
   }

  // Soft delete a user (marks as inactive)
  async softDeleteUser(id: string) {
    return await this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }

  // Permanently delete a user
  async hardDeleteUser(id: string) {
    return await this.prisma.user.delete({
      where: { id },
    });
  }
}
