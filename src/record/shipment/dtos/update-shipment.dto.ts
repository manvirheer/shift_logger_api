import { IsOptional, IsString, IsNumber, IsUUID, IsDate } from 'class-validator';

export class UpdateShipmentDto {
    @IsUUID()
    @IsOptional()
    plantId?: string;

    @IsString()
    @IsOptional()
    vehicleNo?: string;

    @IsNumber()
    @IsOptional()
    incomingBriquetteWeight?: number;

    @IsNumber()
    @IsOptional()
    incomingStockGCV?: number;

    @IsString()
    @IsOptional()
    shiftScheduleId?: string;

    @IsString()
    @IsOptional()
    recordTime: string;

    @IsString()
    @IsOptional()
    supplier?: string;

    @IsNumber()
    @IsOptional()
    pricePerMT?: number;

    @IsString()
    @IsOptional()
    remarks?: string;
}
