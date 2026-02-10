import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReservationDocument = Reservation & Document;

@Schema({ timestamps: true })
export class Reservation {
  _id: Types.ObjectId;

  //  Guest info
  @Prop({ required: true })
  guestName: string;

  @Prop({ required: true })
  age: number;

  @Prop({ required: true })
  phone: string;


  @Prop()
  gender?: string;


  @Prop({ required: true, min: 0 })
  numberOfCompanions: number;

  // Dates & times
  @Prop({ required: true })
  expectedArrivalDate: Date;

  @Prop({ required: true })
  expectedArrivalTime: string; // e.g. "14:00"



  @Prop()
  transportationMode?: string; // e.g. "Car", "Flight", "Bus"

  @Prop()
  notes?: string;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
