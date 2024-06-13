import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { getModelToken } from '@nestjs/mongoose';

import { TeamsSynchroService } from '../teams-synchro.service';
import { AxiosService } from '../../../lib/axios/axios.service';

describe('TeamsSynchroService', () => {
  let service: TeamsSynchroService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsSynchroService,
        AxiosService,
        ConfigService,
        SchedulerRegistry,
        {
          provide: getModelToken('Team'),
          useValue: {
            updateOne: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TeamsSynchroService>(TeamsSynchroService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
