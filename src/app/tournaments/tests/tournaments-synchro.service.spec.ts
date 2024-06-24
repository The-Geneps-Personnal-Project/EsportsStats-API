import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { getModelToken } from '@nestjs/mongoose';

import { hoursToMilliseconds } from 'date-fns';
import { Model } from 'mongoose';

import { TournamentsSynchroService } from '../tournaments-synchro.service';
import { LeaguesService } from '../../leagues/leagues.service';
import { AxiosService } from '../../../lib/axios/axios.service';
import { LeagueDto } from '../../leagues/dto/league.dto';
import { Tournament } from '../schemas/tournament.schema';
import { TournamentDto } from '../dto/tournament.dto';

jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  hoursToMilliseconds: jest.fn(),
}));

describe('LeaguesSynchroService', () => {
  let service: TournamentsSynchroService;
  let schedulerRegistry: SchedulerRegistry;
  let axiosService: AxiosService;
  let leaguesService: LeaguesService;
  let configService: ConfigService;
  let tournamentModel: Model<Tournament>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TournamentsSynchroService,
        AxiosService,
        ConfigService,
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
        {
          provide: SchedulerRegistry,
          useValue: {
            addInterval: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TournamentsSynchroService>(TournamentsSynchroService);
    schedulerRegistry = module.get<SchedulerRegistry>(SchedulerRegistry);
    axiosService = module.get<AxiosService>(AxiosService);
    leaguesService = module.get<LeaguesService>(LeaguesService);
    configService = module.get<ConfigService>(ConfigService);
    tournamentModel = module.get(getModelToken(Tournament.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onApplicationBootstrap', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.spyOn(global, 'setInterval');
      (hoursToMilliseconds as jest.Mock).mockReturnValue(3600000);
    });

    afterEach(() => {
      jest.clearAllTimers();
    });

    it('should setup the interval with the correct frequency and call start method', () => {
      const startSpy = jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn<any, any>(service, 'start')
        .mockImplementation(() => {
          return Promise.resolve();
        });
      service.onApplicationBootstrap();

      expect(startSpy).toHaveBeenCalledTimes(1);

      jest.runOnlyPendingTimers();

      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 3600000);
      expect(schedulerRegistry.addInterval).toHaveBeenCalledWith(
        'sync-tournaments',
        expect.anything(),
      );
      jest.useRealTimers();
    });
  });

  describe('start', () => {
    it('should call getTournaments and saveTournaments', async () => {
      const tournaments = [];
      const debugSpy = jest.spyOn(service['logger'], 'debug');
      /* eslint-disable @typescript-eslint/no-explicit-any */
      jest
        .spyOn(service as any, 'getTournaments')
        .mockResolvedValue(tournaments);
      jest
        .spyOn(service as any, 'saveTournaments')
        .mockResolvedValue(undefined);

      await service['start']();

      expect(debugSpy).toHaveBeenCalledWith(
        'TournamentsSynchroService is running',
      );
      expect(service['getTournaments']).toHaveBeenCalled();
      expect(service['saveTournaments']).toHaveBeenCalledWith(tournaments);
    });

    it('should log error if getTournaments fails', async () => {
      const error = new Error('Test error');
      const errorSpy = jest.spyOn(service['logger'], 'error');
      jest.spyOn(service as any, 'getTournaments').mockRejectedValue(error);

      await service['start']();

      expect(errorSpy).toHaveBeenCalledWith(
        'Error while synchronizing tournaments',
        error,
      );
    });
  });

  describe('assignLeagueIdToTournaments', () => {
    it('should assign league id to tournaments', () => {
      const tournaments = [
        {
          id: '1',
          slug: 'test 1',
          leagueId: '3',
          startDate: '2021-01-01',
          endDate: '2021-01-02',
        },
        {
          id: '2',
          slug: 'test 2',
          leagueId: '4',
          startDate: '2021-01-01',
          endDate: '2021-01-02',
        },
      ];
      const id = '1';
      const result = service['assignLeagueIdToTournaments'](tournaments, id);

      expect(result).toEqual([
        {
          id: '1',
          slug: 'test 1',
          leagueId: '1',
          startDate: '2021-01-01',
          endDate: '2021-01-02',
        },
        {
          id: '2',
          slug: 'test 2',
          leagueId: '1',
          startDate: '2021-01-01',
          endDate: '2021-01-02',
        },
      ]);
    });
  });

  describe('getTournaments', () => {
    it('should log a debug message when getting tournaments', async () => {
      const loggerDebugSpy = jest.spyOn(service['logger'], 'debug');
      const leagues = [{ id: '1' }, { id: '2' }] as LeagueDto[];
      const tournamentsResponse = {
        data: {
          leagues: [
            {
              tournaments: [
                { id: 't1', name: 'Tournament 1' },
                { id: 't2', name: 'Tournament 2' },
              ],
            },
          ],
        },
      };

      jest.spyOn(leaguesService, 'findAll').mockResolvedValue(leagues);
      jest.spyOn(axiosService, 'get').mockResolvedValue(tournamentsResponse);
      jest.spyOn(configService, 'get').mockReturnValue('API_KEY');

      const assignLeagueIdToTournamentsSpy = jest.spyOn(
        service as any,
        'assignLeagueIdToTournaments',
      );

      await service['getTournaments']();

      expect(loggerDebugSpy).toHaveBeenCalledWith(
        'TournamentsSynchroService is getting tournaments',
      );
      expect(leaguesService.findAll).toHaveBeenCalled();
      expect(axiosService.get).toHaveBeenCalledWith(
        'https://esports-api.lolesports.com/persisted/gw/getTournamentsForLeague',
        'API_KEY',
        { hl: 'en-US', leagueId: '1' },
      );
      expect(assignLeagueIdToTournamentsSpy).toHaveBeenCalledWith(
        tournamentsResponse.data.leagues[0].tournaments,
        '1',
      );
    });

    it('should return an error if no leagues are found', async () => {
      const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');
      jest.spyOn(leaguesService, 'findAll').mockResolvedValue(null);

      const result = await service['getTournaments']();

      expect(loggerWarnSpy).toHaveBeenCalledWith('No Leagues found');
      expect(result).toBeUndefined();
    });

    it('should return tournaments data for each league', async () => {
      const leagues = [{ id: '1' }, { id: '2' }] as LeagueDto[];
      const tournamentsResponse = {
        data: {
          leagues: [
            {
              tournaments: [
                { id: 't1', name: 'Tournament 1' },
                { id: 't2', name: 'Tournament 2' },
              ],
            },
          ],
        },
      };

      jest.spyOn(leaguesService, 'findAll').mockResolvedValue(leagues);
      jest.spyOn(axiosService, 'get').mockResolvedValue(tournamentsResponse);
      jest.spyOn(configService, 'get').mockReturnValue('API_KEY');

      const result = await service['getTournaments']();

      expect(result).toEqual([
        { id: 't1', name: 'Tournament 1', leagueId: '1' },
        { id: 't2', name: 'Tournament 2', leagueId: '1' },
        { id: 't1', name: 'Tournament 1', leagueId: '2' },
        { id: 't2', name: 'Tournament 2', leagueId: '2' },
      ]);
    });
  });

  describe('saveTournaments', () => {
    it('should log a warning if no tournaments are provided', async () => {
      const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');

      await service['saveTournaments'](null);

      expect(loggerWarnSpy).toHaveBeenCalledWith('No Tournaments found');
    });

    it('should creat a new tournaments if it does not exist', async () => {
      const loggerDebugSpy = jest.spyOn(service['logger'], 'debug');
      const tournaments = [
        { id: '1', slug: 'Tournament 1' },
      ] as TournamentDto[];

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (tournamentModel.findOne as jest.Mock).mockImplementation(({ id }) => ({
        exec: jest.fn().mockResolvedValue(null),
      }));
      (tournamentModel.create as jest.Mock).mockResolvedValue({});
      (tournamentModel.updateOne as jest.Mock).mockResolvedValue({});

      await service['saveTournaments'](tournaments);

      expect(loggerDebugSpy).toHaveBeenCalledWith(
        'Start tournaments data treatment',
      );
      expect(tournamentModel.findOne).toHaveBeenCalledTimes(1);
      expect(tournamentModel.create).toHaveBeenCalledWith(tournaments[0]);
      expect(tournamentModel.updateOne).not.toHaveBeenCalled();
    });

    it('should update an existing tournament if the slug is different', async () => {
      const loggerDebugSpy = jest.spyOn(service['logger'], 'debug');
      const tournaments = [
        { id: '1', slug: 'Tournament 1' },
      ] as TournamentDto[];
      const existingTournament = { id: '1', slug: 'Tournament 2' };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (tournamentModel.findOne as jest.Mock).mockImplementation(({ id }) => ({
        exec: jest.fn().mockResolvedValue(existingTournament),
      }));
      (tournamentModel.create as jest.Mock).mockResolvedValue({});
      (tournamentModel.updateOne as jest.Mock).mockResolvedValue({});

      await service['saveTournaments'](tournaments);

      expect(tournamentModel.findOne).toHaveBeenCalledTimes(1);
      expect(tournamentModel.create).not.toHaveBeenCalled();
      expect(tournamentModel.updateOne).toHaveBeenCalledWith(
        { id: '1' },
        tournaments[0],
      );
      expect(loggerDebugSpy).toHaveBeenCalledWith(
        'Updated tournament with ID 1',
      );
    });

    it('should not update an existing tournament if the slug is the same', async () => {
      const loggerDebugSpy = jest.spyOn(service['logger'], 'debug');
      const tournaments = [
        { id: '1', slug: 'Tournament 1' },
      ] as TournamentDto[];
      const existingTournament = { id: '1', slug: 'Tournament 1' };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (tournamentModel.findOne as jest.Mock).mockImplementation(({ id }) => ({
        exec: jest.fn().mockResolvedValue(existingTournament),
      }));
      (tournamentModel.create as jest.Mock).mockResolvedValue({});
      (tournamentModel.updateOne as jest.Mock).mockResolvedValue({});

      await service['saveTournaments'](tournaments);

      expect(tournamentModel.findOne).toHaveBeenCalledTimes(1);
      expect(tournamentModel.create).not.toHaveBeenCalled();
      expect(tournamentModel.updateOne).not.toHaveBeenCalled();
      expect(loggerDebugSpy).not.toHaveBeenCalledWith(
        'Updated tournament with ID 1',
      );
    });
  });
});
