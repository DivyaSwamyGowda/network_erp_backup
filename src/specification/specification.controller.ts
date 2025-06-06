
import { Controller, Get, Post, Body, Param, Put, Patch, Delete, Query, NotFoundException, InternalServerErrorException, HttpException, HttpStatus } from '@nestjs/common';
import { SpecificationsService } from './specification.service';
import { Specification, Unit } from '@prisma/client';
import { CreateSpecificationDto, UpdateSpecificationDto } from './dto/create-specification.dto';

@Controller('specifications')
export class SpecificationsController {
  constructor(private readonly specificationsService: SpecificationsService) {}

  @Get()
  async getSpecifications(@Query('serviceId') serviceId?: string) {
    return this.specificationsService.getSpecifications(serviceId);
  }

  @Get('search')
  async searchSpecification(@Query('query') query: any) {
    console.log('Search query received:', query);
    return this.specificationsService.searchSpecifications(query);
  }

  @Get('units')
  getUnits(): string[] {
    return Object.values(Unit); 
  }

  @Get(':id')
  async getSpecification(@Param('id') id: string) {
    const spec = await this.specificationsService.getSpecificationById(id);
    if (!spec) {
      throw new NotFoundException('Specification not found');
    }
    return spec;
  }

  // Admin endpoint to create a new specification
  @Post() 
  async create(@Body() createSpecDto: CreateSpecificationDto): Promise<Specification> {
    return this.specificationsService.createSpecification(createSpecDto);
  }

  @Put(':id')
  async updateSpecification(
    @Param('id') id: string,
    @Body() updateSpecificationDto: UpdateSpecificationDto,
  ) {
    console.log('🛠️ Updating specification with ID:', id);
    console.log('📥 Data received for update:', updateSpecificationDto);

    const updatedSpec = await this.specificationsService.updateSpecification(id, updateSpecificationDto);

    console.log('✅ Specification updated:', updatedSpec);
    return updatedSpec;
  }

  // New endpoint for managing subspecifications
  @Put(':id/subspecs')
  async updateSubSpecifications(
    @Param('id') id: string,
    @Body() updateDto: { subSpecifications: string[] }
  ) {
    console.log('🔄 Updating subspecifications for specification ID:', id);
    console.log('📥 Subspecifications data received:', updateDto);
    
    const updatedSpec = await this.specificationsService.updateSubSpecifications(id, updateDto.subSpecifications);
    
    console.log('✅ Subspecifications updated successfully');
    return updatedSpec;
  }
  
  @Delete(':id')
  async deleteSpecification(@Param('id') id: string) {
    try {
      return await this.specificationsService.deleteSpecification(id);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
