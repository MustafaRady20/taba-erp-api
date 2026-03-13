import { Module } from '@nestjs/common';
import { TarvelpackagesService } from './tarvelpackages.service';
import { TarvelpackagesController } from './tarvelpackages.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Package, PackageSchema } from './schema/package.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Package.name, schema: PackageSchema }]),
  ],
  providers: [TarvelpackagesService],
  controllers: [TarvelpackagesController],
})
export class TarvelpackagesModule {}
