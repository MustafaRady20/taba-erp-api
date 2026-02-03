import {
  IsArray,
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';


class RevenueCurrencyDto {
  @IsMongoId()
  currency: string;

  @IsNumber()
  amount: number;
  @IsNumber()
  exchangeRate: number;
}

export class CreateEmpRevenueDto {
  @IsMongoId()
  activity: string;

  @IsMongoId()
  employee: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RevenueCurrencyDto)
  currencies: RevenueCurrencyDto[];

  @IsOptional()
  @IsDateString()
  date?: Date;
}


export class UpdateEmpRevenueDto extends PartialType(
  CreateEmpRevenueDto,
) {}