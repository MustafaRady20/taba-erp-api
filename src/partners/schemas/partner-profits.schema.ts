import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export type PartnerProfitDocument = PartnerProfit & Document

@Schema({timestamps:true})
export class PartnerProfit {
    @Prop({type:Types.ObjectId,required:true , ref:"Partner"})
    partner:Types.ObjectId

    @Prop({type:Types.ObjectId,required:true,ref:"Activity"})
    activity:Types.ObjectId

    @Prop({type:Date,default:new Date})
    date:Date

    @Prop({type:Number,required:true})
    profit:number
    
}


export const PartnerProfitSchema = SchemaFactory.createForClass(PartnerProfit)