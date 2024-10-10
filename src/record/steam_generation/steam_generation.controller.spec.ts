import { Test, TestingModule } from '@nestjs/testing';
import { SteamGenerationRecordController } from './steam_generation.controller';

describe('SteamGenerationController', () => {
  let controller: SteamGenerationRecordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SteamGenerationRecordController],
    }).compile();

    controller = module.get<SteamGenerationRecordController>(SteamGenerationRecordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
