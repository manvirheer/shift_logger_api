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
  import { CreateAdminDto } from './dto/create-admin.dto';
  import { CreateStaffDto } from './dto/create-staff.dto';
  import { UpdateUserDto } from './dto/update-user.dto';
  import { AuthGuard } from '@nestjs/passport';
  import { JwtService } from '@nestjs/jwt';
  import { RolesGuard } from './guards/roles.guard';
  import { Roles } from './decorators/roles.decorator';
  import { UserRole } from './entities/user.entity';
  
  @UseInterceptors(ClassSerializerInterceptor)
  @Controller('auth')
  export class UserController {
    constructor(
      private readonly userService: UserService,
      private readonly jwtService: JwtService,
    ) {}
    
    // Get All Staff
    @Get('staff')
    async getAllStaff() {
      const staff = await this.userService.findAllStaff();
      return staff;
    }

    @Post('register-admin')
    async registerAdmin(@Body() createAdminDto: CreateAdminDto) {
      const user = await this.userService.createAdmin(createAdminDto);
      return user;
    }
  
    @Post('register-staff')
    async registerStaff(@Body() createStaffDto: CreateStaffDto) {
      const user = await this.userService.createStaff(createStaffDto);
      return user;
    }
  
    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req) {
      const user = req.user;
      const payload = { sub: user.id, email: user.email, role: user.role };
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
      const user = await this.userService.updateUser(id, updateUserDto);
      return user;
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    async deleteUser(@Param('id') id: string, @Request() req) {
      await this.userService.removeUser(id);
      return { message: 'User deleted successfully' };
    }
  
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get('admin-data')
    getAdminData() {
      return { message: 'This data is only accessible by Admin users' };
    }
  
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.STAFF)
    @Get('staff-data')
    getStaffData() {
      return { message: 'This data is accessible by Staff users' };
    }
  }