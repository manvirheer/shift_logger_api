import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftPostingService } from './shift-posting.service';
import { ShiftPostingController } from './shift-posting.controller';
import { ShiftPosting } from './entities/shift-posting.entity';
import { ShiftScheduleModule } from '../shift-schedule/shift-schedule.module';
import { UserModule } from '../../user/user.module';
import { User } from '../../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShiftPosting, User]),
    ShiftScheduleModule,
    UserModule,
  ],
  controllers: [ShiftPostingController],
  providers: [ShiftPostingService],
})
export class ShiftPostingModule {}
