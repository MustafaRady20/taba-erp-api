import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Patch,
    UseGuards,
    Query,
} from '@nestjs/common';
import { CommissionService } from './commission.service';

import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { CreateCommissionDto, UpdateCommissionDto } from './dto/commission.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Commissions')
@Controller('commissions')
export class CommissionController {
    constructor(private readonly service: CommissionService) { }

    @Post()
    @ApiOperation({ summary: 'Create a commission' })
    @ApiResponse({ status: 201, description: 'Commission created' })
    create(@Body() dto: CreateCommissionDto) {
        return this.service.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all commission' })
    findAll(@Query("month") month?: string,@Query("year")  year?: string) {
        return this.service.findAll(month? Number(month):undefined, year? Number(year):undefined);
    }
    @Get('user/:userId/monthly-total')
    @ApiOperation({ summary: 'Get total commission for a user by month' })
    @ApiParam({ name: 'userId', example: 'user123' })
    @ApiQuery({ name: 'month', required: false, example: 4 })
    @ApiQuery({ name: 'year', required: false, example: 2026 })
    getMonthlyTotal(
        @Param('userId') userId: string,
        @Query('month') month?: number,
        @Query('year') year?: number,
    ) {
        return this.service.getMonthlyTotalPerUser(
            userId,
            Number(month),
            Number(year),
        );
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get commissions by userId' })
    @ApiParam({ name: 'userId', example: 'user123' })
    findByUser(@Param('userId') userId: string) {
        return this.service.findByUser(userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get commission by id' })
    @ApiParam({ name: 'id' })
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update commission' })
    update(
        @Param('id') id: string,
        @Body() dto: UpdateCommissionDto,
    ) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete commission' })
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}