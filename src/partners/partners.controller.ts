import { Controller, Post, Get, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { PartnerService } from './partners.service';
import { CreatePartnerDto, UpdatePartnerDto } from './dto/partners.dto';
import { CreatePartnerProfitDto, UpdatePartnerProfitDto } from './dto/partner-profit.dto';

@Controller('partners')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}


  @Post()
  createPartner(@Body() dto: CreatePartnerDto) {
    return this.partnerService.createPartner(dto);
  }

  @Get()
  findAllPartners() {
    return this.partnerService.findAllPartners();
  }

  @Get(':id')
  findPartner(@Param('id') id: string) {
    return this.partnerService.findPartnerById(id);
  }

   @Patch(':id')
  updatePartner(
    @Param('id') id: string,
    @Body() dto: UpdatePartnerDto,
  ) {
    return this.partnerService.updatePartner(id, dto);
  }

  @Delete(':id')
  deletePartner(@Param('id') id: string) {
    return this.partnerService.deletePartner(id);
  }

  @Post('profits')
  createProfit(@Body() dto: CreatePartnerProfitDto) {
    return this.partnerService.createProfit(dto);
  }

  @Get('profits/all')
  findAllProfits(@Query("year") year:string,@Query("month") month:string) {
    return this.partnerService.findAllProfits(month?Number(month):undefined,year?Number(year):undefined);
  }

  @Get(':id/profits')
  findPartnerProfits(@Param('id') id: string) {
    return this.partnerService.findPartnerProfits(id);
  }

  @Get(':id/total-profit')
  getTotalProfit(@Param('id') id: string) {
    return this.partnerService.getPartnerTotalProfit(id);
  }

   @Patch('profits/:id')
  updateProfit(
    @Param('id') id: string,
    @Body() dto: UpdatePartnerProfitDto,
  ) {
    return this.partnerService.updateProfit(id, dto);
  }

  @Delete('profits/:id')
  deleteProfit(@Param('id') id: string) {
    return this.partnerService.deleteProfit(id);
  }
}
