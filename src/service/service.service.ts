
// //correct 
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/create-service.dto';


@Injectable()
export class ServiceService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createServiceDto: CreateServiceDto) {
    try {
      console.log("Creating service with data:", createServiceDto); // ✅ Debugging log
      const { isActive, description, ..._data } = createServiceDto;
      const _isActive = isActive === true ? false : isActive;
  
      const service = await this.prisma.service.create({
        data: {
          isActive: _isActive,
          ..._data,
        },
      });
  
      console.log("Service created:", service); // ✅ Debugging log
      return service;
    } catch (error) {
      console.error("Error creating service:", error); // ✅ Log full error
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  // Find a service by ID
  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true

          }
        }
      }
    });

    if (!service) {
      throw new Error(`Service with ID ${id} not found.`);
    }

    return service;
  }

  async list() {
    // Fetch all services from Prisma
    const services = await this.prisma.service.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            email: true

          }
        }
      }
    });

    // Manually structure hierarchy based on service names (like Parts, Fab, Labor Assembly)
    return services


  }


  // Edit a service by ID
  async edit(id: string, data: Partial<UpdateServiceDto>) {
    return this.prisma.service.update({
      where: { id },
      data: {
        ...data
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,


          }
        }
      }
    });
  }

  // Delete a service by ID
  async delete(id: string) {
    return this.prisma.service.delete({
      where: { id },
    });
  }
}











