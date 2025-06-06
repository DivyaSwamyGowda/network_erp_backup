import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'yourSecretKey', // Use env variable for production
  expiresIn: '30d', // Token validity
};

export const jwtConfig: JwtModuleOptions = {
  secret: jwtConstants.secret,
  signOptions: { expiresIn: jwtConstants.expiresIn },
};
