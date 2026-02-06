import { Module } from '@nestjs/common';
import { PartnerService } from './partners.service';
import { PartnerController } from './partners.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Partner, PartnerSchema } from './schemas/partner.schema';
import { PartnerProfit, PartnerProfitSchema } from './schemas/partner-profits.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Partner.name,
        schema: PartnerSchema,
      },
      {
        name: PartnerProfit.name,
        schema: PartnerProfitSchema,
      },
    ]),
  ],
  providers: [PartnerService],
  controllers: [PartnerController],
})
export class PartnersModule {}
