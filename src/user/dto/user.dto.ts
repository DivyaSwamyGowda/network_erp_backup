import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { isNull } from 'util';

export class CreateUserDto {
    @IsEmail()
    email: string;


    @IsNotEmpty()
    @IsString()
    password: string;

    @IsOptional()
    @IsString()
    username: string;

    @IsOptional()
    @IsString()
    fullname: string;

    @IsNotEmpty()
    @IsString()
    mobile: string;


    @IsOptional()
    @IsString()
    role: string;

    @IsOptional()
    @IsString()
    createdBy?: string;
      roleId?: string;
}

export class UpdateUserDto {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsString()
    roleId?: string;

    @IsOptional()
    @IsString()
    updatedBy?: string;

    @IsOptional()
    @IsString()
    refreshToken?: string;
}
