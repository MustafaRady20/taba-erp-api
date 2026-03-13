import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CreatePackageDto, UpdatePackageDto } from './dto/package.dto';
import { TarvelpackagesService } from './tarvelpackages.service';

@Controller('packages')
export class TarvelpackagesController {
  constructor(private readonly packagesService: TarvelpackagesService) {}

  @Post()
  create(@Body() createPackageDto: CreatePackageDto) {
    return this.packagesService.create(createPackageDto);
  }

  @Get()
  findAll() {
    return this.packagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packagesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePackageDto: UpdatePackageDto,
  ) {
    return this.packagesService.update(id, updatePackageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.packagesService.remove(id);
  }
}