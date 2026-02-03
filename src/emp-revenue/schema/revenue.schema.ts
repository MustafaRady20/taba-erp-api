import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';



export type EmpRevenueDocument = EmpRevenue & Document;



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

const RevenueCurrencySchema =
  SchemaFactory.createForClass(RevenueCurrency);
@Schema({ timestamps: true })
export class EmpRevenue {
  @Prop({ type: Types.ObjectId, ref: 'Activity', required: true })
  activity: Types.ObjectId;

  @Prop({ type: [RevenueCurrencySchema], required: true })
  currencies: RevenueCurrency[];

  @Prop({ required: true })
  totalEGPAmount: number;

  @Prop({ type: Date, default: Date.now })
  date: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employees', required: true })
  employee: Types.ObjectId;
}



export const RevenueSchema = SchemaFactory.createForClass(EmpRevenue);



RevenueSchema.pre('save', function (next) {
  let total = 0;

  this.currencies = this.currencies.map((c) => {
    c.egpAmount = c.amount * c.exchangeRate;
    total += c.egpAmount;
    return c;
  });

  this.totalEGPAmount = total;
  next();
});
