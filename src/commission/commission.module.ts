import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Commission, CommissionSchema } from './schemas/commission.schema';
import { CommissionService } from './commission.service';
import { CommissionController } from './commission.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Commission.name, schema: CommissionSchema },
    ]),
  ],
  controllers: [CommissionController],
  providers: [CommissionService],
  exports:[CommissionService]
})
export class CommissionModule {}