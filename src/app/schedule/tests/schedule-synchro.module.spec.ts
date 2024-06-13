import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';

import { Model } from 'mongoose';

import { ScheduleSynchroModule } from '../schedule-synchro.module';
import { ScheduleSynchroService } from '../schedule-synchro.service';
import { AxiosService } from '../../../lib/axios/axios.service';
import { LeaguesService } from '../../leagues/leagues.service';
import {
  ScheduleEvent,
  ScheduleEventSchema,
} from '../schemas/scheduleEvent.schema';
import { League, LeagueSchema } from '../../leagues/schemas/league.schema';

describe('ScheduleSynchroModule', () => {
  let scheduleSynchroService: ScheduleSynchroService;
  let axiosService: AxiosService;
  let scheduleEventModel: Model<ScheduleEvent>;
  let leagueModel: Model<League>;
  let configService: ConfigService;
  let schedulerRegistry: SchedulerRegistry;
  let leaguesService: LeaguesService;

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
          { name: 'League', schema: LeagueSchema },
          { name: 'ScheduleEvent', schema: ScheduleEventSchema },
        ]),
        ScheduleSynchroModule.register(),
      ],
      providers: [
        ScheduleSynchroService,
        LeaguesService,
        AxiosService,
        ConfigService,
        SchedulerRegistry,
      ],
    })
      .overrideProvider(getModelToken('ScheduleEvent'))
      .useValue(jest.fn())
      .overrideProvider(getModelToken('League'))
      .useValue(jest.fn())
      .compile();

    scheduleSynchroService = module.get<ScheduleSynchroService>(
      ScheduleSynchroService,
    );
    axiosService = module.get<AxiosService>(AxiosService);
    scheduleEventModel = module.get<Model<ScheduleEvent>>(
      getModelToken('ScheduleEvent'),
    );
    leagueModel = module.get<Model<League>>(getModelToken('League'));
    configService = module.get<ConfigService>(ConfigService);
    schedulerRegistry = module.get<SchedulerRegistry>(SchedulerRegistry);
    leaguesService = module.get<LeaguesService>(LeaguesService);
  });

  it('should be defined', () => {
    expect(scheduleSynchroService).toBeDefined();
    expect(axiosService).toBeDefined();
    expect(scheduleEventModel).toBeDefined();
    expect(leagueModel).toBeDefined();
    expect(configService).toBeDefined();
    expect(schedulerRegistry).toBeDefined();
    expect(leaguesService).toBeDefined();
  });
});
