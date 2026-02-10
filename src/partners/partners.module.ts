import { Module } from '@nestjs/common';
import { PartnerService } from './partners.service';
import { PartnerController } from './partners.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {  PartnerSchema } from './schemas/partner.schema';
import { PartnerProfitSchema } from './schemas/partner-profits.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
       { name: 'Partner', schema: PartnerSchema },
        { name: 'PartnerProfit', schema: PartnerProfitSchema },
    ]),
  ],
  providers: [PartnerService],
  controllers: [PartnerController],
})
export class PartnersModule {}
