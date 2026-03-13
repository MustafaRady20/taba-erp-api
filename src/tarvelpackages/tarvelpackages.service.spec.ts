import { Test, TestingModule } from '@nestjs/testing';
import { TarvelpackagesService } from './tarvelpackages.service';

describe('TarvelpackagesService', () => {
  let service: TarvelpackagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TarvelpackagesService],
    }).compile();

    service = module.get<TarvelpackagesService>(TarvelpackagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
