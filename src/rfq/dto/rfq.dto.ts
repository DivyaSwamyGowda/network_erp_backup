
import { RfqStatus } from '@prisma/client';
import { IsString, IsOptional, IsBoolean, IsArray, IsNotEmpty, IsEnum,  IsObject,  IsEmail } from 'class-validator';

export class CreateRfqDto {
  @IsString()
  @IsOptional()
  projectName?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  mobile?: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  services?: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  filename?: string[];

  @IsEnum(RfqStatus)
  @IsOptional()
  status?: RfqStatus; // Optional status field to handle different RFQ statuses

  @IsArray()
  @IsOptional()
  @IsObject({ each: true })  // Ensure each specification is an object
  specifications?: { 
  specificationId: string; // Specification ID
  value: any; // Specification value, can be TEXT, BOOLEAN, or SELECT
  }[];

}

export class UpdateRfqDto {
  @IsString()
  @IsOptional()
  projectName?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  mobile?: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsBoolean()
  @IsOptional()
  isArchived?: boolean; // Add this field to support archiving

}
