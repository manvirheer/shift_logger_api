import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SteamGenerationRecord } from './entities/steam-generation-record.entity';
import { SteamGenerationService } from './steam-generation.service';
import { SteamGenerationController } from './steam-generation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SteamGenerationRecord])],
  controllers: [SteamGenerationController],
  providers: [SteamGenerationService],
})
export class SteamGenerationModule {}