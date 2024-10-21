import { Test, TestingModule } from '@nestjs/testing';
import { SteamGenerationService } from './steam-generation.service';

describe('SteamGenerationService', () => {
  let service: SteamGenerationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SteamGenerationService],
    }).compile();

    service = module.get<SteamGenerationService>(SteamGenerationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
