import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';

import { Model } from 'mongoose';

import { TournamentsSynchroModule } from '../tournaments-synchro.module';
import { TournamentsSynchroService } from '../tournaments-synchro.service';
import { AxiosService } from '../../../lib/axios/axios.service';
import { Tournament, TournamentSchema } from '../schemas/tournament.schema';
import { LeaguesService } from '../../leagues/leagues.service';
import { League, LeagueSchema } from '../../leagues/schemas/league.schema';

describe('TournamentsSynchroModule', () => {
  let tournamentsSynchroService: TournamentsSynchroService;
  let leaguesService: LeaguesService;
  let axiosService: AxiosService;
  let tournamentModel: Model<Tournament>;
  let leagueModel: Model<League>;
  let configService: ConfigService;
  let schedulerRegistry: SchedulerRegistry;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env',
          cache: true,
          isGlobal: true,
        }),
        ScheduleModule.forRoot(),
        MongooseModule.forFeature([
          { name: 'Tournament', schema: TournamentSchema },
        ]),
        MongooseModule.forFeature([{ name: 'League', schema: LeagueSchema }]),
        TournamentsSynchroModule.register(),
      ],
      providers: [
        TournamentsSynchroService,
        LeaguesService,
        AxiosService,
        ConfigService,
        SchedulerRegistry,
      ],
    })
      .overrideProvider(getModelToken('Tournament'))
      .useValue(jest.fn())
      .overrideProvider(getModelToken('League'))
      .useValue(jest.fn())
      .compile();

    tournamentsSynchroService = module.get<TournamentsSynchroService>(
      TournamentsSynchroService,
    );
    leaguesService = module.get<LeaguesService>(LeaguesService);
    axiosService = module.get<AxiosService>(AxiosService);
    tournamentModel = module.get<Model<Tournament>>(
      getModelToken('Tournament'),
    );
    leagueModel = module.get<Model<League>>(getModelToken('League'));
    configService = module.get<ConfigService>(ConfigService);
    schedulerRegistry = module.get<SchedulerRegistry>(SchedulerRegistry);
  });

  it('should be defined', () => {
    expect(tournamentsSynchroService).toBeDefined();
    expect(leaguesService).toBeDefined();
    expect(axiosService).toBeDefined();
    expect(tournamentModel).toBeDefined();
    expect(leagueModel).toBeDefined();
    expect(configService).toBeDefined();
    expect(schedulerRegistry).toBeDefined();
  });
});
