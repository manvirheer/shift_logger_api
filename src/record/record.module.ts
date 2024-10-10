import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from './entities/record.entity';
import { SteamGenerationRecord } from './steam_generation/entities/steam_generation_record.entity';
import { SteamGenerationRecordService } from './steam_generation/steam_generation.service';
import { SteamGenerationRecordController } from './steam_generation/steam_generation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Record, SteamGenerationRecord]),
  ],
  controllers: [SteamGenerationRecordController],
  providers: [SteamGenerationRecordService],
})
export class RecordModule {}