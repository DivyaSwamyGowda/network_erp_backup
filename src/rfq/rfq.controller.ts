// correct
import { Controller, Post, Body, Get, Param, HttpException, HttpStatus, Delete, HttpCode, Patch, Put, UploadedFile, UseInterceptors, UploadedFiles, Query, InternalServerErrorException, NotFoundException, Res } from '@nestjs/common';
import { RfqService } from './rfq.service';
import { CreateRfqDto, UpdateRfqDto } from './dto/rfq.dto';
import { Rfq } from '@prisma/client';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
// import { Public } from 'src/auth/decorator/public.decorator';
import { PrismaService } from '../../prisma/prisma.service'; // Adjust the path if needed
import  path, { extname, join } from 'path';
import * as fs from 'fs';
import { Response } from 'express';



@Controller('rfq')
export class RfqController {
  specificationService: any;
  constructor(
    private readonly rfqService: RfqService,
    private readonly prisma: PrismaService // Inject properly,
  ) {}


  
  @Post('')
  // Enables file upload
  async createRfq(@Body() rfqDto: any) {
    return await this.rfqService.createRFQ(rfqDto);
  }


    @Get('files/:filename')
    async serveFile(
      @Param('filename') filename: string,
      @Res() res: Response,
    ) {
      // Fetch metadata from DB
      const fileRecord = await this.prisma.file.findFirst({
        where: { filename },
      });
  
      if (!fileRecord) {
        throw new NotFoundException('File not found');
      }
  
      const filePath = path.join(process.cwd(), 'assets', filename);
  
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('File not found on server');
      }
  
      // Set headers - including CORS if needed
      res.set({
        'Content-Type': fileRecord.mimetype || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileRecord.originalname}"`,
        'Access-Control-Allow-Origin': '*',  // adjust origin in prod
        'Access-Control-Expose-Headers': 'Content-Disposition',
      });
  
      // Stream file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
  }
  

  @Post('/notifications')
  async createNotification(@Body() createNotificationDto: any) {
    const { type, user, message, rfqId, contactId, customerId } = createNotificationDto;

    if (!type || !user || !message) {
      throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
    }

    const newNotification = await this.prisma.notification.create({
      data: {
        type,
        user,
        message,
        rfqId,
        contactId,
        customerId,
        isRead: false,
      },
    });

    return { message: 'Notification created successfully', notification: newNotification };
  }
  
  @Get('')
  async findAllRfq(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('serviceId') serviceId?: string
  ) {
    return this.rfqService.findAllRfq(Number(page) || 1, Number(limit) || 10, serviceId);
  }

  @Get('allowed-limits')
  getAllowedLimits() {
    return { limits: [10, 25, 50, 100, 250, 500, 1000, 2000] };
  }

  @Get('search')
  async searchRFQs(
    @Query('query') query?: string,
    @Query('service') service?: string,
    @Query('toDate') toDate?: string,
    @Query('fromDate') fromDate?: string,
    @Query('page') page: number = 1,  
    @Query('limit') limit: number = 10
  ) {
    try {

  
      const result = await this.rfqService.searchRFQs(query, service, toDate, fromDate, page, limit);
      return result;
    } catch (error) {
      throw error;
    }
  }   


  
  @Get('archived')
  async findArchivedRFQs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: Rfq[]; total: number; page: number; limit: number }> {
    try {
      return await this.rfqService.findArchivedRfqById(Number(page), Number(limit));
    } catch (error) {
      throw new HttpException('Failed to fetch archived RFQs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Get('trashed')
  async getSoftDeletedRFQs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: Rfq[]; total: number; page: number; limit: number }> {
    try {
      return await this.rfqService.getSoftDeletedRFQs(Number(page), Number(limit));
    } catch (error) {
      throw new HttpException('Failed to fetch soft-deleted RFQs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Patch(':id/trash')
async moveRFQToTrash(@Param('id') rfqId: string) {
  return await this.rfqService.moveRFQToTrash(rfqId);
}

  @Get(':id')
  async findRfqById(@Param('id') id: string): Promise<Rfq> {
    return await this.rfqService.findRfqById(id);
  }

  
  @Put(':id')
  async updateRfq(@Param('id') id: string, @Body() updateRfqDto: UpdateRfqDto,): Promise<Rfq> {
    const updatedRfq = await this.rfqService.updateRfq(id, updateRfqDto);
    return updatedRfq;
  }

  @Delete(':id')
  async softDelete(@Param('id') id: string) {
    return this.rfqService.softDeleteRFQ(id);
  }
  
  @Patch(':id/unarchive')
async unarchiveRfq(@Param('id') id: string): Promise<{ message: string }> {
  await this.rfqService.unarchiveRfq(id);
  return { message: 'RFQ has been unarchived successfully' };
}

  @Patch(':id/restore')
  async restore(@Param('id') id: string) {
    return this.rfqService.restoreRFQ(id);
  }

  
  @Patch(':id/archive')
  async archiveRfq(@Param('id') id: string): Promise<Rfq> {
    return await this.rfqService.archiveRfq(id);
  }


  @Delete('file/:id')
  async deleteRfqFile(@Param('id') id: string): Promise<void> {
    await this.rfqService.deleteRfqFileById(id);
  }
  @Delete('trash/:id')
async deleteTrashRFQ(@Param('id') rfqId: string) {
  return this.rfqService.deleteTrashRFQ(rfqId);
}

}





