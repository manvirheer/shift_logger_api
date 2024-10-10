import { Test, TestingModule } from '@nestjs/testing';
import { SteamGenerationRecordService } from './steam_generation.service';

describe('SteamGenerationService', () => {
  let service: SteamGenerationRecordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SteamGenerationRecordService],
    }).compile();

    service = module.get<SteamGenerationRecordService>(SteamGenerationRecordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
