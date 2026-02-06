import { IsMongoId, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreatePartnerProfitDto {
  @IsMongoId()
  partner: string;

  @IsMongoId()
  activity: string;

  @IsNumber()
  profit: number;

  @IsOptional()
  @IsNumber()
  month?: number;
}


export class UpdatePartnerProfitDto {
  @IsOptional()
  @IsMongoId()
  partner?: string;

  @IsOptional()
  @IsMongoId()
  activity?: string;

  @IsOptional()
  @IsNumber()
  profit?: number;

  @IsOptional()
  @IsNumber()
  month?: number;
}

