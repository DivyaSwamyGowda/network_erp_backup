import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { join } from 'path';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

// Log the resolved path for debugging
const templatesPath = join(process.cwd(), 'src', 'email', 'templates');
console.log(`✅ Email Templates Path: ${templatesPath}`);

@Module({
  imports: [
    ConfigModule.forRoot(), // Load .env variables
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          service: 'gmail',
          auth: {
            user: configService.get<string>('GMAIL_USER'),
            pass: configService.get<string>('GMAIL_PASS'),
          },
        },
        defaults: {
          from: `"NPCB Mailer" <${configService.get<string>('GMAIL_USER')}>`,
        },
        template: {
          dir: templatesPath, // Use resolved absolute path
          adapter: new PugAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
  controllers: [EmailController],
})
export class EmailModule {}
