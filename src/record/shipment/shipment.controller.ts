import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    UseGuards,
    Request,
    Query,
} from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { CreateShipmentDto } from './dtos/create-shipment.dto';
import { UpdateShipmentDto } from './dtos/update-shipment.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('shipment')
export class ShipmentController {
    constructor(private readonly shipmentService: ShipmentService) { }

    @Post()
    async create(@Body() createDto: CreateShipmentDto, @Request() req) {
        const userId = req.user.id;
        return this.shipmentService.create(createDto, userId);
    }

    @Get()
    async findAll(
        @Query('shiftScheduleId') shiftScheduleId?: string,
        @Query('plantId') plantId?: string,
        @Query('createdById') createdById?: string,
        @Query('vehicleNo') vehicleNo?: string,
        @Query('recordTime') recordTime?: string,
    ) {
        return this.shipmentService.findAll({
            shiftScheduleId,
            plantId,
            createdById,
            vehicleNo,
            recordTime,
        });
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.shipmentService.findOne(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateDto: UpdateShipmentDto, @Request() req) {
        const userId = req.user.id;
        return this.shipmentService.update(id, updateDto, userId);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.shipmentService.remove(id);
        return { message: 'Shipment deleted successfully' };
    }
}
