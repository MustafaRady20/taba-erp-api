import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { EmpRevenueService } from './emp-revenue.service';
import {
  CreateEmpRevenueDto,
  UpdateEmpRevenueDto,
} from './dto/emp-revenue.dto';
import { ApiBody, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';

@Controller('emp-revenue')
export class EmpRevenueController {
  constructor(private readonly service: EmpRevenueService) {}

  @Post()
  @ApiOperation({
    summary: 'Create employee revenue',
    description:
      'Create a revenue record with multiple currencies and calculate total EGP amount',
  })
  @ApiBody({
    type: CreateEmpRevenueDto,
    examples: {
      example: {
        summary: 'Multiple currencies revenue',
        value: {
          activity: '65f1b2...',
          employee: '65a9c3...',
          currencies: [
            { currency: 'USD_ID', amount: 100 },
            { currency: 'EUR_ID', amount: 50 },
          ],
          date: '2026-01-30',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Revenue record created successfully',
  })
  create(@Body() dto: CreateEmpRevenueDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('report')
  async report(
    @Query('period') period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly',
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('date') date?: string,
      @Query('currency') currency?: string,
        @Query('activity') activity?: string,
  ) {
    const parsedYear = year ? parseInt(year, 10) : undefined;
    const parsedMonth = month ? parseInt(month, 10) : undefined;

    return this.service.report(period, parsedYear, parsedMonth, date,activity,currency);
  }

  @Get('employee/:id')
  findByEmployee(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.service.findByEmployee(id, pageNum, limitNum);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmpRevenueDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}