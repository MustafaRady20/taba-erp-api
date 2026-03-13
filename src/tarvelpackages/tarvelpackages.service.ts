import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Package } from './schema/package.schema';
import { CreatePackageDto, UpdatePackageDto } from './dto/package.dto';

@Injectable()
export class TarvelpackagesService {
  constructor(
    @InjectModel(Package.name)
    private packageModel: Model<Package>,
  ) {}

  async create(createPackageDto: CreatePackageDto) {
    const pkg = new this.packageModel(createPackageDto);
    return pkg.save();
  }

  async findAll() {
    return this.packageModel.find().sort({ price: 1 });
  }

  async findOne(id: string) {
    const pkg = await this.packageModel.findById(id);

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    return pkg;
  }

  async update(id: string, updatePackageDto: UpdatePackageDto) {
    const pkg = await this.packageModel.findByIdAndUpdate(
      id,
      updatePackageDto,
      { new: true },
    );

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    return pkg;
  }

  async remove(id: string) {
    const pkg = await this.packageModel.findByIdAndDelete(id);

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    return { message: 'Package deleted successfully' };
  }
}