import { ApiProperty } from '@nestjs/swagger';

import { ILeague } from '../types/league';
import { IsString } from '@nestjs/class-validator';

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
  @IsString()
  priority?: number;
}
