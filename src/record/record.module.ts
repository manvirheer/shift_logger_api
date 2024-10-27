import { Module } from '@nestjs/common';
import { SteamGenerationModule } from './steam-generation/steam-generation.module'; 
import { ActivityModule } from './activity/activity.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [SteamGenerationModule, ActivityModule, InventoryModule],
  exports: [SteamGenerationModule, ActivityModule, InventoryModule],
})
export class RecordModule {}
