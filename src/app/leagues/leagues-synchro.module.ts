import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LeaguesSynchroService } from './leagues-synchro.service';
import { LeagueSchema } from './schemas/league.schema';
import { AxiosService } from 'lib/axios/axios.service';
import { LeaguesService } from './leagues.service';

@Module({})
export class LeaguesSynchroModule {
  static register(): DynamicModule {
    return {
      module: LeaguesSynchroModule,
      imports: [
        MongooseModule.forFeature([{ name: 'League', schema: LeagueSchema }]),
      ],
      providers: [LeaguesSynchroService, AxiosService, LeaguesService],
      exports: [LeaguesService],
    };
  }
}
