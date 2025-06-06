import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
 
import { jwtConfig } from './config/jwt.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt-strategy';
import { PrismaModule } from '../../prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { AuthorizationModule } from 'src/authorization/authorization.module';
 

@Module({
  imports: [PrismaModule,UserModule, AuthorizationModule, PassportModule, JwtModule.register(jwtConfig)],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
