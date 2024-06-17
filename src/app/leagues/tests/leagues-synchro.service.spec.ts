import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { getModelToken } from '@nestjs/mongoose';

import { hoursToMilliseconds } from 'date-fns';
import { Model } from 'mongoose';

import { LeaguesSynchroService } from '../leagues-synchro.service';
import { AxiosService } from '../../../lib/axios/axios.service';
import { League } from '../schemas/league.schema';
import { LeagueDto } from '../dto/league.dto';

jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  hoursToMilliseconds: jest.fn(),
}));

describe('LeaguesSynchroService', () => {
  let service: LeaguesSynchroService;
  let schedulerRegistry: SchedulerRegistry;
  let leagueModel: Model<League>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaguesSynchroService,
        AxiosService,
        ConfigService,
        SchedulerRegistry,
        {
          provide: getModelToken(League.name),
          useValue: {
            updateOne: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: AxiosService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
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

    service = module.get<LeaguesSynchroService>(LeaguesSynchroService);
    schedulerRegistry = module.get<SchedulerRegistry>(SchedulerRegistry);
    leagueModel = module.get(getModelToken(League.name));
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
      jest.restoreAllMocks();
    });
    it('should setup the interval with the correct frequency', () => {
      const startSpy = jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn<any, any>(service, 'start')
        .mockImplementation(() => {
          return Promise.resolve();
        });
      service.onApplicationBootstrap();

      expect(startSpy).toHaveBeenCalled();

      jest.runOnlyPendingTimers();

      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 3600000);
      expect(schedulerRegistry.addInterval).toHaveBeenCalledWith(
        'sync-leagues',
        expect.anything(),
      );
      jest.useRealTimers();
    });
  });

  describe('start', () => {
    it('should retrieve and save leagues successfully', async () => {
      const leagues = [{ name: 'League 1' }, { name: 'League 2' }];
      const debugSpy = jest.spyOn(service['logger'], 'debug');
      /* eslint-disable @typescript-eslint/no-explicit-any */
      jest.spyOn(service as any, 'getLeagues').mockResolvedValue(leagues);
      jest.spyOn(service as any, 'saveLeagues').mockResolvedValue(undefined);

      await service['start']();

      expect(debugSpy).toHaveBeenCalledWith('LeaguesSynchroService is running');
      expect(service['getLeagues']).toHaveBeenCalled();
      expect(service['saveLeagues']).toHaveBeenCalledWith(leagues);
    });

    it('should log an error if an exception occurs', async () => {
      const error = new Error('Test error');
      const errorSpy = jest.spyOn(service['logger'], 'error');

      jest.spyOn(service as any, 'getLeagues').mockRejectedValue(error);

      await service['start']();

      expect(errorSpy).toHaveBeenCalledWith(
        'Error while synchronizing leagues',
        error,
      );
      expect(service['getLeagues']).toHaveBeenCalled();
    });
  });

  describe('getLeagues', () => {
    it('should fetch leagues successfully', async () => {
      const leagues = [{ name: 'League 1' }, { name: 'League 2' }];
      const debugSpy = jest.spyOn(service['logger'], 'debug');
      jest
        .spyOn(service['axiosService'], 'get')
        .mockResolvedValue({ data: { leagues } });

      const result = await service['getLeagues']();

      expect(debugSpy).toHaveBeenCalledWith(
        'LeaguesSynchroService is getting leagues',
      );
      expect(result).toEqual(leagues);
    });
  });

  describe('saveLeagues', () => {
    it('should save leagues successfully', async () => {
      const leagues = [
        {
          id: '1',
          name: 'League 1',
          slug: 'league-1',
          image: 'image-1',
          priority: 1,
          region: 'region-1',
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      ] as LeagueDto[];

      const debugSpy = jest.spyOn(service['logger'], 'debug');

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (leagueModel.findOne as jest.Mock).mockImplementation(({ id }) => ({
        exec: jest.fn().mockResolvedValue(null),
      }));
      (leagueModel.create as jest.Mock).mockResolvedValue({});
      (leagueModel.updateOne as jest.Mock).mockResolvedValue({});

      await service['saveLeagues'](leagues);

      expect(debugSpy).toHaveBeenCalledWith('Start leagues data treatment');
      expect(leagueModel.findOne).toHaveBeenCalledTimes(1);
      expect(leagueModel.create).toHaveBeenCalledTimes(1);
      expect(leagueModel.updateOne).not.toHaveBeenCalled();
    });

    it('should update existing leagues successfully', async () => {
      const leagues = [
        {
          id: '1',
          name: 'Updated League 1',
          slug: 'updated-league-1',
          image: 'updated-image-1',
          priority: 1,
          region: 'region-1',
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      ] as LeagueDto[];

      const debugSpy = jest.spyOn(service['logger'], 'debug');

      (leagueModel.findOne as jest.Mock).mockImplementation(({ id }) => ({
        exec: jest.fn().mockResolvedValue({ id, name: 'Existing League 1' }),
      }));
      (leagueModel.create as jest.Mock).mockResolvedValue({});
      (leagueModel.updateOne as jest.Mock).mockResolvedValue({});

      await service['saveLeagues'](leagues);

      expect(debugSpy).toHaveBeenCalledWith('Start leagues data treatment');
      expect(leagueModel.findOne).toHaveBeenCalledTimes(leagues.length);
      expect(leagueModel.create).not.toHaveBeenCalled();
      expect(leagueModel.updateOne).toHaveBeenCalledTimes(leagues.length);
      expect(leagueModel.updateOne).toHaveBeenCalledWith(
        { id: '1' },
        leagues[0],
      );
      expect(debugSpy).toHaveBeenCalledWith('Updated league with ID 1');
    });
  });
});
