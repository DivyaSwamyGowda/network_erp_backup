import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { AuthorizationModule } from 'src/authorization/authorization.module';
 

@Module({
  imports: [PrismaModule,AuthorizationModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService]

})
export class UserModule { }
