import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TournamentSchema } from './schemas/tournament.schema';
import { TournamentsSynchroService } from './tournaments-synchro.service';
import { AxiosService } from 'lib/axios/axios.service';
import { LeagueSchema } from '../leagues/schemas/league.schema';
import { LeaguesService } from '../leagues/leagues.service';

@Module({})
export class TournamentsSynchroModule {
  static register(): DynamicModule {
    return {
      module: TournamentsSynchroModule,
      imports: [
        MongooseModule.forFeature([
          { name: 'Tournament', schema: TournamentSchema },
        ]),
        MongooseModule.forFeature([{ name: 'League', schema: LeagueSchema }]),
      ],
      providers: [TournamentsSynchroService, AxiosService, LeaguesService],
    };
  }
}
