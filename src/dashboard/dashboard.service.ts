import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmpRevenue, EmpRevenueDocument } from '../emp-revenue/schema/revenue.schema';
import { Employees, EmployeesDocument } from '../employees/schema/employee.schema';
import { CafePurchase, CafePurchaseDocument } from 'src/cafe-purchases/schema/purchase.schema';
import { CafeRevenue, CafeRevenueDocument } from 'src/cafe-revenue/schema/cafe-revenue.schema';
import { Reservation, ReservationDocument } from 'src/reservations/schema/reservation.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(EmpRevenue.name)
    private readonly revenueModel: Model<EmpRevenueDocument>,

    @InjectModel(Employees.name)
    private readonly employeeModel: Model<EmployeesDocument>,

    @InjectModel(CafePurchase.name)
    private readonly cafePurchaseModel: Model<CafePurchaseDocument>,

    @InjectModel(CafeRevenue.name)
    private readonly cafeRevenueModel: Model<CafeRevenueDocument>,

    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<ReservationDocument>,
  ) {}

  async getDashboardInsights() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Previous month for comparison
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // 🔹 Employee Revenue Insights
    const revenues = await this.revenueModel
      .find({ date: { $gte: startOfMonth, $lte: endOfMonth } })
      .populate('activity')
      .populate('employee');

    const totalEmployeeRevenue = revenues.reduce((sum, r) => sum + r.totalEGPAmount, 0);

    const revenuePerActivity = revenues.reduce((acc, r: any) => {
      const name = r.activity?.name || 'غير محدد';
      acc[name] = (acc[name] || 0) + r.totalEGPAmount;
      return acc;
    }, {} as Record<string, number>);

    const revenueByEmployee = revenues.reduce((acc, r: any) => {
      const emp = r.employee?.name || 'موظف غير معروف';
      acc[emp] = (acc[emp] || 0) + r.totalEGPAmount;
      return acc;
    }, {} as Record<string, number>);

    const topEmployees = Object.entries(revenueByEmployee)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, total]) => ({ name, totalRevenue: total }));

    // 🔹 Cafe Revenue Insights
    const cafeRevenues = await this.cafeRevenueModel
      .find({ date: { $gte: startOfMonth, $lte: endOfMonth } })
      .populate('cafeId');

    const totalCafeRevenue = cafeRevenues.reduce((sum, r) => sum + r.amount, 0);

    // Revenue by shift
    const revenueByShift = cafeRevenues.reduce((acc, r) => {
      acc[r.shift] = (acc[r.shift] || 0) + r.amount;
      return acc;
    }, {} as Record<string, number>);

    // Revenue by cafe
    const revenueByCafe = cafeRevenues.reduce((acc, r: any) => {
      const cafeName = r.cafeId?.name || 'مقهى غير محدد';
      acc[cafeName] = (acc[cafeName] || 0) + r.amount;
      return acc;
    }, {} as Record<string, number>);

    // 🔹 Cafe Purchase Insights
    const cafePurchases = await this.cafePurchaseModel
      .find({ 
        purchaseDate: { $gte: startOfMonth, $lte: endOfMonth },
        isDeleted: false 
      })
      .populate('category')
      .populate('cafeId');

    const totalPurchaseCost = cafePurchases.reduce((sum, p) => sum + p.totalCost, 0);

    // Purchases by category
    const purchasesByCategory = cafePurchases.reduce((acc, p: any) => {
      const categoryName = p.category?.name || 'بدون فئة';
      acc[categoryName] = (acc[categoryName] || 0) + p.totalCost;
      return acc;
    }, {} as Record<string, number>);

    // Purchases by cafe
    const purchasesByCafe = cafePurchases.reduce((acc, p: any) => {
      const cafeName = p.cafeId?.name || 'مقهى غير محدد';
      acc[cafeName] = (acc[cafeName] || 0) + p.totalCost;
      return acc;
    }, {} as Record<string, number>);

    // 🔹 Reservation Insights
    const reservations = await this.reservationModel.find({
      expectedArrivalDate: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const totalReservations = reservations.length;
    const totalGuests = reservations.reduce((sum, r) => sum + 1 + r.numberOfCompanions, 0);

    

  

    // Reservations by gender (if available)
    const reservationsByGender = reservations.reduce((acc, r) => {
      if (r.gender) {
        acc[r.gender] = (acc[r.gender] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Average age
    const avgAge = reservations.length > 0
      ? reservations.reduce((sum, r) => sum + r.age, 0) / reservations.length
      : 0;

    // 🔹 Financial Summary
    const totalRevenue = totalEmployeeRevenue + totalCafeRevenue;
    const netProfit = totalCafeRevenue - totalPurchaseCost; // Cafe profit only
    const profitMargin = totalCafeRevenue > 0 
      ? ((netProfit / totalCafeRevenue) * 100).toFixed(2) 
      : 0;

    // 🔹 Previous Month Comparison (optional)
    const prevMonthCafeRevenue = await this.cafeRevenueModel
      .find({ date: { $gte: startOfPrevMonth, $lte: endOfPrevMonth } });
    
    const prevMonthTotal = prevMonthCafeRevenue.reduce((sum, r) => sum + r.amount, 0);
    const revenueGrowth = prevMonthTotal > 0
      ? (((totalCafeRevenue - prevMonthTotal) / prevMonthTotal) * 100).toFixed(2)
      : 0;

    return {
      // 📊 Overview
      summary: {
        totalRevenue,
        totalEmployeeRevenue,
        totalCafeRevenue,
        totalPurchaseCost,
        netProfit,
        profitMargin: `${profitMargin}%`,
        revenueGrowth: `${revenueGrowth}%`,
      },

      // 👥 Employee Performance
      employeeInsights: {
        totalEmployeeRevenue,
        activityRevenue: Object.entries(revenuePerActivity).map(([activity, total]) => ({
          activity,
          total,
        })),
        topEmployees,
      },

      // ☕ Cafe Performance
      cafeInsights: {
        totalCafeRevenue,
        revenueByShift: Object.entries(revenueByShift).map(([shift, total]) => ({
          shift,
          total,
        })),
        revenueByCafe: Object.entries(revenueByCafe).map(([cafe, total]) => ({
          cafe,
          total,
        })),
      },

      // 🛒 Purchase Analysis
      purchaseInsights: {
        totalPurchaseCost,
        totalPurchases: cafePurchases.length,
        purchasesByCategory: Object.entries(purchasesByCategory).map(([category, total]) => ({
          category,
          total,
        })),
        purchasesByCafe: Object.entries(purchasesByCafe).map(([cafe, total]) => ({
          cafe,
          total,
        })),
      },

      // 📅 Reservation Insights
      reservationInsights: {
        totalReservations,
        totalGuests,
        averageAge: parseFloat(avgAge.toFixed(1)),
        
        reservationsByGender: Object.entries(reservationsByGender).map(([gender, count]) => ({
          gender,
          count,
        })),
      },
    };
  }
}