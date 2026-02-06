import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeesModule } from './employees/employees.module';
import { EmpRevenueModule } from './emp-revenue/emp-revenue.module';
import { CafeModule } from './cafe/cafe.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ReviewModule } from './reviews/reviews.module';
import { ReservationModule } from './reservations/reservations.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { RulesModule } from './rules/rules.module';
import { CafeRevenueModule } from './cafe-revenue/cafe-revenue.module';
import { CafePurchasesModule } from './cafe-purchases/cafe-purchases.module';
import { ActivityModule } from './activity/activity.module';
import { CategoryModule } from './categories/categories.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { SalaryModule } from './salaries/salaries.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MailModule } from './mail/mail.module';
import { VipRevenuesModule } from './vip-revenues/vip-revenues.module';
import { CurrencyModule } from './currency/currency.module';
import { PartnersModule } from './partners/partners.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow('DATABASE_HOST'),
        autoIndex: true,
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    EmployeesModule,
    ReservationModule,
    ReviewModule,
    EmpRevenueModule,
    CafeModule,
    AttendanceModule,
    AuthModule,
    RulesModule,
    CafeRevenueModule,
    CafePurchasesModule,
    CategoryModule,
    ActivityModule,
    WhatsappModule,
    SalaryModule,
    DashboardModule,
    CloudinaryModule,
    MailModule,
    VipRevenuesModule,
    CurrencyModule,
    PartnersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
