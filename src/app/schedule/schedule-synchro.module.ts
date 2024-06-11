import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ScheduleSynchroService } from './schedule-synchro.service';
import { AxiosService } from '../../lib/axios/axios.service';
import { LeaguesService } from '../leagues/leagues.service';

import { LeagueSchema } from '../leagues/schemas/league.schema';
import { ScheduleEventSchema } from './schema/scheduleEvent.schema';

@Module({})
export class ScheduleSynchroModule {
  static register(): DynamicModule {
    return {
      module: ScheduleSynchroModule,
      imports: [
        MongooseModule.forFeature([
          { name: 'League', schema: LeagueSchema },
          { name: 'ScheduleEvent', schema: ScheduleEventSchema },
        ]),
      ],
      providers: [ScheduleSynchroService, AxiosService, LeaguesService],
    };
  }
}
