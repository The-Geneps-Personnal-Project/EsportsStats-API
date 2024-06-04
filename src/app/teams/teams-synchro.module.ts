import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AxiosService } from '../../../lib/axios/axios.service';
import { TeamsSynchroService } from './teams-synchro.service';
import { TeamSchema } from './schemas/teams.schema';

@Module({})
export class TeamsSynchroModule {
  static register(): DynamicModule {
    return {
      module: TeamsSynchroModule,
      imports: [
        MongooseModule.forFeature([{ name: 'Team', schema: TeamSchema }]),
      ],
      providers: [TeamsSynchroService, AxiosService],
      exports: [TeamsSynchroService],
    };
  }
}
