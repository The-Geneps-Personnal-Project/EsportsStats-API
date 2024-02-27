import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from '@nestjs/class-validator';

import { ILeague } from '../types/leagues';

export class LeagueDto implements ILeague {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  region: string;

  @ApiProperty()
  @IsString()
  image: string;

  @ApiProperty()
  @IsNumber()
  priority?: number;

  @ApiProperty()
  @IsDate()
  createdAt: Date;

  @ApiProperty()
  @IsDate()
  updatedAt: Date;
}
