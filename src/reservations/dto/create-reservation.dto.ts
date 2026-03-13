import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsEmail,
  Min,
} from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  guestName: string;

  @ApiProperty({ example: 32 })
  @IsNumber()
  @Min(1)
  age: number;



  @ApiProperty({ example: '+201234567890' })
  @IsString()
  phone: string;



  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(0)
  numberOfCompanions: number;

  @ApiProperty({ example: '2025-11-01' })
  @IsDateString()
  expectedArrivalDate: string;

  @ApiProperty({ example: '15:00' })
  @IsString()
  expectedArrivalTime: string;



  @IsOptional()
  @IsString()
  directionOfTravel?: string;



  @IsOptional()
  @IsString()
  package?: string;


  @ApiProperty({ example: 'VIP guest, prefers sea view', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
