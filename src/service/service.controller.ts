
// correct 
import { Controller, Get, Post, Put, Delete, Body, Param, Request } from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreateSpecificationDto } from 'src/specification/dto/create-specification.dto';

@Controller('service')
export class ServiceController {
  specificationService: any;
  constructor(private readonly serviceService: ServiceService) { }

  
  @Post()
async create(@Body() createServiceDto: CreateServiceDto) {
  return this.serviceService.create(createServiceDto);
}
@Post(':rfqId')
async createRfqSpecifications(
  @Param('rfqId') rfqId: string,
  @Body() dtos: CreateSpecificationDto[],
) {
  return this.specificationService.createRfqSpecifications(rfqId, dtos);
}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.serviceService.findOne(id);
  }

  @Get()
  async list(@Request() req) {
    console.log(req?.user)
    return this.serviceService.list();
  }

  @Put(':id')
  async edit(@Param('id') id: string, @Body() updateServiceDto: Partial<CreateServiceDto>) {
    return this.serviceService.edit(id, updateServiceDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.serviceService.delete(id);
  }
}

