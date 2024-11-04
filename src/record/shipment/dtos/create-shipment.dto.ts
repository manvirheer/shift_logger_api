import { IsNotEmpty, IsString, IsOptional, IsNumber, IsUUID, IsDate } from 'class-validator';

export class CreateShipmentDto {
    @IsUUID()
    @IsNotEmpty()
    plantId: string;

    @IsString()
    @IsNotEmpty()
    shiftScheduleId: string;

    @IsString()
    @IsNotEmpty()
    vehicleNo: string;

    @IsString()
    @IsNotEmpty()
    recordDate: string;

    @IsString()
    @IsNotEmpty()
    recordTime: string;

    @IsNumber()
    @IsNotEmpty()
    incomingBriquetteWeight: number;

    @IsNumber()
    @IsNotEmpty()
    incomingStockGCV: number;

    @IsString()
    @IsNotEmpty()
    supplier: string;

    @IsNumber()
    @IsNotEmpty()
    pricePerMT: number;

    @IsString()
    @IsOptional()
    remarks?: string;
}
