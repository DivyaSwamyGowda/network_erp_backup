import { IsEmail, IsOptional, IsString, IsBoolean ,IsNotEmpty} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  name: string;

  
    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty()
    email: string;
  

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  mobile?: string;

  @IsBoolean()
  @IsOptional()
  newsletter?: boolean;
}



export class UpdateCustomerDto {
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
}
