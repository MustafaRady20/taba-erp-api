import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';
import { CreateCommissionDto, UpdateCommissionDto } from './dto/commission.dto';
import { Commission, CommissionDocument } from './schemas/commission.schema';


@Injectable()
export class CommissionService {
  constructor(
    @InjectModel(Commission.name)
    private readonly commissionModel: Model<CommissionDocument>,
  ) {}

  async create(dto: CreateCommissionDto): Promise<Commission> {
    const created = new this.commissionModel(dto);
    return created.save();
  }

  async findAll(): Promise<Commission[]> {
    return this.commissionModel.find().sort({ createdAt: -1 });
  }

  async getMonthlyTotalPerUser(
  userId: string,
  month?: number, 
  year?: number,
) {
  const now = new Date();

  const targetYear = year || now.getFullYear();
  const targetMonth = month ? month - 1 : now.getMonth(); 

  const start = new Date(targetYear, targetMonth, 1);
  const end = new Date(targetYear, targetMonth + 1, 1);

  const result = await this.commissionModel.aggregate([
    {
      $match: {
        userId,
        date: {
          $gte: start,
          $lt: end,
        },
      },
    },
    {
      $group: {
        _id: '$userId',
        totalCommission: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  return result[0] || {
    userId,
    totalCommission: 0,
    count: 0,
  };
}

  async findByUser(userId: string): Promise<Commission[]> {
    return this.commissionModel
      .find({ userId })
      .sort({ createdAt: -1 });
  }


  async findOne(id: string): Promise<Commission> {
    const commission = await this.commissionModel.findById(id);
    if (!commission) throw new NotFoundException('Commission not found');
    return commission;
  }

  async update(
    id: string,
    dto: UpdateCommissionDto,
  ): Promise<Commission> {
    const updated = await this.commissionModel.findOne(
      { userId: new Types.ObjectId(id) },
    );
    if (!updated) throw new NotFoundException('Commission not found');

    const newComission = updated.amount + dto.amount;

    updated.amount = newComission;
    await updated.save();

    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const deleted = await this.commissionModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Commission not found');

    return { message: 'Commission deleted successfully' };
  }
}