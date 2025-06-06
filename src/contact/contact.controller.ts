import { Body, Controller, Get, Post, BadRequestException, HttpException, HttpStatus, Query, Delete, Param, Patch } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Contact } from '@prisma/client';


@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService,
    private readonly prisma: PrismaService ) {} 

  @Post()
  async create(@Body() createContactDto: CreateContactDto) {
    console.log('Received Contact Form Data:', createContactDto); 
    return this.contactService.createContact(createContactDto);
  }
  @Get()
  async getAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.contactService.getAllContacts(Number(page), Number(limit));
  }
  
  @Get('message/:id')
async getMessage(@Param('id') id: string) {
  return this.contactService.getMessageById(id);
}
@Get('search')
async searchContacts(
  @Query('query') query?: string,
  @Query('page') page?: number,
  @Query('limit') limit?: number,
  @Query('fromDate') fromDate?: string,
  @Query('toDate') toDate?: string
) {
  try {
    return await this.contactService.searchContacts(query, Number(page), Number(limit), fromDate, toDate);
  } catch (error) {
    throw new HttpException('Failed to search contacts', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}


@Patch(':id/trash')
async moveToTrash(@Param('id') contactId: string) {
  return await this.contactService.moveContactToTrash(contactId);
}
@Get('messages')
async getMessages(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10,
  @Query('query') query?: string,
  @Query('fromDate') fromDate?: string,
  @Query('toDate') toDate?: string
) {
  return this.contactService.searchContacts(query, page, limit, fromDate, toDate);
}

  @Delete(':id')
  async softDeleteContact(@Param('id') id: string): Promise<{ message: string }> {
    try {
      return await this.contactService.deleteContact(id); // Soft delete
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('trash/:id')
  async deleteTrashedContact(@Param('id') id: string) {
    return this.contactService.deleteTrashedContact(id);
  }

  @Get('trashed')
  async getTrashedContacts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: Contact[]; total: number; page: number; limit: number }> {
    try {
      return await this.contactService.getTrashedContacts(Number(page), Number(limit));
    } catch (error) {
      throw new HttpException('Failed to fetch trashed contacts', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch('restore/:id')
  async restoreContact(@Param('id') id: string): Promise<{ message: string; restoredContact: Contact }> {
    try {
      return await this.contactService.restoreContact(id); // Restore soft-deleted contact
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}  

