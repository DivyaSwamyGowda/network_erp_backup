// import { Injectable } from '@nestjs/common';
// import { EmailService } from '../email/email.service';

// @Injectable()
// export class NewRFQService {
//   constructor(private readonly emailService: EmailService) {}

//   async sendNewRFQEmail(rfqData: any) {
//     const emailRecipients = [
//         //  'admin@networkpcb.com',
//         'divyas08052002@gmail.com',
//         // 'panindra.dev@gmail.com',
//       ];

//       const formattedTo = emailRecipients.join(',');
//       const formattedCreatedAt = new Date(rfqData.createdAt).toUTCString(); 
//       const formattedData = {
//       to:   formattedTo,
//       subject: `New RFQ Submitted: ${rfqData.id}`,
//       template: 'rfq_admin', // Ensure this matches the actual Pug template name
//       data: {
//         id: rfqData.id,
//         name: rfqData.name,
//         email: rfqData.email,
//         company: rfqData.company,
//         mobile: rfqData.mobile,
//         projectName: rfqData.projectName,
//         address: rfqData.address,
//         description: rfqData.description,
//         quantity: rfqData.quantity,
//         createdAt: formattedCreatedAt,
//         services: rfqData.services, // Pass as an array (not a string)
//         rfqSpecifications: rfqData.rfqSpecifications,
//         files: rfqData.files , // Pass as an array (not a string)
//        downloadUrls: rfqData.downloadUrls,
//       },
//     };

//     return this.emailService.sendEmail(
//       formattedData.to,
//       formattedData.subject,
//       formattedData.template,
//       formattedData.data,
//     );
//   }
// }



import { Injectable } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import * as moment from 'moment-timezone';

@Injectable()
export class NewRFQService {
  constructor(private readonly emailService: EmailService) {}

  async sendNewRFQEmail(rfqData: any) {
    // ✅ Fetch RFQ email recipients from DB
    const emailRecipients = await this.emailService.getEmailsByType('rfq');

    if (!emailRecipients.length) {
      console.warn(' No RFQ email recipients configured.');
      return;
    }

    const formattedTo = emailRecipients.join(',');
    
     const formattedCreatedAt = moment(rfqData.createdAt)
      .tz('America/Los_Angeles')
      .format('YYYY-MM-DD hh:mm A z'); 

    const formattedData = {
      to: formattedTo,
      subject: `New RFQ Submitted: ${rfqData.id}`,
      template: 'rfq_admin',
      data: {
        id: rfqData.id,
        name: rfqData.name,
        email: rfqData.email,
        company: rfqData.company,
        mobile: rfqData.mobile,
        projectName: rfqData.projectName,
        address: rfqData.address,
        description: rfqData.description,
        quantity: rfqData.quantity,
        createdAt: formattedCreatedAt,
        services: rfqData.services,
        rfqSpecifications: rfqData.rfqSpecifications,
        files: rfqData.files,
        downloadUrls: rfqData.downloadUrls,
      },
    };

    return this.emailService.sendEmail(
      formattedData.to,
      formattedData.subject,
      formattedData.template,
      formattedData.data,
      rfqData.attachments, 
    );
  }
}
