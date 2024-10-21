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
  } from '@nestjs/common';
  import { ActivityService } from './activity.service';
  import { CreateActivityDto } from './dtos/create-activity.dto';
  import { UpdateActivityDto } from './dtos/update-activity.dto';
  
  @Controller('record/activity')
  export class ActivityController {
    constructor(private readonly activityService: ActivityService) {}
  
    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async create(@Body() createDto: CreateActivityDto) {
      return this.activityService.create(createDto);
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
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async update(
      @Param('id') id: string,
      @Body() updateDto: UpdateActivityDto,
    ) {
      return this.activityService.update(id, updateDto);
    }
  
    @Delete(':id')
    async remove(@Param('id') id: string) {
      await this.activityService.remove(id);
      return { message: 'Activity record deleted successfully' };
    }
  }
  