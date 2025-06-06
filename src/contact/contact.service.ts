import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { Contact } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { getMaxListeners } from 'events';
import { NotificationService } from '../notification/notification.service';


@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService, private readonly emailService: EmailService,private readonly notificationService: NotificationService ) {}

//   async createContact(createContactDto: CreateContactDto) {
//     try {
//       const { email, name, message, mobile , company} = createContactDto;
  
//       console.log('📥 Incoming DTO:', createContactDto);

//       // Check if the customer already exists based on mobile or email
//       let customer = await this.prisma.customer.findFirst({
//         where: {
//           OR: [{ mobile }, { email }],
//         },
//       });
  
//       // If customer doesn't exist, create a new one
//       if (!customer) {
//         customer = await this.prisma.customer.create({
//           data: {
//             email,
//             name,
//             mobile, 
//             company
//           },
//         });
       
//       } else {
//       }
  
//       // Save contact details and link to the customer
//       const contact = await this.prisma.contact.create({
//         data: {
//           ...createContactDto, 
//         customerId: customer.id, 
//       },
//     });
  

//    // email logic 

//       // Send email confirmation to user
//       if (email && name) {
//         try {
//         await this.emailService.sendEmail(
//           email,
//           'Contact Form Received', // Email subject
//           'contact_customer', // Email template name
//           { name,mobile,message,email,company }, // Data for the template
//         );
//         console.log(`✅ Email sent to ${email}`);
//       } catch (emailError) {
//         console.error('⚠️ Email microservice error (user email):', emailError.message);
//       }
//     }

//  // Send email notification to admin team
//  const emailRecipients = [
//   // 'admin@networkpcb.com',
//   // 'panindra.dev@gmail.com',
//   'divyas08052002@gmail.com'
// ];


// try {
// await this.emailService.sendEmail(
//   emailRecipients.join(','),
//   'New Message Arrived',
//   'contact_admin', 
//   {
//     name,
//     email,
//     mobile,
//     message,
//     company
//   },
// );

// console.log('📩 Notification email sent to admins.');
// } catch (adminEmailError) {
//   console.error('⚠️ Email microservice error (admin email):', adminEmailError.message);
// }


// console.log(`🔔 Notification created for new contact from: ${name}`);
// // await this.notificationService.createContactNotification({
//   await this.notificationService.createNotification({
//   user: name,
//   customerId: customer.id,
//   message: 'New message submitted',
//   contactId: contact.id,
// });


//       return contact;
//     } catch (error) {
//       console.error('Error creating contact:', error);
//       throw new HttpException(error.message || 'Error creating contact', HttpStatus.INTERNAL_SERVER_ERROR);
//     }
//   }


async createContact(createContactDto: CreateContactDto) {
  try {
    const { email, name, message, mobile, company } = createContactDto;

    console.log('📥 Incoming DTO:', createContactDto);

    // Check if customer exists by email or mobile
    let customer = await this.prisma.customer.findFirst({
      where: {
        OR: [{ mobile }, { email }],
      },
    });

    // Create new customer if not found
    if (!customer) {
      customer = await this.prisma.customer.create({
        data: { email, name, mobile, company },
      });
    }

    // Save contact and link to customer
    const contact = await this.prisma.contact.create({
      data: {
        ...createContactDto,
        customerId: customer.id,
      },
    });

    
    // Send confirmation to customer
    if (email && name) {
      try {
        await this.emailService.sendEmail(
          email,
          'Contact Form Received',
          'contact_customer',
          { name, mobile, message, email, company }
        );
        console.log(`✅ Confirmation email sent to customer: ${email}`);
      } catch (emailError) {
        console.error('⚠️ Failed to send email to customer:', emailError.message);
      }
    }

    // Get dynamic admin email recipients from DB
    const emailRecipients = await this.emailService.getEmailsByType('message');

    if (emailRecipients.length > 0) {
      try {
        await this.emailService.sendEmail(
          emailRecipients.join(','),
          'New Message Arrived',
          'contact_admin',
          { name, email, mobile, message, company }
        );
        console.log('📩 Notification email sent to admins.');
      } catch (adminEmailError) {
        console.error('⚠️ Failed to send admin notification email:', adminEmailError.message);
      }
    } else {
      console.warn('⚠️ No admin email recipients found for "contact" type.');
    }

    // Create in-app notification
    await this.notificationService.createNotification({
      user: name,
      customerId: customer.id,
      message: 'New message submitted',
      contactId: contact.id,
    });

    console.log(`🔔 Notification created for new contact from: ${name}`);

    return contact;
  } catch (error) {
    console.error('❌ Error creating contact:', error);
    throw new HttpException(error.message || 'Error creating contact', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}



  async getAllContacts(page: number = 1, limit: number = 10): Promise<{ data: Contact[]; total: number; page: number; limit: number }> {
    try {
        console.log(`Fetching Contacts - Page: ${page}, Limit: ${limit}`);

        const pageNumber = Math.max(1, page);
        const pageSize = Math.max(1, limit);

        // Get total count of non-deleted contacts
        const total = await this.prisma.contact.count({
            where: { isDeleted: false }, // Exclude soft-deleted contacts
        });

        // Fetch paginated non-deleted contacts
        const contacts = await this.prisma.contact.findMany({
            where: { isDeleted: false }, // Filter out soft-deleted contacts
            skip: (pageNumber - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
        });

        return {
            data: contacts, // No need to modify message, just exclude deleted ones
            total,
            page: pageNumber,
            limit: pageSize,
        };
    } catch (error) {
        console.error('Error fetching contacts:', error.message);
        throw new HttpException('Failed to fetch contacts', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}


async searchContacts(
  query?: string,
  page: number = 1,
  limit: number = 10,
  fromDate?: string,
  toDate?: string
): Promise<{ data: Contact[]; total: number; page: number; limit: number }> {
  try {
    console.log(`Searching Contacts - Query: ${query}, Page: ${page}, Limit: ${limit}, FromDate: ${fromDate}, ToDate: ${toDate}`);

    const pageNumber = Math.max(1, Number(page) || 1);
    const allowedLimits = [10, 25, 50, 100, 250, 500, 1000, 2000];
    const pageSize = allowedLimits.includes(Number(limit)) ? Number(limit) : 10;
    const skip = (pageNumber - 1) * pageSize;

    let whereClause: any = { isDeleted: false };

    if (query && query.trim() !== "") {
      whereClause.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ];
    }

    const parseDate = (dateString: string) => {
      const parsedDate = new Date(dateString);
      return isNaN(parsedDate.getTime()) ? null : parsedDate;
    };

    const fromDateParsed = fromDate ? parseDate(fromDate) : null;
    const toDateParsed = toDate ? parseDate(toDate) : null;

    if (toDateParsed) {
      toDateParsed.setHours(23, 59, 59, 999); // Ensure the full day is covered
    }

    if (fromDateParsed && toDateParsed) {
      whereClause.createdAt = {
        gte: fromDateParsed,
        lte: toDateParsed,
      };
    } else if (fromDateParsed) {
      whereClause.createdAt = { gte: fromDateParsed };
    } else if (toDateParsed) {
      whereClause.createdAt = { lte: toDateParsed };
    }

    console.log("Final whereClause:", JSON.stringify(whereClause, null, 2));

    const totalResults = await this.prisma.contact.count({ where: whereClause });

    if (totalResults === 0) {
      return {
        total: 0,
        page: pageNumber,
        limit: pageSize,
        data: []
      };
    }

    const contacts = await this.prisma.contact.findMany({
      where: whereClause,
      skip: isNaN(skip) ? 0 : skip, // Ensure skip is not NaN
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });

    console.log("GTE (fromDateParsed):", fromDateParsed);
    console.log("LTE (toDateParsed):", toDateParsed);
    console.log("Pagination - Page:", pageNumber, "Limit:", pageSize);

    return {
      total: totalResults,
      page: pageNumber,
      limit: pageSize,
      data: contacts,
    };
  } catch (error) {
    console.error("Error searching contacts:", error);
    throw new HttpException("Something went wrong!", HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

 async getMessageById(id: string): Promise<any> {
  try {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new HttpException('Contact not found', HttpStatus.NOT_FOUND);
    }

    return contact; // Return the entire contact record
  } catch (error) {
    console.error('Error fetching message:', error);
    throw new HttpException('Failed to fetch message', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}



 async deleteContact(id: string): Promise<{ message: string }> {
  try {
    const contact = await this.prisma.contact.findUnique({ where: { id } });

    if (!contact) {
      throw new HttpException('Contact not found', HttpStatus.NOT_FOUND);
    }

    if (contact.isDeleted) {
      throw new HttpException('Contact is already deleted', HttpStatus.BAD_REQUEST);
    }

    await this.prisma.contact.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(), // Mark it as deleted
      },
    });

    return { message: 'Contact moved to trash successfully' };
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw new HttpException('Failed to delete contact', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
async getTrashedContacts(page: number = 1, limit: number = 10): Promise<{ data: Contact[]; total: number; page: number; limit: number }> {
  try {
    console.log(`Fetching Trashed Contacts - Page: ${page}, Limit: ${limit}`);

    const pageNumber = Math.max(1, page);
    const pageSize = Math.max(1, limit);

    // Get total count of trashed contacts
    const total = await this.prisma.contact.count({
      where: { isDeleted: true },
    });

    // Fetch paginated trashed contacts
    const trashedContacts = await this.prisma.contact.findMany({
      where: { isDeleted: true },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      orderBy: { deletedAt: 'desc' },
    });

    return {
      data: trashedContacts,
      total,
      page: pageNumber,
      limit: pageSize,
    };
  } catch (error) {
    console.error('Error fetching trashed contacts:', error);
    throw new HttpException('Failed to fetch trashed contacts', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

async moveContactToTrash(contactId: string): Promise<Contact> {
  try {
    return await this.prisma.contact.update({
      where: { id: contactId },
      data: { isDeleted: true ,
        deletedAt: new Date(),
      }, // Mark as deleted (move to trash)
    });
  } catch (error) {
    throw new Error(`Error moving contact to trash: ${error.message}`);
  }
}

async restoreContact(id: string): Promise<{ message: string; restoredContact: Contact }> {
  try {
    console.log(`Restoring contact with ID: ${id}`);

    const contact = await this.prisma.contact.findFirst({
      where: { id, isDeleted: true }, // Ensure only soft-deleted contacts are targeted
    });
    if (!contact) {
      throw new HttpException('Contact not found or already restored', HttpStatus.NOT_FOUND);
    }

    const restoredContact = await this.prisma.contact.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return {
      message: `Contact with id: ${id} has been restored.`,
      restoredContact,
    };
  } catch (error) {
    console.error('Error restoring contact:', error);
    throw new HttpException('Failed to restore contact', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

async deleteTrashedContact(id: string): Promise<{ message: string }> {
  try {
    console.log(`Permanently deleting trashed contact with ID: ${id}`);

    const contact = await this.prisma.contact.findFirst({
      where: { id, isDeleted: true }, // Ensure only soft-deleted contacts are targeted
    });

    if (!contact) {
      throw new HttpException('Contact not found or not in trash', HttpStatus.NOT_FOUND);
    }

    // Permanently delete the contact
    await this.prisma.contact.delete({ where: { id } });

    return { message: `Contact with id: ${id} has been permanently deleted.` };
  } catch (error) {
    console.error('Error deleting trashed contact permanently:', error);
    throw new HttpException('Failed to delete trashed contact', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

}