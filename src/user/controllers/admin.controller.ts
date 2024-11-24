import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
    UseInterceptors,
    ClassSerializerInterceptor,
    Query,
  } from '@nestjs/common';
  import { UserService } from '../user.service';
  import { CreateAdminDto } from '../dto/create-admin.dto';
  import { UpdateAdminDto } from '../dto/update-admin.dto';
  import { AuthGuard } from '@nestjs/passport';
  import { RolesGuard } from '../guards/roles.guard';
  import { Roles } from '../decorators/roles.decorator';
  import { UserRole } from '../entities/user.entity';
  
  // Controller for admin users
  @UseInterceptors(ClassSerializerInterceptor)
  @Controller('admins')
  export class AdminController {
    constructor(private readonly userService: UserService) {}
  
    // Create a new admin
    @Post()
    async createAdmin(@Body() createAdminDto: CreateAdminDto) {
      const admin = await this.userService.createAdmin(createAdminDto);
      return admin;
    }
  
    // Get all admins
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get()
    async getAllAdmins(@Query('include') include?: string) {
      const relations = include ? include.split(',') : [];
      return this.userService.findAllAdmins(relations);
    }
  
    // Get a specific admin
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get(':id')
    async getAdmin(@Param('id') id: string, @Query('include') include?: string) {
      const relations = include ? include.split(',') : [];
      return this.userService.findAdminById(id, relations);
    }
  
    // Update an admin
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    @Patch(':id')
    async updateAdmin(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
      return this.userService.updateAdmin(id, updateAdminDto);
    }
  
    // Delete an admin
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete(':id')
    async deleteAdmin(@Param('id') id: string) {
      await this.userService.removeAdmin(id);
      return { message: 'Admin deleted successfully' };
    }
  }
  