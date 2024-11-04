import { IsString, IsNumber } from 'class-validator';
import { DefaultDeserializer } from 'v8';

export class ShiftEndEntryDto {
    @IsString()
    shiftScheduleId: string;

    @IsNumber()
    briquetteConsumption: number;

    @IsString()
    plantId: string;

    @IsNumber()
    ashGenerated: number;

    @IsNumber()
    steamGenerationInitialReading: number;

    @IsNumber()
    steamGenerationFinalReading: number;

    @IsString()
    remarks: string = 'None';

}
