import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dtos/create-activity.dto';
import { UpdateActivityDto } from './dtos/update-activity.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('record/activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  async create(
    @Body() createDto: CreateActivityDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.activityService.create(createDto, userId);
  }

  @Get()
  async findAll() {
    return this.activityService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.activityService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateActivityDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.activityService.update(id, updateDto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.activityService.remove(id);
    return { message: 'Activity record deleted successfully' };
  }
}
