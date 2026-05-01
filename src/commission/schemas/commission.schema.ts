import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";


export type CommissionDocument = Commission & Document;
@Schema({timestamps: true})
export class Commission{
    @Prop({ required: true })
    amount: number;

    @Prop({ required: true ,ref:"Employees"})
    userId: Types.ObjectId;

    @Prop({ required: true })
    date: Date;

}


export const CommissionSchema = SchemaFactory.createForClass(Commission);

CommissionSchema.index({ userId: 1 });