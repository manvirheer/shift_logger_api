import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SteamGenerationRecord } from './entities/steam-generation-record.entity';
import { SteamGenerationService } from './steam-generation.service'
import { SteamGenerationController } from './steam-generation.controller';
import { Plant } from '../../plant/entities/plant.entity';
import { User } from '../../user/entities/user.entity';
import { UserModule } from '../../user/user.module';
import { PlantModule } from '../../plant/plant.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SteamGenerationRecord, Plant, User]),
    UserModule,
    PlantModule,
  ],
  controllers: [SteamGenerationController],
  providers: [SteamGenerationService],
})
export class SteamGenerationModule {}