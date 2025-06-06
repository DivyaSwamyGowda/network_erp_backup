
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EmailService {
 
  constructor(private readonly mailerService: MailerService,
    private readonly prisma: PrismaService, 
  ) { }
  //panindra.dev@gmail.com
  async sendEmail(
    to: string,
    subject: string,
    template: string,
    data?: Record<string, any>,
    attachments?: any[]
  
  ): Promise<void> {

    try {

      await this.mailerService.sendMail({
        to,
        subject,
        context: data,
        template,
         attachments, 
      });
      console.log(`✅ Email sent to ${to}`);
    } catch (error) {
      console.error(`❌ Failed to send email: ${error.message}`);
      throw error;
    }
  }
async sendEmailWithAttachments({
  to,
  subject,
  template,
  context,
  attachments = [],
}: {
  to: string;
  subject: string;
  template: string;
  context: any;
  attachments?: { filename: string; path: string }[];
}) {
  return this.mailerService.sendMail({
    to,
    subject,
    template,
    context,
    attachments,
  });
}

async updateEmailRecipients(data: {
  rfqEmail?: string;
  quoteEmail?: string;
  messageEmail?: string;
}) {
  // Assuming there's only one record, updating the first record
  const recipient = await this.prisma.emailRecipient.findFirst();
  
  if (!recipient) {
    // Create if none exists
    return this.prisma.emailRecipient.create({
      data: {
        rfqEmail: data.rfqEmail,
        quoteEmail: data.quoteEmail,
        messageEmail: data.messageEmail,
      },
    });
  }

  return this.prisma.emailRecipient.update({
    where: { id: recipient.id },
    data: {
      rfqEmail: data.rfqEmail ?? recipient.rfqEmail,
      quoteEmail: data.quoteEmail ?? recipient.quoteEmail,
      messageEmail: data.messageEmail ?? recipient.messageEmail,
    },
  });
}

async getEmailsByType(type: 'rfq' | 'quote' | 'message'): Promise<string[]> {
  const recipient = await this.prisma.emailRecipient.findFirst();

  if (!recipient) return [];

  let rawEmails: string | undefined;

  switch (type) {
    case 'rfq':
      rawEmails = recipient.rfqEmail;
      break;
    case 'quote':
      rawEmails = recipient.quoteEmail;
      break;
    case 'message':
      rawEmails = recipient.messageEmail;
      break;
  }

  return rawEmails
    ? rawEmails.split(',').map(email => email.trim()).filter(email => email)
    : [];
}

}
