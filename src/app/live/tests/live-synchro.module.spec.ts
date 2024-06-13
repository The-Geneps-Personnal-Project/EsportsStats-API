import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';

import { Model } from 'mongoose';

import { LiveSynchroModule } from '../live-synchro.module';
import { LiveSynchroService } from '../live-synchro.service';
import { AxiosService } from '../../../lib/axios/axios.service';
import { Live, LiveSchema } from '../schemas/live.schema';

describe('LiveSynchroModule', () => {
  let liveSynchroService: LiveSynchroService;
  let axiosService: AxiosService;
  let liveModel: Model<Live>;
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
        MongooseModule.forFeature([{ name: 'Live', schema: LiveSchema }]),
        LiveSynchroModule.register(),
      ],
      providers: [
        LiveSynchroService,
        AxiosService,
        ConfigService,
        SchedulerRegistry,
      ],
    })
      .overrideProvider(getModelToken('Live'))
      .useValue(jest.fn())
      .compile();

    liveSynchroService = module.get<LiveSynchroService>(LiveSynchroService);
    axiosService = module.get<AxiosService>(AxiosService);
    liveModel = module.get<Model<Live>>(getModelToken('Live'));
    configService = module.get<ConfigService>(ConfigService);
    schedulerRegistry = module.get<SchedulerRegistry>(SchedulerRegistry);
  });

  it('should be defined', () => {
    expect(liveSynchroService).toBeDefined();
    expect(axiosService).toBeDefined();
    expect(liveModel).toBeDefined();
    expect(configService).toBeDefined();
    expect(schedulerRegistry).toBeDefined();
  });
});
