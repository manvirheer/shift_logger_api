import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RecordModule } from './record/record.module';
import { UserModule } from './user/user.module';
import { PlantModule } from './plant/plant.module';
import { ShiftModule } from './shift/shift.module';
import { ShipmentModule } from './record/shipment/shipment.module';
import { ActivityModule } from './record/activity/activity.module';
import { Ash } from './record/ash/entities/ash.entity';
import { AshModule } from './record/ash/ash.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, 
      }),
      inject: [ConfigService],
    }),
    RecordModule,
    UserModule,
    PlantModule,
    ShiftModule,
    ShipmentModule,
    ActivityModule,
  ],
})
export class AppModule { }
