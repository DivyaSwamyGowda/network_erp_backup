import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateNotificationDto {
  @IsOptional()
  @IsUUID()
  rfqId?: string;

  @IsString()
  user: string;  // Changed from 'name' to 'user'

  @IsUUID()
  customerId: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsUUID()
  contactId?: string;
}
