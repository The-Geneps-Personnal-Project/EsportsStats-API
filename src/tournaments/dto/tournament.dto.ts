import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDate } from '@nestjs/class-validator';

import { ITournament } from '../types/tournaments';

export class TournamentDto implements ITournament {
    @ApiProperty()
    @IsString()
    id: string;

    @ApiProperty()
    @IsString()
    slug: string;

    @ApiProperty()
    @IsString()
    startDate: string;

    @ApiProperty()
    @IsString()
    endDate: string;

    @ApiProperty()
    @IsDate()
    createdAt: Date;

    @ApiProperty()
    @IsDate()
    updatedAt: Date;
}