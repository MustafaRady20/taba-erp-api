import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNumber, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateCommissionDto {
  @ApiProperty({ example: 150 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'user123' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ example: '2026-04-25T00:00:00.000Z' })
  @IsDateString()
 @IsOptional()
  date: Date;
}

export class UpdateCommissionDto extends PartialType(CreateCommissionDto) {
      @ApiProperty({ example: 150 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'user123' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ example: '2026-04-25T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  date: Date;

}