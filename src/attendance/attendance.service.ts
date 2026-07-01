import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Attendance, AttendanceDocument } from './schema/attendance.schema';
import { Employees, EmployeesDocument } from 'src/employees/schema/employee.schema';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  private readonly allowedLocation = {
    lat: 29.49119758605957,
    lng: 34.90092849731445,
    radius: 150, 
  };

  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,

    @InjectModel(Employees.name) private employeeModel: Model<EmployeesDocument>
  ) {}

  private distanceInMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // radius of Earth in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private validateLocation(lat: number, lng: number) {
    const dist = this.distanceInMeters(
      lat,
      lng,
      this.allowedLocation.lat,
      this.allowedLocation.lng,
    );
    if (dist > this.allowedLocation.radius) {
      throw new BadRequestException(
        `You are out of the allowed area (distance: ${Math.round(dist)} m).`,
      );
    }
  }

  async checkIn(employeeId: string, lat: number, lng: number) {
    this.validateLocation(lat, lng);

    const existing = await this.attendanceModel.findOne({
      employeeId: new Types.ObjectId(employeeId),
      checkOutTime: { $exists: false },
    });
    console.log(existing)

    if (existing) {
      throw new BadRequestException('You have already checked in.');
    
    }

    return this.attendanceModel.create({
      employeeId: new Types.ObjectId(employeeId),
      checkInTime: new Date(),
      checkInLocation: `${lat},${lng}`,
    });
  }

  async checkOut(employeeId: string, lat: number, lng: number) {
    this.validateLocation(lat, lng);

    const attendance = await this.attendanceModel.findOne({
      employeeId: new Types.ObjectId(employeeId),
      checkOutTime: { $exists: false },
    });

    if (!attendance) {
      throw new BadRequestException('No active check-in found.');
    }

    const checkOutTime = new Date();
    const totalHours =
      (checkOutTime.getTime() - attendance.checkInTime.getTime()) /
      (1000 * 60 * 60);

    attendance.checkOutTime = checkOutTime;
    attendance.checkOutLocation = `${lat},${lng}`;
    attendance.totalHours = parseFloat(totalHours.toFixed(2));

    return attendance.save();
  }

  // async getTodayAttendance() {
  //   const startOfDay = new Date();
  //   startOfDay.setHours(0, 0, 0, 0);

  //   const endOfDay = new Date();
  //   endOfDay.setHours(23, 59, 59, 999);

  //   const record = await this.attendanceModel.find({
  //     checkInTime: { $gte: startOfDay, $lte: endOfDay },
  //   }).populate("employeeId","_id name")

  //   if (!record) return { message: 'No attendance record found for today.' };

  //   return record;
  // }

  async getTodayAttendance() {
  const today = new Date();
  const { start, end } = this.getDayRange(today);

  const records = await this.attendanceModel
    .find({
      checkInTime: { $gte: start, $lte: end },
    })
    .populate('employeeId', '_id name');

  return records;
}

async getAttendanceByDate(date: string, name?: string) {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
  }

  const { start, end } = this.getDayRange(parsedDate);

  const employeeFilter: any = {};
  if (name) employeeFilter.name = new RegExp(name, 'i');

  let employeeIds: Types.ObjectId[] | undefined;

  if (name) {
    const employees = await this.employeeModel.find(employeeFilter).select('_id');
    employeeIds = employees.map((e) => e._id);
  }

  return this.attendanceModel
    .find({
      ...(employeeIds && { employeeId: { $in: employeeIds } }),
      checkInTime: { $gte: start, $lte: end },
    })
    .populate('employeeId', '_id name')
    .sort({ checkInTime: 1 });
}


  private getDayRange(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

  private getMonthRange(year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    return { start, end };
  }

  async getCurrentMonthAttendance(name?: string, phone?: string) {
    const now = new Date();
    const { start, end } = this.getMonthRange(now.getFullYear(), now.getMonth() + 1);

    return this.getAttendanceByMonthAndYear(now.getFullYear(), now.getMonth() + 1, name, phone);
  }

  async getAttendanceByMonthAndYear(year: number, month: number, name?: string, phone?: string) {
    const { start, end } = this.getMonthRange(year, month);

    const employeeFilter: any = {};
    if (name) employeeFilter.name = new RegExp(name, 'i');
    if (phone) employeeFilter.phone = new RegExp(phone, 'i');

    const employees = await this.employeeModel.find(employeeFilter).select('_id name phone');
    if (employees.length === 0) return [];

    const employeeIds = employees.map((e) => e._id);

    const attendance = await this.attendanceModel
      .find({
        employeeId: { $in: employeeIds },
        checkInTime: { $gte: start, $lte: end },
      })
      .populate('employeeId', 'name phone')
      .sort({ checkInTime: 1 });

    return attendance.map((record) => ({
      employeeName: (record as any).employeeId.name,
      employeePhone: (record as any).employeeId.phone,
      checkInTime: record.checkInTime,
      checkOutTime: record.checkOutTime,
      totalHours: record.totalHours,
    }));
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async autoCheckoutStaleAttendance() {
    this.logger.log('Auto-checkout cron triggered.');

    const threshold = new Date(Date.now() - 20 * 60 * 60 * 1000);

    const staleRecords = await this.attendanceModel.find({
      $or: [{ checkOutTime: { $exists: false } }, { checkOutTime: null }],
      checkInTime: { $lte: threshold },
    });

    if (staleRecords.length === 0) {
      this.logger.log('No stale attendance records found.');
      return;
    }

    const now = new Date();
    let processed = 0;

    for (const record of staleRecords) {
      try {
        const totalHours = (now.getTime() - record.checkInTime.getTime()) / (1000 * 60 * 60);
        record.checkOutTime = now;
        record.checkOutLocation = 'auto-checkout';
        record.totalHours = parseFloat(totalHours.toFixed(2));
        await record.save();
        processed++;
      } catch (err) {
        this.logger.error(`Failed to auto-checkout record ${record._id}: ${err.message}`);
      }
    }

    this.logger.log(`Auto-checked out ${processed}/${staleRecords.length} stale attendance record(s).`);
  }
}
