import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reservation, ReservationSchema } from './schema/reservation.schema';
import { ReservationController } from './reservations.controller';
import { ReservationService } from './reservations.service';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';
import { MailModule } from 'src/mail/mail.module';
import { Package, PackageSchema } from 'src/tarvelpackages/schema/package.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: Package.name, schema: PackageSchema }
    ]),
    WhatsappModule,
    MailModule
  ],
  controllers: [ReservationController],
  providers: [ReservationService],
  exports: [ReservationService],
})
export class ReservationModule {}
