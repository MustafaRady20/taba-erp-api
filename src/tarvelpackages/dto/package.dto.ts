import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

class LocalizedContentDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  features: string[];
}

export class CreatePackageDto {
  @ValidateNested()
  @Type(() => LocalizedContentDto)
  ar: LocalizedContentDto;

  @ValidateNested()
  @Type(() => LocalizedContentDto)
  en: LocalizedContentDto;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsBoolean()
  popular?: boolean;

  @IsOptional()
  @IsBoolean()
  premium?: boolean;

  @IsOptional()
  @IsString()
  color?: string;
}


export class UpdatePackageDto extends PartialType(CreatePackageDto) {}