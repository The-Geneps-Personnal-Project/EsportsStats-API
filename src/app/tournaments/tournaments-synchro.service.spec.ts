import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { getModelToken } from '@nestjs/mongoose';

import { TournamentsSynchroService } from './tournaments-synchro.service';
import { LeaguesService } from '../leagues/leagues.service';
import { AxiosService } from '../../lib/axios/axios.service';

describe('LeaguesSynchroService', () => {
  let service: TournamentsSynchroService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TournamentsSynchroService,
        AxiosService,
        ConfigService,
        SchedulerRegistry,
        LeaguesService,
        {
          provide: getModelToken('Tournament'),
          useValue: {
            updateOne: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getModelToken('League'),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TournamentsSynchroService>(TournamentsSynchroService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
