import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
} from '@nestjs/common';
import { PlantService } from './plant.service';
import { CreatePlantDto } from './dtos/create-plant.dto';
import { UpdatePlantDto } from './dtos/update-plant.dto';
import { UsersIdsDto } from './dtos/users-ids.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../user/guards/roles.guard';
import { Roles } from '../user/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('plants')
export class PlantController {
  constructor(private readonly plantService: PlantService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  async createPlant(@Body() createPlantDto: CreatePlantDto) {
    const plant = await this.plantService.createPlant(createPlantDto);
    return { plantId: plant.plantId, plantName: plant.plantName };
  }

  @Get()
  async getAllPlants(@Query('include') include?: string) {
    const relations = include ? include.split(',') : [];
    const plants = await this.plantService.findAllPlants(relations);
    return plants;
  }

  //@Get('/staff/:userId') to get all plants for a user
  @Get('/staff/:userId')
  async getPlantsByUser(@Param('userId') userId: string) {
    const plants = await this.plantService.getPlantIdByStaffId(userId);
    return plants;
  }

  @Get(':plantId')
  async getPlantById(@Param('plantId') plantId: string, @Query('include') include?: string) {
    const relations = include ? include.split(',') : [];
    const plant = await this.plantService.findPlantById(plantId, relations); 
    return plant;
  }

  @Roles(UserRole.ADMIN)
  @Patch(':plantId')  
  async updatePlant(
    @Param('plantId') plantId: string, 
    @Body() updatePlantDto: UpdatePlantDto,
  ) {
    const updatedPlant = await this.plantService.updatePlant(plantId, updatePlantDto);  
    return { plantId: updatedPlant.plantId, plantName: updatedPlant.plantName };
  }

  @Roles(UserRole.ADMIN)
  @Delete(':plantId')  
  async deletePlant(@Param('plantId') plantId: string) {
    await this.plantService.removePlant(plantId); 
    return { message: 'Plant deleted successfully' };
  }

  @Post(':plantId/users')  
  async addUsersToPlant(
    @Param('plantId') plantId: string,  
    @Body() addUsersToPlantDto: UsersIdsDto,
  ) {
    const updatedPlant = await this.plantService.addUsersToPlant(plantId, addUsersToPlantDto.userIds);
    return { plantId: updatedPlant.plantId, userIds: updatedPlant.users.map(user => user.id) }; 
  }

  @Delete(':plantId/users')  
  async removeUsersFromPlant(
    @Param('plantId') plantId: string, 
    @Body() removeUsersDto: UsersIdsDto,
  ) {
    const updatedPlant = await this.plantService.removeUsersFromPlant(plantId, removeUsersDto.userIds);
    return { plantId: updatedPlant.plantId, userIds: updatedPlant.users.map(user => user.id) };  
  }

  
}