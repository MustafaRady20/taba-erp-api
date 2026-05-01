import { IsOptional, IsDateString } from 'class-validator';

export class GetSalariesDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}