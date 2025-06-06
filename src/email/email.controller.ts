import { Controller, Post, Body, Param, Patch } from '@nestjs/common';
import { EmailService } from './email.service';


@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) { }

  @Post('send')
  async sendTestEmail(
    @Body() { to, subject, template, data }: { to: string; subject: string; template: string, data: any }
  ) {
    console.log('template', template)
    await this.emailService.sendEmail(to, subject, template, data);
    return { message: '✅ Email sent successfully!' };
  }

  @Patch('recipients')
async setEmailRecipients(
  @Body() emails: { rfqEmail?: string; quoteEmail?: string; messageEmail?: string; }
) {
  return this.emailService.updateEmailRecipients(emails);
}
}
