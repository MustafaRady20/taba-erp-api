import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateRevenueDto {
  @ApiProperty({ example: "652c1f4e97bca41bcd22e111" })
  @IsMongoId()
  cafeId: string;

  @ApiProperty({ example: "morning" })
  @IsString()
  @IsNotEmpty()
  shift: string;

  @ApiProperty({ example: "2025-11-20" })
  date: string;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  amount: number;
}


export class UpdateRevenueDto extends PartialType(CreateRevenueDto){}