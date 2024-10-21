// src/user/user.controller.ts
import {
    Controller,
    Post,
    Body,
    UseGuards,
    Request,
    Get,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    ClassSerializerInterceptor,
  } from '@nestjs/common';
  import { UserService } from './user.service';
  import { CreateAdminDto } from './dtos/create-admin.dto';
  import { CreateStaffDto } from './dtos/create-staff.dto';
  import { UpdateUserDto } from './dtos/update-user.dto';
  import { LoginDto } from './dtos/login.dto';
  import { AuthGuard } from '@nestjs/passport';
  import { JwtService } from '@nestjs/jwt';
  import { RolesGuard } from './guards/roles.guard';
  import { Roles } from './decorators/roles.decorator';
  
  @UseInterceptors(ClassSerializerInterceptor)
  @Controller('auth')
  export class UserController {
    constructor(
      private readonly userService: UserService,
      private readonly jwtService: JwtService,
    ) {}
  
    @Post('register-admin')
    async registerAdmin(@Body() createAdminDto: CreateAdminDto) {
      const admin = await this.userService.createAdmin(createAdminDto);
      return admin;
    }
  
    @Post('register-staff')
    async registerStaff(@Body() createStaffDto: CreateStaffDto) {
      const staff = await this.userService.createStaff(createStaffDto);
      return staff;
    }
  
    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req) {
      const user = req.user;
      const payload = { sub: user.id, email: user.email, type: user.type };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    async getProfile(@Request() req) {
      const user = await this.userService.findById(req.user.id);
      return user;
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    async updateUser(
      @Param('id') id: string,
      @Body() updateUserDto: UpdateUserDto,
      @Request() req,
    ) {
      // Optionally check if req.user.id === id or if user is an Admin
      const user = await this.userService.updateUser(id, updateUserDto);
      return user;
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    async deleteUser(@Param('id') id: string, @Request() req) {
      // Optionally check permissions
      await this.userService.removeUser(id);
      return { message: 'User deleted successfully' };
    }
  
    // Example of a protected route accessible only by Admins
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('Admin')
    @Get('admin-data')
    getAdminData() {
      return { message: 'This data is only accessible by Admin users' };
    }
  
    // Example of a protected route accessible by Staff
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('Staff')
    @Get('staff-data')
    getStaffData() {
      return { message: 'This data is accessible by Staff users' };
    }


    // get list of all users
    @Get('users')
    async getAllUsers() {
      const users = await this.userService.findAll();
      return users;
    }
  }
  