import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsObject, IsString } from '@nestjs/class-validator';

import { Date } from 'mongoose';

import { ILive, ILiveLeague, ILiveMatch, ILiveStream } from '../types/live';

export class LiveDto implements ILive {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsDate()
  startTime: Date;

  @ApiProperty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsString()
  blockName: string;

  @ApiProperty()
  @IsObject()
  league: ILiveLeague;

  @ApiProperty()
  @IsObject()
  match: ILiveMatch;

  @ApiProperty()
  @IsObject()
  tournament: { id: string };

  @ApiProperty()
  @IsArray()
  stream: [ILiveStream];

  @ApiProperty()
  @IsString()
  createdAt: Date;

  @ApiProperty()
  @IsString()
  updatedAt: Date;
}
