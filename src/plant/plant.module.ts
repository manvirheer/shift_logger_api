import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plant } from './entities/plant.entity';
import { PlantService } from './plant.service';
import { PlantController } from './plant.controller';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module'; 
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plant, User]),
    PassportModule,
    UserModule, 
  ],
  controllers: [PlantController],
  providers: [PlantService], 
})
export class PlantModule {}