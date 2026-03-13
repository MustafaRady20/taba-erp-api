import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateVipRevenueDto } from './dto/create-vip-revenue.dto';
import { UpdateVipRevenueDto } from './dto/update-vip-revenue.dto';
import {
  RevenueCurrency,
  VipRevenue,
  VipRevenueDocument,
} from './schema/vip-revenues.schema';
import { VipRevenueFilterDto } from './dto/vip-revenue-filter.dto';
import {
  Currency,
  CurrencyDocument,
} from 'src/currency/shcema/currency.schema';

@Injectable()
export class VipRevenuesService {
  constructor(
    @InjectModel(VipRevenue.name)
    private readonly vipRevenueModel: Model<VipRevenueDocument>,
    @InjectModel(Currency.name)
    private readonly currencyModel: Model<CurrencyDocument>,
  ) {}

  async create(dto: CreateVipRevenueDto): Promise<VipRevenue> {
    const currencies: RevenueCurrency[] = [];
    let amount = 0;

    for (const item of dto.currencies) {
      const currency = await this.currencyModel.findById(item.currency);
      console.log(item);
      if (!currency) {
        throw new NotFoundException(`Currency not found: ${item.currency}`);
      }

      const egpAmount =
        item.amount * item.exchangeRate || currency.exchangeRate;
      amount += egpAmount;

      currencies.push({
        currency: new Types.ObjectId(item.currency),
        amount: item.amount,
        exchangeRate: item.exchangeRate || currency.exchangeRate,
        egpAmount,
      });
    }
    return this.vipRevenueModel.create({
      employee: new Types.ObjectId(dto.employee),
      currencies,
      amount,
      date: dto.date ?? new Date(),
    });
  }

  async findAll(filter?: VipRevenueFilterDto) {
    const query: any = {};

    if (filter?.employee) {
      query.employee = filter.employee;
    }

    if (filter?.fromDate || filter?.toDate) {
      query.date = {};
      if (filter.fromDate) {
        query.date.$gte = new Date(filter.fromDate);
      }
      if (filter.toDate) {
        query.date.$lte = new Date(filter.toDate);
      }
    }

    return this.vipRevenueModel
      .find(query)
      .populate('employee')
      .sort({ date: -1 });
  }

  async findOne(id: string): Promise<VipRevenue> {
    const revenue = await this.vipRevenueModel
      .findById(id)
      .populate('employee');

    if (!revenue) {
      throw new NotFoundException('VIP Revenue not found');
    }

    return revenue;
  }

  async update(id: string, dto: UpdateVipRevenueDto): Promise<VipRevenue> {
    const revenue = await this.vipRevenueModel.findByIdAndUpdate(id, dto, {
      new: true,
    });

    if (!revenue) {
      throw new NotFoundException('VIP Revenue not found');
    }

    return revenue;
  }

  async remove(id: string): Promise<void> {
    const result = await this.vipRevenueModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException('VIP Revenue not found');
    }
  }

  async getStatistics(type: 'month' | 'year' | 'total') {
    if (type === 'total') {
      const result = await this.vipRevenueModel.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      return { total: result[0]?.total || 0 };
    }

    if (type === 'month') {
      return this.vipRevenueModel.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
            },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
      ]);
    }

    if (type === 'year') {
      return this.vipRevenueModel.aggregate([
        {
          $group: {
            _id: { year: { $year: '$date' } },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.year': -1 } },
      ]);
    }
  }
}
