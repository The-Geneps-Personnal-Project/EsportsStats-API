import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TournamentSchema } from './schemas/tournament.schema';
import { TournamentsSynchroService } from './tournaments-synchro.service';
import { AxiosService } from 'lib/axios/axios.service';

@Module({})
export class TournamentsSynchroModule {
  static register(): DynamicModule {
    return {
      module: TournamentsSynchroModule,
      imports: [
        MongooseModule.forFeature([
          { name: 'League', schema: TournamentSchema },
        ]),
      ],
      providers: [TournamentsSynchroService, AxiosService],
      exports: [],
    };
  }
}
