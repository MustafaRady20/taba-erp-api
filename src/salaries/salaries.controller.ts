import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SalaryService } from './salaries.service';
import { GetSalariesDto } from './dto/getSalaries.dto';

@ApiTags('Salary')
@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}
@Get()
@ApiOperation({ summary: 'الحصول على رواتب الموظفين محسوبة آلياً' })
async getSalaries(@Query() dto: GetSalariesDto) {
  return this.salaryService.calculateSalaries(dto);
}
}
