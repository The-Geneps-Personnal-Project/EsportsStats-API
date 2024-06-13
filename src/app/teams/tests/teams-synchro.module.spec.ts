import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';

import { Model } from 'mongoose';

import { TeamsSynchroModule } from '../teams-synchro.module';
import { TeamsSynchroService } from '../teams-synchro.service';
import { AxiosService } from '../../../lib/axios/axios.service';
import { Team, TeamSchema } from '../schemas/teams.schema';

describe('TeamsSynchroModule', () => {
  let service: TeamsSynchroService;
  let axiosService: AxiosService;
  let teamModel: Model<Team>;
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
        MongooseModule.forFeature([{ name: 'Team', schema: TeamSchema }]),
        TeamsSynchroModule.register(),
      ],
      providers: [
        TeamsSynchroService,
        AxiosService,
        ConfigService,
        SchedulerRegistry,
      ],
    })
      .overrideProvider(getModelToken('Team'))
      .useValue(jest.fn())
      .compile();

    service = module.get<TeamsSynchroService>(TeamsSynchroService);
    axiosService = module.get<AxiosService>(AxiosService);
    teamModel = module.get<Model<Team>>(getModelToken('Team'));
    configService = module.get<ConfigService>(ConfigService);
    schedulerRegistry = module.get<SchedulerRegistry>(SchedulerRegistry);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(axiosService).toBeDefined();
    expect(teamModel).toBeDefined();
    expect(configService).toBeDefined();
    expect(schedulerRegistry).toBeDefined();
  });
});
