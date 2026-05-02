import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  EmpRevenue,
  EmpRevenueDocument,
  RevenueCurrency,
} from './schema/revenue.schema';
import {
  CreateEmpRevenueDto,
  UpdateEmpRevenueDto,
} from './dto/emp-revenue.dto';
import {
  Currency,
  CurrencyDocument,
} from 'src/currency/shcema/currency.schema';
import { CreateCommissionDto } from 'src/commission/dto/commission.dto';
import { Commission, CommissionDocument } from 'src/commission/schemas/commission.schema';
import { CommissionService } from 'src/commission/commission.service';
import { Activity, ActivityDocument } from 'src/activity/schema/activity.schema';

@Injectable()
export class EmpRevenueService {
  constructor(
    @InjectModel(EmpRevenue.name)
    private readonly model: Model<EmpRevenueDocument>,

    @InjectModel(Currency.name)
    private readonly currencyModel: Model<CurrencyDocument>,

    @InjectModel(Activity.name)
    private readonly activityModel: Model<ActivityDocument>,

    private readonly CommissionService: CommissionService,
  ) { }

  // ---------- CREATE ----------
  async create(dto: CreateEmpRevenueDto) {
    const currencies: RevenueCurrency[] = [];
    let totalEGPAmount = 0;

    const activity = await this.activityModel.findById(dto.activity);
    if (!activity) {
      throw new NotFoundException("activity not found");
    }

    for (const item of dto.currencies) {
      const currency = await this.currencyModel.findById(item.currency);

      if (!currency) {
        throw new NotFoundException(`Currency not found: ${item.currency}`);
      }

      const rate = item.exchangeRate || currency.exchangeRate;
      const egpAmount = item.amount * rate;

      totalEGPAmount += egpAmount;

      currencies.push({
        currency: new Types.ObjectId(item.currency),
        amount: item.amount,
        exchangeRate: rate,
        egpAmount,
      });
    }

    let empCommission = 0;
    let amountAfterCommission = totalEGPAmount;

    if (activity.name === "الحقايب") {
      empCommission = totalEGPAmount * 0.1;
      amountAfterCommission = totalEGPAmount - empCommission;
    }

    const empRev = await this.model.create({
      activity: new Types.ObjectId(dto.activity),
      employee: new Types.ObjectId(dto.employee),
      currencies,
      totalEGPAmount: amountAfterCommission,
      date: dto.date ?? new Date(),
    });

    await this.CommissionService.create({
      amount: empCommission,
      userId: empRev.employee.toString(),
      date: empRev.date,
    });

    return empRev;
  }


  // ---------- FIND ALL ----------
  async findAll(month?: number, year?: number) {
    const filter: any = {};

    if (month || year) {
      const now = new Date();

      const targetYear = year || now.getFullYear();
      const targetMonth = month ? month - 1 : now.getMonth();

      const start = new Date(targetYear, targetMonth, 1);
      const end = new Date(targetYear, targetMonth + 1, 1);

      filter.date = {
        $gte: start,
        $lt: end,
      };
    }
    return this.model
      .find(filter)
      .sort({ createdAt: -1 })
      .populate('activity')
      .populate('employee')
      .populate('currencies.currency')
      .exec();
  }

  // ---------- UPDATE ----------
  async update(id: string, dto: UpdateEmpRevenueDto) {
    const existing = await this.model.findById(id);
    if (!existing) {
      throw new NotFoundException('Record not found');
    }

    let currencies = existing.currencies;
    let totalEGPAmount = existing.totalEGPAmount;

    if (dto.currencies) {
      currencies = [];
      totalEGPAmount = 0;

      for (const item of dto.currencies) {
        const currency = await this.currencyModel.findById(item.currency);
        if (!currency) {
          throw new NotFoundException(`Currency not found: ${item.currency}`);
        }

        const egpAmount = item.amount * currency.exchangeRate;
        totalEGPAmount += egpAmount;

        currencies.push({
          currency: new Types.ObjectId(item.currency),
          amount: item.amount,
          exchangeRate: currency.exchangeRate,
          egpAmount,
        });
      }
    }

    return this.model.findByIdAndUpdate(
      id,
      {
        ...dto,
        currencies,
        totalEGPAmount,
      },
      { new: true },
    );
  }

  // ---------- DELETE ----------
  async delete(id: string) {
    return this.model.findByIdAndDelete(id);
  }

  // ---------- REPORT ----------
  async report(
    period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'range',
    year?: number,
    month?: number,
    date?: string,
    activity?: string,
    currency?: string,
    startDate?: string,   
    endDate?: string,     // used when period === 'range'
  ) {
    let start: Date;
    let end: Date;

    if (period === 'range') {
      if (!startDate || !endDate) {
        throw new BadRequestException(
          'startDate and endDate are required when period is "range"',
        );
      }
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      if (start > end) {
        throw new BadRequestException('startDate must be before endDate');
      }
    } else {
      const parsedDate = date ? new Date(date) : undefined;
      ({ start, end } = this.getDateRange(period, year, month, parsedDate));
    }

    const match: Record<string, any> = {
      date: { $gte: start, $lte: end },
    };

    if (activity) {
      match.activity = new Types.ObjectId(activity);
    }

    if (currency) {
      match['currencies.currency'] = new Types.ObjectId(currency);
    }

    const revenueField = currency
      ? {
        $sum: {
          $reduce: {
            input: {
              $filter: {
                input: '$currencies',
                as: 'c',
                cond: {
                  $eq: ['$$c.currency', new Types.ObjectId(currency)],
                },
              },
            },
            initialValue: 0,
            in: { $add: ['$$value', '$$this.egpAmount'] },
          },
        },
      }
      : { $sum: '$totalEGPAmount' };

    const totalRevenue = await this.model.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: revenueField,
        },
      },
    ]);

    const revenueByEmployee = await this.model.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$employee',
          total: revenueField,
        },
      },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'employee',
        },
      },
      { $unwind: '$employee' },
      { $sort: { total: -1 } },
    ]);

    const revenueByActivity = await this.model.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$activity',
          total: revenueField,
        },
      },
      {
        $lookup: {
          from: 'activities',
          localField: '_id',
          foreignField: '_id',
          as: 'activity',
        },
      },
      { $unwind: '$activity' },
      { $sort: { total: -1 } },
    ]);

    return {
      period,
      dateRange: { start, end },
      totalRevenue: totalRevenue[0]?.totalRevenue || 0,
      revenueByEmployee,
      revenueByActivity,
    };
  }

  // ---------- BY EMPLOYEE ----------
  async findByEmployee(employeeId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const total = await this.model.countDocuments({
      employee: new Types.ObjectId(employeeId),
    });

    const data = await this.model
      .find({ employee: new Types.ObjectId(employeeId) })
      .populate('activity')
      .populate('employee')
      .populate('currencies.currency')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
    };
  }
  private getDateRange(
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    year?: number,
    month?: number,
    date?: Date,
  ) {
    const now = new Date();
    let start: Date;
    let end: Date;

    // Specific date
    if (date) {
      start = new Date(date);
      start.setHours(0, 0, 0, 0);

      end = new Date(date);
      end.setHours(23, 59, 59, 999);

      return { start, end };
    }

    // Year + Month
    if (year && month) {
      start = new Date(year, month - 1, 1);
      end = new Date(year, month, 0, 23, 59, 59, 999);
      return { start, end };
    }

    // Year only
    if (year) {
      start = new Date(year, 0, 1);
      end = new Date(year, 11, 31, 23, 59, 59, 999);
      return { start, end };
    }

    switch (period) {
      case 'daily':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999,
        );
        break;

      case 'weekly':
        const day = now.getDay();
        start = new Date(now);
        start.setDate(now.getDate() - day);
        start.setHours(0, 0, 0, 0);

        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        break;

      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        );
        break;

      case 'yearly':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
    }

    return { start, end };
  }
}
