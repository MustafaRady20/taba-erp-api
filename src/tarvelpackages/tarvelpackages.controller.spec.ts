import { Test, TestingModule } from '@nestjs/testing';
import { TarvelpackagesController } from './tarvelpackages.controller';

describe('TarvelpackagesController', () => {
  let controller: TarvelpackagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TarvelpackagesController],
    }).compile();

    controller = module.get<TarvelpackagesController>(TarvelpackagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
