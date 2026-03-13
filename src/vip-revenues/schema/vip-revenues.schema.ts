import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type VipRevenueDocument = VipRevenue & Document;

@Schema({ _id: false })
export class RevenueCurrency {
  @Prop({ type: Types.ObjectId, ref: 'Currency', required: true })
  currency: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  exchangeRate: number;

  @Prop({ required: true })
  egpAmount: number;
}

const RevenueCurrencySchema = SchemaFactory.createForClass(RevenueCurrency);

@Schema({ timestamps: true })
export class VipRevenue {

  @Prop({ type: [RevenueCurrencySchema], required: true })
  currencies: RevenueCurrency[];

  @Prop({ required: true })
  amount: number;

  @Prop({ type: Date, default: Date.now })
  date: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employees', required: true })
  employee: Types.ObjectId;
}

export const VupRevenueSchema = SchemaFactory.createForClass(VipRevenue);

VupRevenueSchema.pre('save', function (next) {
  let total = 0;

  this.currencies = this.currencies.map((c) => {
    c.egpAmount = c.amount * c.exchangeRate;
    total += c.egpAmount;
    return c;
  });

  this.amount = total;
  next();
});
