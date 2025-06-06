import { IsString, IsNotEmpty, IsOptional, IsArray, IsUUID, IsInt, Min } from "class-validator";

export class CreateSpecificationGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateSpecificationGroupDto {
  @IsOptional()
  @IsString()
 name?: string;

  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  specificationIds?: string[];
}
