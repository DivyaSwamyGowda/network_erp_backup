import { IsOptional, IsObject } from 'class-validator';

export class CreateFileDto {
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}


