import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class RevenueCurrencyDto {
  @IsMongoId()
  currency: string;

  @IsNumber()
  amount: number;
  @IsNumber()
  exchangeRate: number;
}

export class CreateVipRevenueDto {
  @ApiProperty({ example: 'VIP-2024-001' })
  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RevenueCurrencyDto)
  currencies: RevenueCurrencyDto[];

  @ApiProperty({ example: 1500 })
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsDate()
  date: Date;

  @ApiProperty({ example: '66c9f1f8a0b9c3d9f0e12345' })
  @IsMongoId()
  employee: string;
}
