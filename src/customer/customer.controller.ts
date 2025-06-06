import { Controller, Get, Post, Body, Param, Patch, Delete, HttpException, HttpStatus, Put } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/customer.dto';
import { UpdateCustomerDto } from './dto/customer.dto';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}



  @Post()
  async createCustomer(@Body() customerDto: CreateCustomerDto) {
    try {
      return await this.customerService.createCustomer(customerDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll() {
    return this.customerService.findAll();
  }

  @Get(':customerId')
  async getCustomerById(@Param('customerId') customerId: string) {
    return this.customerService.getCustomerById(customerId);
  }
  
  @Put(':customerId/update')
  async updateCustomer(
    @Param('customerId') customerId: string,
    @Body() updateData: UpdateCustomerDto
  ) {
    if (!customerId) {
      throw new HttpException('Customer ID is required', HttpStatus.BAD_REQUEST);
    }

    return this.customerService.updateCustomer(customerId, updateData);
  }

  @Delete(':id')
  async deleteCustomers(@Param('id') id: string) {
    return this.customerService.deleteCustomer(id);
  }
}
