import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Admin } from './entities/admin.entity';
import { Staff } from './entities/staff.entity';
import { UserService } from './user.service';
import { AdminController } from './controllers/admin.controller';
import { StaffController } from './controllers/staff.controller';
import { AuthController } from './controllers/auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesGuard } from './guards/roles.guard';

// User module definition
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Admin, Staff]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AdminController, StaffController, AuthController],
  providers: [UserService, LocalStrategy, JwtStrategy, RolesGuard],
  exports: [UserService, JwtStrategy, RolesGuard],
})
export class UserModule {}
