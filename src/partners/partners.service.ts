import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Partner, PartnerDocument } from './schemas/partner.schema';
import {
  PartnerProfit,
  PartnerProfitDocument,
} from './schemas/partner-profits.schema';
import { CreatePartnerDto, UpdatePartnerDto } from './dto/partners.dto';
import {
  CreatePartnerProfitDto,
  UpdatePartnerProfitDto,
} from './dto/partner-profit.dto';

@Injectable()
export class PartnerService {
  constructor(
    @InjectModel(Partner.name)
    private readonly partnerModel: Model<PartnerDocument>,

    @InjectModel(PartnerProfit.name)
    private readonly partnerProfitModel: Model<PartnerProfitDocument>,
  ) {}

  createPartner(dto: CreatePartnerDto) {
    return this.partnerModel.create(dto);
  }

  findAllPartners() {
    return this.partnerModel.find();
  }

  async findPartnerById(id: string) {
    const partner = await this.partnerModel.findById(id);
    if (!partner) throw new NotFoundException('Partner not found');
    return partner;
  }

  async updatePartner(id: string, dto: UpdatePartnerDto) {
    const partner = await this.partnerModel.findByIdAndUpdate(id, dto, {
      new: true,
    });

    if (!partner) throw new NotFoundException('Partner not found');
    return partner;
  }

  async deletePartner(id: string) {
    const partner = await this.partnerModel.findByIdAndDelete(id);
    if (!partner) throw new NotFoundException('Partner not found');

    await this.partnerProfitModel.deleteMany({ partner: id });

    return { message: 'Partner deleted successfully' };
  }

  createProfit(dto: CreatePartnerProfitDto) {
    return this.partnerProfitModel.create({
      ...dto,
      partner: new Types.ObjectId(dto.partner),
      activity: new Types.ObjectId(dto.activity),
    });
  }

  findAllProfits() {
    return this.partnerProfitModel
      .find()
      .populate('partner')
      .populate('activity');
  }

  findPartnerProfits(partnerId: string) {
    return this.partnerProfitModel
      .find({ partner: partnerId })
      .populate('activity');
  }

  async getPartnerTotalProfit(partnerId: string) {
    const result = await this.partnerProfitModel.aggregate([
      { $match: { partner: new Types.ObjectId(partnerId) } },
      {
        $group: {
          _id: '$partner',
          totalProfit: { $sum: '$profit' },
        },
      },
    ]);

    return result[0]?.totalProfit ?? 0;
  }

  async updateProfit(id: string, dto: UpdatePartnerProfitDto) {
    const profit = await this.partnerProfitModel.findByIdAndUpdate(
      id,
      {
        ...dto,
        ...(dto.partner && { partner: new Types.ObjectId(dto.partner) }),
        ...(dto.activity && { activity: new Types.ObjectId(dto.activity) }),
      },
      { new: true },
    );

    if (!profit) throw new NotFoundException('Profit record not found');
    return profit;
  }

  async deleteProfit(id: string) {
    const profit = await this.partnerProfitModel.findByIdAndDelete(id);
    if (!profit) throw new NotFoundException('Profit record not found');
    return { message: 'Profit deleted successfully' };
  }
}
