import { IsOptional, IsString } from 'class-validator';

export class CreatePartnerDto {
  @IsString()
  name: string;
}

export class UpdatePartnerDto {
  @IsOptional()
  @IsString()
  name?: string;
}
