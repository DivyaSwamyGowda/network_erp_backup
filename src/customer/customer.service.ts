import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto ,UpdateCustomerDto} from './dto/customer.dto';


@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}
  async createCustomer(customerDto: CreateCustomerDto) {
    console.log("Received Customer Data:", customerDto);
    const { email, name, ...customerData } = customerDto; // Extract name separately
    const now = new Date();
  
    if (!email) {
      throw new HttpException("Customer email is required", HttpStatus.BAD_REQUEST);
    }
  
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { email },
    });
  
    return this.prisma.customer.upsert({
      where: { email },
      update: {
        ...customerData, // ✅ Update other details
        updatedAt: now,
      },
      create: {
        email, 
        name, // ✅ Set name only when creating
        ...customerData,
        createdAt: now,
      },
    });
  }
  async updateCustomer(customerId: string, updateData: UpdateCustomerDto) {
    const now = new Date();
  
    return this.prisma.customer.update({
      where: { id: customerId },
      data: {
        ...updateData,       // ✅ Includes name now
        updatedAt: now,
      },
    });
  }

  async getCustomerById(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        rfqs: {
          include: {
            services: true,
            rfqSpecifications: {
              include: {
                specification: true,
              },
            },
            files: true,
          },
        },
      },
    });
  
    if (!customer) {
      throw new HttpException("Customer not found", HttpStatus.NOT_FOUND);
    }
  
    return customer;
  }
  
  async findAll() {
    return this.prisma.customer.findMany({
      where: { deletedAt: null }, // Exclude soft-deleted customers
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async deleteCustomer(id: string) {
    try {
      const customer = await this.prisma.customer.delete({
        where: { id },
      });
  
      return {
        status: 'success',
        message: 'Customer deleted permanently',
        customer,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to delete customer: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}  