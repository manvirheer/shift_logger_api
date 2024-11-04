import { Module } from '@nestjs/common';
import { SteamGenerationModule } from './steam-generation/steam-generation.module'; 
import { ActivityModule } from './activity/activity.module';
import { InventoryModule } from './inventory/inventory.module';
import { Ash } from './ash/entities/ash.entity';
import { AshModule } from './ash/ash.module';
import { SteamParametersModule } from './steam-parameters/steam-parameters.module';

@Module({
  imports: [SteamGenerationModule, ActivityModule, InventoryModule, AshModule, SteamParametersModule],
  exports: [SteamGenerationModule, ActivityModule, InventoryModule, AshModule, SteamParametersModule],
})
export class RecordModule {}
