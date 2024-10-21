import { Module } from '@nestjs/common';
import { SteamGenerationModule } from './steam-generation/steam-generation.module'; 
import { ActivityModule } from './activity/activity.module';

@Module({
  imports: [SteamGenerationModule, ActivityModule],
  exports: [SteamGenerationModule, ActivityModule],
})
export class RecordModule {}
