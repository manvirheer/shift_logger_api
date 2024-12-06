import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from '../user.service';
import { CreateStaffDto } from '../dto/create-staff.dto';
import { UpdateStaffDto } from '../dto/update-staff.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

// Controller for staff users
@UseInterceptors(ClassSerializerInterceptor)
@Controller('staff')
export class StaffController {
  constructor(private readonly userService: UserService) {}

  // Create a new staff
  @Post()
  async createStaff(@Body() createStaffDto: CreateStaffDto) {
    const staff = await this.userService.createStaff(createStaffDto);
    return staff;
  }

  // Get all staff
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async getAllStaff(@Query('include') include?: string) {
    const relations = include ? include.split(',') : [];
    return this.userService.findAllStaff(relations);
  }

  // Get a specific staff
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getStaff(@Request() req, @Param('id') id: string, @Query('include') include?: string) {
    const relations = include ? include.split(',') : [];
    if (req.user.id !== id && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only access your own profile');
    }
    return this.userService.findStaffById(id, relations);
  }

  // Update a staff
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async updateStaff(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
    @Request() req,
  ) {
    if (req.user.id !== id && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.userService.updateStaff(id, updateStaffDto);
  }

  // Delete a staff
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id') 
  async deleteStaff(@Param('id') id: string, @Request() req) {
    if (req.user.id !== id && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own profile');
    }
    await this.userService.removeStaff(id);
    return { message: 'Staff deleted successfully' };
  }
}
