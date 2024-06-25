import { IsString, IsObject, IsArray } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { IPlayer, ITeam } from '../types/teams';

export class TeamDto implements ITeam {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  image: string;

  @ApiProperty()
  @IsString()
  alternativeImage: string;

  @ApiProperty()
  @IsString()
  backgroundImage: string;

  @ApiProperty()
  @IsString()
  status: string;

  @ApiProperty()
  @IsObject()
  homeLeague: {
    name: string;
    region: string;
  };

  @ApiProperty()
  @IsArray()
  players: IPlayer[];
}
