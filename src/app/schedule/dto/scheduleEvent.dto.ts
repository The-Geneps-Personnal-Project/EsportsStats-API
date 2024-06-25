import { IsString, IsDate, IsObject } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { Date } from 'mongoose';

import {
  IScheduleEvent,
  IScheduleLeague,
  IScheduleMatch,
} from '../types/schedule';

export class scheduleEventDto implements IScheduleEvent {
  @ApiProperty()
  @IsDate()
  startTime: Date;

  @ApiProperty()
  @IsString()
  state: string | null;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsString()
  blockName: string;

  @ApiProperty()
  @IsObject()
  league: IScheduleLeague;

  @ApiProperty()
  @IsObject()
  match: IScheduleMatch;
}
