import { HttpException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateRevenueDto, UpdateRevenueDto } from "./dto/create-revenue.dto";
import { CafeRevenue, CafeRevenueDocument } from "./schema/cafe-revenue.schema";

@Injectable()
export class CafeRevenueService {
  constructor(
    @InjectModel(CafeRevenue.name)
    private revenueModel: Model<CafeRevenueDocument>,
  ) {}

  async create(dto: CreateRevenueDto) {
    const createData = new this.revenueModel({
      ...dto,
      date: new Date(dto.date),
    });
    return createData.save();
  }

  async findAll() {
    return this.revenueModel
      .find()
      .populate("cafeId")
      .sort({ date: -1 })
      .exec();
  }

  async update(id:string,dto:UpdateRevenueDto){
    const updatedData = await this.revenueModel.findByIdAndUpdate(new Types.ObjectId(id),dto,{new:true})
    if(!updatedData){
      throw new HttpException("can't be updated",400)
    }
    return updatedData
  }
  // DAILY REVENUE
async getDailyRevenue(cafeId: string, date: string) {
  const target = new Date(date);
  // const objectId = new Types.ObjectId(cafeId);

  return this.revenueModel.aggregate([
    {
      $match: {
        cafeId: cafeId,
        createdAt: {
          $gte: startOfDay(target),
          $lte: endOfDay(target),
        },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
      },
    },
  ]);
}


async getWeeklyRevenue(cafeId: string) {
  const today = new Date();
  const start = new Date();
  start.setDate(today.getDate() - 7);

  return this.revenueModel.aggregate([
    {
      $match: {
        cafeId: cafeId,
        createdAt: { $gte: start, $lte: today },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
      },
    },
  ]);
}


async getMonthlyRevenue(cafeId: string) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);

  return this.revenueModel.aggregate([
    {
      $match: {
        cafeId: cafeId,
        createdAt: { $gte: start, $lte: today },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
      },
    },
  ]);
}


async getYearlyRevenue(cafeId: string) {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 1);

  return this.revenueModel.aggregate([
    {
      $match: {
        cafeId: cafeId,
        createdAt: { $gte: start, $lte: today },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
      },
    },
  ]);
}

  
}


// Helpers
function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
}
