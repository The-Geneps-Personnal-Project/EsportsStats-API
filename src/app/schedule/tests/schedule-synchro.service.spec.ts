import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { getModelToken } from '@nestjs/mongoose';

import { ScheduleSynchroService } from '../schedule-synchro.service';
import { LeaguesService } from '../../leagues/leagues.service';
import { AxiosService } from '../../../lib/axios/axios.service';

describe('ScheduleSynchroService', () => {
  let service: ScheduleSynchroService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleSynchroService,
        AxiosService,
        ConfigService,
        SchedulerRegistry,
        LeaguesService,
        {
          provide: getModelToken('League'),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: getModelToken('ScheduleEvent'),
          useValue: {
            updateOne: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ScheduleSynchroService>(ScheduleSynchroService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
