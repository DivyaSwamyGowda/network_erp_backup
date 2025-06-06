
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  rfqService: any;
  message: any;

  constructor() {
    super({
      // log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Prisma connected to the database.');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Prisma disconnected from the database.');
  }
}
