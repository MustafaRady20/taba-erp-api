import { Controller, Get, Post, Body, Param, Patch } from "@nestjs/common";
import { CafeRevenueService } from "./cafe-revenue.service";
import { CreateRevenueDto, UpdateRevenueDto } from "./dto/create-revenue.dto";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("Cafe Revenue")
@Controller("revenue")
export class CafeRevenueController {
  constructor(private readonly revenueService: CafeRevenueService) {}

  @Post()
  @ApiOperation({ summary: "Store daily cafe revenue per shift" })
  create(@Body() dto: CreateRevenueDto) {
    return this.revenueService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Get all revenue entries" })
  findAll() {
    return this.revenueService.findAll();
  }


  @Patch(":id")
  update(@Param("id") id:string,@Body() dto:UpdateRevenueDto){
    return this.revenueService.update(id,dto)
  }
  @Get("daily/:cafeId/:date")
  @ApiOperation({ summary: "Get daily revenue" })
  getDaily(
    @Param("cafeId") cafeId: string,
    @Param("date") date: string,
  ) {
    return this.revenueService.getDailyRevenue(cafeId, date);
  }

  @Get("weekly/:cafeId")
  @ApiOperation({ summary: "Get weekly revenue" })
  getWeekly(@Param("cafeId") cafeId: string) {
    return this.revenueService.getWeeklyRevenue(cafeId);
  }

  @Get("monthly/:cafeId")
  @ApiOperation({ summary: "Get monthly revenue" })
  getMonthly(@Param("cafeId") cafeId: string) {
    return this.revenueService.getMonthlyRevenue(cafeId);
  }

  @Get("yearly/:cafeId")
  @ApiOperation({ summary: "Get yearly revenue" })
  getYearly(@Param("cafeId") cafeId: string) {
    return this.revenueService.getYearlyRevenue(cafeId);
  }
}
