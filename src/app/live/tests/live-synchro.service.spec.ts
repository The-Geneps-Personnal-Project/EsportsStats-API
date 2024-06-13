import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { getModelToken } from '@nestjs/mongoose';

import { LiveSynchroService } from '../live-synchro.service';
import { AxiosService } from '../../../lib/axios/axios.service';

describe('LiveSynchroService', () => {
  let service: LiveSynchroService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LiveSynchroService,
        AxiosService,
        ConfigService,
        SchedulerRegistry,
        {
          provide: getModelToken('Live'),
          useValue: {
            updateOne: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LiveSynchroService>(LiveSynchroService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
