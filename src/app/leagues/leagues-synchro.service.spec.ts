import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { getModelToken } from '@nestjs/mongoose';

import { LeaguesSynchroService } from './leagues-synchro.service';
import { AxiosService } from '../../lib/axios/axios.service';

describe('LeaguesSynchroService', () => {
  let service: LeaguesSynchroService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaguesSynchroService,
        AxiosService,
        ConfigService,
        SchedulerRegistry,
        {
          provide: getModelToken('League'),
          useValue: {
            updateOne: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LeaguesSynchroService>(LeaguesSynchroService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
