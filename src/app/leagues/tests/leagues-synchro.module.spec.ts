import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';

import { Model } from 'mongoose';

import { LeaguesSynchroModule } from '../leagues-synchro.module';
import { LeaguesSynchroService } from '../leagues-synchro.service';
import { LeaguesService } from '../leagues.service';
import { AxiosService } from '../../../lib/axios/axios.service';
import { LeagueSchema, League } from '../schemas/league.schema';

describe('LeaguesSynchroModule', () => {
  let leaguesSynchroService: LeaguesSynchroService;
  let leaguesService: LeaguesService;
  let axiosService: AxiosService;
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
        MongooseModule.forFeature([{ name: 'League', schema: LeagueSchema }]),
        LeaguesSynchroModule.register(),
      ],
      providers: [
        LeaguesSynchroService,
        LeaguesService,
        AxiosService,
        ConfigService,
        SchedulerRegistry,
      ],
    })
      .overrideProvider(getModelToken('League'))
      .useValue(jest.fn())
      .compile();

    leaguesSynchroService = module.get<LeaguesSynchroService>(
      LeaguesSynchroService,
    );
    leaguesService = module.get<LeaguesService>(LeaguesService);
    axiosService = module.get<AxiosService>(AxiosService);
    leagueModel = module.get<Model<League>>(getModelToken('League'));
    configService = module.get<ConfigService>(ConfigService);
    schedulerRegistry = module.get<SchedulerRegistry>(SchedulerRegistry);
  });

  it('should be defined', () => {
    expect(leaguesSynchroService).toBeDefined();
    expect(leaguesService).toBeDefined();
    expect(axiosService).toBeDefined();
    expect(leagueModel).toBeDefined();
    expect(configService).toBeDefined();
    expect(schedulerRegistry).toBeDefined();
  });
});
