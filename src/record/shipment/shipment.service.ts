// src/record/shipment/shipment.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Shipment } from './entities/shipment.entity';
import { CreateShipmentDto } from './dtos/create-shipment.dto';
import { UpdateShipmentDto } from './dtos/update-shipment.dto';
import { User } from '../../user/entities/user.entity';
import { Plant } from '../../plant/entities/plant.entity';
import { ShiftSchedule } from 'src/shift/shift-schedule/entities/shift-schedule.entity';
import { InventoryRecord } from '../inventory/entities/inventory-record.entity';
import { DataEntryPeriodService } from 'src/data-entry-period/data-entry-period.service';

interface ShipmentQueryParams {
  shiftScheduleId?: string;
  plantId?: string;
  createdById?: string;
  vehicleNo?: string;
  recordTime?: string;
}

@Injectable()
export class ShipmentService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Plant)
    private readonly plantRepo: Repository<Plant>,
    @InjectRepository(ShiftSchedule)
    private readonly shiftScheduleRepo: Repository<ShiftSchedule>,
    @InjectRepository(InventoryRecord)
    private readonly inventoryRepo: Repository<InventoryRecord>, // Inject InventoryRecord repository
    private readonly dataEntryPeriodService: DataEntryPeriodService, 
  ) { }

  async create(data: CreateShipmentDto, userId: string): Promise<Shipment> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const plant = await this.plantRepo.findOne({ where: { plantId: data.plantId } });
    if (!plant) {
      throw new NotFoundException('Plant not found');
    }

    const shiftSchedule = await this.shiftScheduleRepo.findOne({ where: { id: data.shiftScheduleId } });
    if (!shiftSchedule) {
      throw new NotFoundException('Shift Schedule not found');
    }
    const {entryPeriod, entryDate} = await this.dataEntryPeriodService.findPeriodForTime(plant.plantId, new Date());

    const shipment = this.shipmentRepo.create({
      ...data,
      createdBy: user,
      plant,
      shiftSchedule,
      entryDate,
      entryPeriod,
      updatedBy: null,
    });

    const savedShipment = await this.shipmentRepo.save(shipment);

    // Update InventoryRecord
    await this.updateInventoryOnCreate(savedShipment, user);

    return savedShipment;
  }

  async findAll(params: ShipmentQueryParams): Promise<Shipment[]> {
    // Define the where conditions dynamically
    const whereConditions: FindManyOptions<Shipment>['where'] = {
      ...(params.shiftScheduleId && { shiftSchedule: { id: params.shiftScheduleId } }),
      ...(params.plantId && { plant: { plantId: params.plantId } }),
      ...(params.createdById && { createdBy: { id: params.createdById } }),
      ...(params.vehicleNo && { vehicleNo: params.vehicleNo }),
      ...(params.recordTime && { recordTime: params.recordTime }),
    };

    // Fetch all matching records with optional relations and sorting by createdAt
    return this.shipmentRepo.find({
      where: whereConditions,
      relations: ['shiftSchedule', 'plant', 'createdBy', 'updatedBy'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Shipment> {
    const shipment = await this.shipmentRepo.findOne({
      where: { id },
      relations: ['createdBy', 'updatedBy', 'plant', 'shiftSchedule'],
    });
    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }
    return shipment;
  }

  async update(id: string, updateData: UpdateShipmentDto, userId: string): Promise<Shipment> {
    const shipment = await this.shipmentRepo.findOne({
      where: { id },
      relations: ['createdBy', 'updatedBy', 'plant', 'shiftSchedule'],
    });
    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }

    if (updateData.plantId) {
      const plant = await this.plantRepo.findOne({ where: { plantId: updateData.plantId } });
      if (!plant) {
        throw new NotFoundException('Plant not found');
      }
      shipment.plant = plant;
    }

    if (updateData.shiftScheduleId) {
      const shiftSchedule = await this.shiftScheduleRepo.findOne({ where: { id: updateData.shiftScheduleId } });
      if (!shiftSchedule) {
        throw new NotFoundException('Shift Schedule not found');
      }
      shipment.shiftSchedule = shiftSchedule;
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    shipment.updatedBy = user;

    // Keep track of original incomingBriquetteWeight for inventory adjustment
    const originalWeight = shipment.incomingBriquetteWeight;

    // Update shipment fields
    Object.assign(shipment, updateData);

    const updatedShipment = await this.shipmentRepo.save(shipment);

    const {entryPeriod, entryDate} = await this.dataEntryPeriodService.findPeriodForTime(shipment.plant.plantId, new Date());
    updatedShipment.entryPeriod = entryPeriod;
    updatedShipment.entryDate = entryDate;


    // Update InventoryRecord based on the change in incomingBriquetteWeight
    await this.updateInventoryOnUpdate(updatedShipment, originalWeight, user);

    return updatedShipment;
  }

  async remove(id: string): Promise<void> {
    const shipment = await this.shipmentRepo.findOne({
      where: { id },
      relations: ['plant', 'shiftSchedule'],
    });
    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }

    // Update InventoryRecord before deletion
    await this.updateInventoryOnDelete(shipment);

    const result = await this.shipmentRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }
  }

  // Helper method to update InventoryRecord on Shipment creation
  private async updateInventoryOnCreate(shipment: Shipment, user: User): Promise<void> {
    // Fetch the latest InventoryRecord for the Plant and ShiftSchedule
    const latestInventory = await this.inventoryRepo.findOne({
      where: {
        plant: { plantId: shipment.plant.plantId },
      },
      order: { createdAt: 'DESC' },
      relations: ['plant', 'shiftSchedule'],
    });

    const newInitialValue = latestInventory ? latestInventory.finalValue : 0;

    const {entryPeriod, entryDate} = await this.dataEntryPeriodService.findPeriodForTime(shipment.plant.plantId, new Date());

    const newInventory = this.inventoryRepo.create({
      shipment: shipment,
      createdBy: user,
      plant: shipment.plant,
      entryPeriod,
      entryDate,
      shiftSchedule: shipment.shiftSchedule,
      recordTime: shipment.recordTime,
      initialValue: newInitialValue,
      recordType: 'Shipment_Entry',
      addition: shipment.incomingBriquetteWeight,
      consumption: 0, // Assuming no consumption during shipment creation
      details: `Shipment ID: ${shipment.id}`,
    });

    await this.inventoryRepo.save(newInventory);
  }

  // Helper method to update InventoryRecord on Shipment update
  private async updateInventoryOnUpdate(shipment: Shipment, originalWeight: number, user: User): Promise<void> {
    // Find the InventoryRecord associated with this Shipment
    const inventory = await this.inventoryRepo.findOne({
      where: { shipment: { id: shipment.id } },
      relations: ['shipment'],
    });

    if (inventory) {
      // Calculate the difference in weight
      const weightDifference = shipment.incomingBriquetteWeight - originalWeight;

      // Update the addition
      inventory.addition = (inventory.addition || 0) + weightDifference;

      // Optionally, update details or other fields
      inventory.details = `Updated Shipment ID: ${shipment.id}`;

      // Update the updatedBy field
      inventory.updatedBy = user;

      const {entryPeriod, entryDate} = await this.dataEntryPeriodService.findPeriodForTime(shipment.plant.plantId, new Date());
      inventory.entryPeriod = entryPeriod;
      inventory.entryDate = entryDate;

      await this.inventoryRepo.save(inventory);
    } else {
      // If no InventoryRecord exists, create one
      await this.updateInventoryOnCreate(shipment, user);
    }
  }

  // Helper method to update InventoryRecord on Shipment deletion
  private async updateInventoryOnDelete(shipment: Shipment): Promise<void> {
    // Find the InventoryRecord associated with this Shipment
    const inventory = await this.inventoryRepo.findOne({
      where: { shipment: { id: shipment.id } },
      relations: ['shipment'],
    });

    if (inventory) {
      // Subtract the shipment's incomingBriquetteWeight from addition
      inventory.addition = (inventory.addition || 0) - shipment.incomingBriquetteWeight;

      // Optionally, handle negative additions
      if (inventory.addition < 0) {
        inventory.addition = 0; // Prevent negative inventory
      }

      const {entryPeriod, entryDate} = await this.dataEntryPeriodService.findPeriodForTime(shipment.plant.plantId, new Date());
      inventory.entryPeriod = entryPeriod;
      inventory.entryDate = entryDate;

      // Optionally, update details or other fields
      inventory.details = `Deleted Shipment ID: ${shipment.id}`;

      await this.inventoryRepo.save(inventory);
    }

    // If no InventoryRecord is found, there's nothing to update
  }
}
