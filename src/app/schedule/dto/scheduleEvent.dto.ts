import { IsString, IsDate } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
  @IsString()
  league: IScheduleLeague;

  @ApiProperty()
  @IsString()
  match: IScheduleMatch;
}
