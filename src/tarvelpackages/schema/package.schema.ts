
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

class LocalizedContent {
  @Prop({ required: true })
  name: string;
  @Prop()
  description: string;
  @Prop({ type: [String], required: true })
  features: string[];
}

@Schema({ timestamps: true })
export class Package extends Document {
  @Prop({ type: LocalizedContent, required: true }) 
  ar: LocalizedContent;
  @Prop({ type: LocalizedContent, required: true })
   en: LocalizedContent;
  @Prop({ required: true }) price: number;
  @Prop({ default: false }) popular: boolean;
  @Prop({ default: false }) premium: boolean;
}

export const PackageSchema = SchemaFactory.createForClass(Package);