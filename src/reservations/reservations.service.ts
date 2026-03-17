import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Reservation, ReservationDocument } from './schema/reservation.schema';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class ReservationService {

  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
    private whatsappService: WhatsappService,
    private emailService: MailService
  ) { }

  async create(dto: CreateReservationDto) {
    const reservation = await this.reservationModel.create({ ...dto, package: new Types.ObjectId(dto.package) });
    // console.log(reservation)
    // await this.whatsappService.sendReservationConfirmation(
    //   reservation.phone,
    //   reservation
    // );
    const populatedReservation = await this.reservationModel.findById(reservation._id).populate('package');

    await this.emailService.sendNewReservationNotification(populatedReservation)

    return populatedReservation;
  }

  async findAll(filters: {
    country?: string;
    phone?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    const query: any = {};

    if (filters.country) query.country = { $regex: new RegExp(filters.country, 'i') };
    if (filters.phone) query.phone = { $regex: new RegExp(filters.phone, 'i') };

    if (filters.fromDate || filters.toDate) {
      query.expectedArrivalDate = {};
      if (filters.fromDate) query.expectedArrivalDate.$gte = new Date(filters.fromDate);
      if (filters.toDate) query.expectedArrivalDate.$lte = new Date(filters.toDate);
    }

    return this.reservationModel.find(query).populate("package").sort({ expectedArrivalDate: 1 }).exec();
  }

  async findOne(id: string) {
    const reservation = await this.reservationModel.findById(id).populate("package");
    if (!reservation) throw new NotFoundException('Reservation not found');
    return reservation;
  }

  async update(id: string, dto: UpdateReservationDto) {
    const reservation = await this.reservationModel.findByIdAndUpdate(id, dto, { new: true });
    if (!reservation) throw new NotFoundException('Reservation not found');
    return reservation;
  }

  async remove(id: string) {
    const result = await this.reservationModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Reservation not found');
    return { message: 'Reservation deleted successfully' };
  }
}
