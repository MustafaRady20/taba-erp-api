import { IsMongoId, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreatePartnerProfitDto {
  @IsMongoId()
  partner: string;

  @IsMongoId()
  activity: string;

  @IsNumber()
  profit: number;

  @IsOptional()
  @IsDateString()
  date?: Date;
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
  @IsDateString()
  date?: Date;
}

