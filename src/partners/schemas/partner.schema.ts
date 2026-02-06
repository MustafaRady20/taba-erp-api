import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type PartnerDocument = Partner & Document

@Schema({timestamps:true})
export class Partner {
    @Prop({type:String,required:true})
    name:string


}

export const PartnerSchema = SchemaFactory.createForClass(Partner)