import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VipRevenuesService } from './vip-revenues.service';
import { VipRevenuesController } from './vip-revenues.controller';
import { VipRevenue, VupRevenueSchema } from './schema/vip-revenues.schema';
import { CurrencyModule } from 'src/currency/currency.module';
import { Currency, CurrencySchema } from 'src/currency/shcema/currency.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VipRevenue.name, schema: VupRevenueSchema },
      { name: Currency.name, schema: CurrencySchema }
    ]),
  ],
  controllers: [VipRevenuesController],
  providers: [VipRevenuesService],
})
export class VipRevenuesModule {}
