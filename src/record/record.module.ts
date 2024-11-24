import { Module } from '@nestjs/common';
import { SteamGenerationModule } from './steam-generation/steam-generation.module'; 
import { ActivityModule } from './activity/activity.module';
import { InventoryModule } from './inventory/inventory.module';
import { Ash } from './ash/entities/ash.entity';
import { AshModule } from './ash/ash.module';
import { SteamParametersModule } from './steam-parameters/steam-parameters.module';
import { ShipmentModule } from './shipment/shipment.module';
import { DataEntryPeriodModule } from 'src/data-entry-period/data-entry-period.module';

@Module({
  imports: [SteamGenerationModule, ActivityModule, InventoryModule, AshModule, SteamParametersModule, ShipmentModule,],
  exports: [SteamGenerationModule, ActivityModule, InventoryModule, AshModule, SteamParametersModule, ShipmentModule],
})
export class RecordModule {}
