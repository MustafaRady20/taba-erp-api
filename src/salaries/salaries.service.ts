import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EmpRevenue,
  EmpRevenueDocument,
} from 'src/emp-revenue/schema/revenue.schema';
import {
  Employees,
  EmployeesDocument,
} from 'src/employees/schema/employee.schema';

@Injectable()
export class SalaryService {
  constructor(
    @InjectModel(EmpRevenue.name)
    private readonly revenueModel: Model<EmpRevenueDocument>,

    @InjectModel(Employees.name)
    private readonly employeeModel: Model<EmployeesDocument>,
  ) {}

  async calculateSalaries() {
    /** Fetch all employees */
    const employees = await this.employeeModel.find();

    const variableEmployeesCount = employees.filter(
      (e) => e.type === 'variable',
    ).length;

    /** Aggregate all revenues grouped by activity type */
    const revenues = await this.revenueModel.aggregate([
      {
        $lookup: {
          from: 'activities',
          localField: 'activity',
          foreignField: '_id',
          as: 'activity',
        },
      },
      { $unwind: '$activity' },
    ]);

    const totalBagging = revenues
      .filter((r) => r.activity?.name === 'حمل حقائب')
      .reduce((sum, r) => {
        const total =
          typeof r.totalEGPAmount === 'number'
            ? r.totalEGPAmount
            : Array.isArray(r.currencies)
              ? r.currencies.reduce(
                  (s, c) =>
                    s + (Number(c.amount) * Number(c.exchangeRate) || 0),
                  0,
                )
              : 0;

        return sum + total;
      }, 0);

    const totalCleaning = revenues
      .filter((r) => r.activity.name === 'نظافة')
      .reduce((sum, r) => sum + r.totalEGPAmount, 0);

    const variableSalary =
      variableEmployeesCount > 0
        ? (totalCleaning + totalBagging / 3) / variableEmployeesCount
        : 0;

    console.log(totalBagging);
    return employees.map((employee) => ({
      employeeId: employee._id,
      name: employee.name,
      type: employee.type,
      salary:
        employee.type === 'fixed'
          ? (employee.fixedSalary ?? 0)
          : Number(variableSalary.toFixed(2)) || 0, // تنسيق أفضل
    }));
  }
}
