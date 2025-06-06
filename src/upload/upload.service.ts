// correct
import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { File } from '@prisma/client';
import { unlink, writeFile } from 'fs/promises';
import path, { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, createReadStream,statSync  } from 'fs';
import { Response } from 'express';
import * as fs from 'fs';


@Injectable()
export class UploadService {
  constructor(private readonly prisma: PrismaService) { }


  async uploadFile(file: Express.Multer.File, rfqId: string): Promise<any> {
    console.log('Uploading file:', file.originalname, 'RFQ ID:', rfqId);
  
    if (!rfqId) {
      throw new HttpException('RFQ ID is required', HttpStatus.BAD_REQUEST);
    }
  
    // Extract file extension
    const fileExtension = file.originalname.split('.').pop();
    const fileNameWithoutExt = file.originalname.replace(`.${fileExtension}`, ''); // Remove extension
  
    // Corrected filename format: <originalname>-<rfqId>.<extension>
    const filename = `${fileNameWithoutExt}-${rfqId}.${fileExtension}`;
    const filePath = join(__dirname, '../../assets', filename);
  
    await writeFile(filePath, file.buffer);
    console.log('File uploaded to path:', filePath);

    return {
      filename,
      originalname: file.originalname,
      path: filePath,
      storageType: 'local',
      mimetype: file.mimetype,
      size: file.size,
 
    };
  }

  async saveFiles(files: Express.Multer.File[], modelType: string, modelId?: string, metadata?: any) {
    const fileEntries = files.map(file => ({

      filename: file.filename,
      originalname: file.originalname,
      // path: file.path,
      
      path: `assets/${file.filename}`,
      storageType: 'local',
      modelType: 'RFQ',
      mimetype: file.mimetype,
      size: file.size,
    }));
    console.log('File entries to save:', fileEntries);

    const createdFiles = await Promise.all(
      fileEntries.map(fileData => this.prisma.file.create({ data: fileData }))
    );
    console.log('Created files:', createdFiles);
    return createdFiles;
  }


  async getFiles(modelType: string, modelId: string): Promise<File[]> {
    return await this.prisma.file.findMany({
      where: {
        modelType,
        modelId,
        isActive: true,
      },
      include: {
        rfq: true,  // Include related RFQ (optional, if you want RFQ details with file)
      },
    });
  }
  
  async getAllFiles(): Promise<File[]> {
    return await this.prisma.file.findMany();
  }
  

  async deleteFile(id: string) {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file) return { message: 'File not found' };

    const filePath = join(__dirname, '../../assets', file.filename);
    await unlink(filePath).catch(() => console.warn('File already deleted'));

    return await this.prisma.file.delete({ where: { id } });
  }

  async replaceFile(rfqId: string, fileId: string, file: Express.Multer.File) {
    if (!file || !file.filename || !file.path) {
      throw new HttpException('Invalid file upload', HttpStatus.BAD_REQUEST);
    }

    // Fetch existing file
    const existingFile = await this.prisma.file.findUnique({ where: { id: fileId } });
    if (!existingFile) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    // Find the latest version for this RFQ ID
    const latestFile = await this.prisma.file.findFirst({
      where: { modelId: rfqId, modelType: 'RFQ' },
      orderBy: { version: 'desc' }, // Get the highest version number for this RFQ ID
    });

    const newVersion = latestFile ? latestFile.version + 1 : 1; // Ensure versioning is specific to this RFQ ID

    // Deactivate old file
    await this.prisma.file.update({
      where: { id: fileId },
      data: { isActive: false },
    });

    // Insert new file with correct version
    const newFileEntry = await this.prisma.file.create({
      data: {
        modelId: rfqId,
        filename: file.filename,
        path: file.path,
        storageType: 'local',
        modelType: 'RFQ',
        isActive: true,
        version: newVersion,
        createdAt: new Date(),
        mimetype: file.mimetype,
        size: file.size,
        originalname: file.originalname,
      },
    });

    return newFileEntry;
  }

  async getFileByRfqIdAndFilename(rfqId: string, filename: string) {
    console.log(" Searching for file with RFQ ID:", rfqId, "and Filename:", filename);
  
    const file = await this.prisma.file.findFirst({
      where: {
        modelId: String(rfqId).trim(),
        filename: filename.trim(),
      },
    });
  
    if (!file) {
      console.error(" No file found in database for RFQ ID:", rfqId, "Filename:", filename);
    } else {
      console.log(" File found:", file);
    }
    return file;
  }
  
  async updateFileName(fileId: string, rfqId: string): Promise<any> {
    // Step 1: Get the old filename from the database
    const fileRecord = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!fileRecord) {
      throw new NotFoundException('File not found');
    }

    const oldFileName = fileRecord.filename;
    const newFileName = `${rfqId}_${oldFileName}`; // Rename logic

    // Step 2: Rename the file in the assets folder
    const assetsFolderPath = path.join(__dirname, '..', '..', 'assets');
    const oldFilePath = path.join(assetsFolderPath, oldFileName);
    const newFilePath = path.join(assetsFolderPath, newFileName);

    if (fs.existsSync(oldFilePath)) {
      fs.renameSync(oldFilePath, newFilePath);
    } else {
      console.warn('File not found in assets folder:', oldFilePath);
    }

    // Step 3: Update the filename in the database
    return this.prisma.file.update({
      where: { id: fileId },
      data: { filename: newFileName },
    });
  }

  async downloadFile(rfqId: string, filename: string, res: Response) {
    console.log(`🔍 Searching file: RFQ ID = ${rfqId}, Filename = ${filename}`);

    // Get file details from the database
    const file = await this.getFileByRfqIdAndFilename(rfqId, filename);
    if (!file) {
      console.error(" File not found in database");
      throw new HttpException('File not found in database', HttpStatus.NOT_FOUND);
    }

    // Construct the correct file path (assuming files are stored in assets/)
    const filePath = join(__dirname, '../../assets', file.filename);
    
    if (!existsSync(filePath)) {
      console.error(" File not found on server:", filePath);
      throw new HttpException('File not found on server', HttpStatus.NOT_FOUND);
    }

    console.log("✅ File found, preparing to send:", filePath);

    // Set response headers
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalname}"`);
    res.setHeader('Content-Type', file.mimetype || 'application/octet-stream');

    // Stream the file to response
    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }

}


