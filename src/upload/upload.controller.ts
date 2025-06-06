// correct 
import { Controller, Post, UploadedFiles, UseInterceptors, Body, Param, Get, Delete, HttpException, HttpStatus, Put, UploadedFile, Res, NotFoundException } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { diskStorage } from 'multer';
import  path, { extname, join } from 'path';
import { Response } from 'express';
import * as fs from 'fs';

@Controller('upload')
export class UploadController {
  rfqService: any; fileService: any;  prisma: any;
  constructor(private readonly uploadService: UploadService) { }



  
  @Get('files/:filename')
  async serveFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    // Fetch metadata from DB
    const fileRecord = await this.prisma.file.findUnique({
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
  
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 200, {
      storage: diskStorage({
        destination: './assets',
        filename: (req, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          callback(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
     limits: { fileSize: 5 * 1024 * 1024 * 1024 }, 

    })
   )

  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any
  ) {
    console.log('📥 Upload Request Received');
    console.log('🔍 Files:', files);
    console.log('📝 Body:', body);

  
    if (!files || files.length === 0) {
      throw new HttpException('No files received', HttpStatus.BAD_REQUEST);
    }
    return await this.uploadService.saveFiles(files, 'RFQ', JSON.stringify(body.metadata));
  }

  @Get()
  async getAllFiles() {
    return await this.uploadService.getAllFiles();
  }



  @Get(':modelType/:modelId')
  async getFiles(@Param('modelType') modelType: string, @Param('modelId') modelId: string) {
    return await this.uploadService.getFiles(modelType, modelId);
  }
 
  @Delete(':id')
  async deleteFile(@Param('id') id: string) {
    return await this.uploadService.deleteFile(id);
  }

  @Put('replace/:rfqId/:fileId')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './assets',  // Ensure files are stored in assets folder
      filename: (req, file, callback) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        callback(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async replaceFile(
    @Param('rfqId') rfqId: string,
    @Param('fileId') fileId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    return this.uploadService.replaceFile(rfqId, fileId, file);
  }

  @Get('download/:rfqId/:filename')
async downloadFile(
  @Param('rfqId') rfqId: string,
  @Param('filename') filename: string,
  @Res() res: Response
) {
  const file = await this.uploadService.getFileByRfqIdAndFilename(rfqId, filename);

  if (!file) {
    throw new HttpException('File not found in database', HttpStatus.NOT_FOUND);
  }

  const filePath = join('/home/ubuntu/erp-api/assets/', file.filename);

  if (!fs.existsSync(filePath)) {
    throw new HttpException('File not found on disk', HttpStatus.NOT_FOUND);
  }

  res.setHeader('Content-Disposition', `attachment; filename="${file.originalname}"`);
  res.setHeader('Content-Type', 'application/octet-stream');

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
}


}  
















