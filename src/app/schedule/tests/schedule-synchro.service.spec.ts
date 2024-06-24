import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { getModelToken } from '@nestjs/mongoose';

import { minutesToMilliseconds } from 'date-fns';
import { Model } from 'mongoose';

import { ScheduleSynchroService } from '../schedule-synchro.service';
import { LeaguesService } from '../../leagues/leagues.service';
import { AxiosService } from '../../../lib/axios/axios.service';
import { LeagueDto } from 'src/app/leagues/dto/league.dto';
import { ScheduleEvent } from '../schemas/scheduleEvent.schema';
import {
  IScheduleItem,
  IScheduleLeague,
  IScheduleMatch,
} from '../types/schedule';

jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  minutesToMilliseconds: jest.fn(),
}));

describe('ScheduleSynchroService', () => {
  let service: ScheduleSynchroService;
  let schedulerRegistry: SchedulerRegistry;
  let axiosService: AxiosService;
  let configService: ConfigService;
  let leaguesService: LeaguesService;
  let scheduleModel: Model<ScheduleEvent>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleSynchroService,
        AxiosService,
        ConfigService,
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
        {
          provide: SchedulerRegistry,
          useValue: {
            addInterval: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ScheduleSynchroService>(ScheduleSynchroService);
    schedulerRegistry = module.get<SchedulerRegistry>(SchedulerRegistry);
    axiosService = module.get<AxiosService>(AxiosService);
    configService = module.get<ConfigService>(ConfigService);
    leaguesService = module.get<LeaguesService>(LeaguesService);
    scheduleModel = module.get(getModelToken(ScheduleEvent.name));
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
      (minutesToMilliseconds as jest.Mock).mockReturnValue(1000);
    });

    afterEach(() => {
      jest.clearAllTimers();
    });

    it('should setup the interval with the correct frequency', () => {
      const startSpy = jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn<any, any>(service, 'start')
        .mockImplementation(() => {
          return Promise.resolve();
        });

      service.onApplicationBootstrap();

      expect(startSpy).toHaveBeenCalledTimes(1);

      jest.runOnlyPendingTimers();

      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
      expect(schedulerRegistry.addInterval).toHaveBeenCalledWith(
        'sync-schedule',
        expect.anything(),
      );
      jest.useRealTimers();
    });
  });

  describe('start', () => {
    it('should call getSchedule method', async () => {
      const debugSpy = jest.spyOn(service.logger, 'debug');

      /* eslint-disable @typescript-eslint/no-explicit-any */
      jest.spyOn(service as any, 'getSchedule').mockResolvedValue(undefined);

      await service['start']();

      expect(debugSpy).toHaveBeenCalledWith(
        'ScheduleSynchroService is running',
      );
      expect(service['getSchedule']).toHaveBeenCalledTimes(1);
    });

    it('should log an error if getSchedule method throws an error', async () => {
      const error = new Error('Test error');
      const errorSpy = jest.spyOn(service.logger, 'error');

      /* eslint-disable @typescript-eslint/no-explicit-any */
      jest.spyOn(service as any, 'getSchedule').mockRejectedValue(error);

      await service['start']();

      expect(errorSpy).toHaveBeenCalledWith(
        'Error while synchronizing schedule',
        error,
      );
    });
  });

  describe('scheduleApiCall', () => {
    it('should call axiosService.get with correct parameters', async () => {
      const leagueId = 'leagueId';
      const pagetoken = 'pagetoken';
      const mockApiResponse = {
        data: {
          schedule: {
            pages: {
              newer: 'newer',
              older: 'older',
            },
          },
        },
      };

      jest.spyOn(axiosService, 'get').mockResolvedValue(mockApiResponse);
      jest.spyOn(configService, 'get').mockReturnValue('LOL_ESPORTS_API_KEY');

      await service['scheduleApiCall'](leagueId, pagetoken);

      expect(axiosService.get).toHaveBeenCalledWith(
        'https://esports-api.lolesports.com/persisted/gw/getSchedule',
        'LOL_ESPORTS_API_KEY',
        { hl: 'en-US', leagueId, pageToken: pagetoken },
      );
    });
  });

  describe('handlePage', () => {
    it('should log a warning and return null if no schedule is provided', async () => {
      const warnSpy = jest.spyOn(service.logger, 'warn');
      const result = await service['handlePage'](null, 'leagueId');

      expect(warnSpy).toHaveBeenCalledWith('No schedule found');
      expect(result).toBeNull();
    });

    it('should fetch all pages and aggregate schedules', async () => {
      const leagueScheduleItem = {
        pages: {
          newer: 'newerPage',
          older: 'olderPage',
        },
      } as IScheduleItem;

      const mockSchedule = {
        data: {
          schedule: {
            pages: {
              newer: null,
              older: null,
            },
          },
        },
      };

      jest
        .spyOn(service as any, 'scheduleApiCall')
        .mockResolvedValue(mockSchedule);

      const result = await service['handlePage'](
        leagueScheduleItem,
        'leagueId',
      );

      expect(service['scheduleApiCall']).toHaveBeenCalledTimes(2);
      expect(service['scheduleApiCall']).toHaveBeenCalledWith(
        'leagueId',
        'newerPage',
      );
      expect(service['scheduleApiCall']).toHaveBeenCalledWith(
        'leagueId',
        'olderPage',
      );
      expect(result).toEqual([
        mockSchedule.data.schedule,
        mockSchedule.data.schedule,
      ]);
    });

    it('should fetch and save schedule for each league', async () => {
      const leagues = [{ id: '1' }, { id: '2' }] as LeagueDto[];
      const schedule = {
        data: {
          schedule: {
            pages: {
              newer: 'newer',
              older: 'older',
            },
          },
        },
      };

      jest.spyOn(leaguesService, 'findAll').mockResolvedValue(leagues);
      jest.spyOn(service as any, 'scheduleApiCall').mockResolvedValue(schedule);
      jest.spyOn(service as any, 'handlePage').mockResolvedValue([]);

      await service['getSchedule']();

      expect(leaguesService.findAll).toHaveBeenCalledTimes(1);
      expect(service['scheduleApiCall']).toHaveBeenCalledTimes(2);
      expect(service['handlePage']).toHaveBeenCalledTimes(2);
    });

    it('should handle schedules with only newer pages', async () => {
      const leagueScheduleItem = {
        pages: {
          newer: 'newerPage',
          older: null,
        },
      } as IScheduleItem;

      const mockSchedule = {
        data: {
          schedule: {
            pages: {
              newer: null,
              older: null,
            },
          },
        },
      };

      jest
        .spyOn(service as any, 'scheduleApiCall')
        .mockResolvedValue(mockSchedule);

      const result = await service['handlePage'](
        leagueScheduleItem,
        'leagueId',
      );

      expect(service['scheduleApiCall']).toHaveBeenCalledTimes(1);
      expect(service['scheduleApiCall']).toHaveBeenCalledWith(
        'leagueId',
        'newerPage',
      );
      expect(result).toEqual([mockSchedule.data.schedule]);
    });

    it('should handle schedules with only older pages', async () => {
      const leagueScheduleItem = {
        pages: {
          newer: null,
          older: 'olderPage',
        },
      } as IScheduleItem;

      const mockSchedule = {
        data: {
          schedule: {
            pages: {
              newer: null,
              older: null,
            },
          },
        },
      };

      jest
        .spyOn(service as any, 'scheduleApiCall')
        .mockResolvedValue(mockSchedule);

      const result = await service['handlePage'](
        leagueScheduleItem,
        'leagueId',
      );

      expect(service['scheduleApiCall']).toHaveBeenCalledTimes(1);
      expect(service['scheduleApiCall']).toHaveBeenCalledWith(
        'leagueId',
        'olderPage',
      );
      expect(result).toEqual([mockSchedule.data.schedule]);
    });

    it('should fetch multiple pages recursively', async () => {
      const leagueScheduleItem = {
        pages: {
          newer: 'newerPage1',
          older: 'olderPage1',
        },
      } as IScheduleItem;

      const newerPageSchedule = {
        data: {
          schedule: {
            pages: {
              newer: 'newerPage2',
              older: null,
            },
          },
        },
      };

      const olderPageSchedule = {
        data: {
          schedule: {
            pages: {
              newer: null,
              older: 'olderPage2',
            },
          },
        },
      };

      const olderPage2Schedule = {
        data: {
          schedule: {
            pages: {
              newer: null,
              older: 'olderPage3',
            },
          },
        },
      };

      jest
        .spyOn(service as any, 'scheduleApiCall')
        .mockResolvedValueOnce(newerPageSchedule)
        .mockResolvedValueOnce(olderPageSchedule)
        .mockResolvedValueOnce(olderPage2Schedule)
        .mockResolvedValue({
          data: { schedule: { pages: { newer: null, older: null } } },
        });

      // Mock the delay function to avoid actual waiting
      jest.useFakeTimers();
      jest.spyOn(global, 'setTimeout').mockImplementation((fn) => {
        fn();
        return {} as NodeJS.Timeout;
      });

      const result = await service['handlePage'](
        leagueScheduleItem,
        'leagueId',
      );

      expect(service['scheduleApiCall']).toHaveBeenCalledTimes(4);
      expect(service['scheduleApiCall']).toHaveBeenCalledWith(
        'leagueId',
        'newerPage1',
      );
      expect(service['scheduleApiCall']).toHaveBeenCalledWith(
        'leagueId',
        'newerPage2',
      );
      expect(service['scheduleApiCall']).toHaveBeenCalledWith(
        'leagueId',
        'olderPage1',
      );
      expect(service['scheduleApiCall']).toHaveBeenCalledWith(
        'leagueId',
        'olderPage3',
      );
      expect(result.length).toEqual(4);

      jest.useRealTimers();
    });
  });

  describe('getSchedule', () => {
    it('should log a warning if no league is found', async () => {
      const warnSpy = jest.spyOn(service.logger, 'warn');

      jest.spyOn(leaguesService, 'findAll').mockResolvedValue([]);

      await service['getSchedule']();

      expect(warnSpy).toHaveBeenCalledWith('No leagues found');
    });
  });

  describe('saveSchedule', () => {
    it('should save schedule successfully', async () => {
      const verboseSpy = jest.spyOn(service.logger, 'verbose');
      const schedule = [
        {
          events: [
            {
              startTime: new Date() as any,
              state: 'active',
              type: 'type1',
              blockName: 'block1',
              league: { name: 'league1', slug: 'slug1' } as IScheduleLeague,
              match: {} as IScheduleMatch,
            },
          ],
        },
      ] as IScheduleItem[];

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (scheduleModel.findOne as jest.Mock).mockImplementation(({ id }) => ({
        exec: jest.fn().mockResolvedValue(undefined),
      }));
      (scheduleModel.create as jest.Mock).mockResolvedValue({});
      (scheduleModel.updateOne as jest.Mock).mockResolvedValue({});

      await service['saveSchedule'](schedule);

      expect(scheduleModel.findOne).toHaveBeenCalledTimes(1);
      expect(scheduleModel.create).toHaveBeenCalledTimes(1);
      expect(scheduleModel.updateOne).not.toHaveBeenCalled();
      expect(verboseSpy).toHaveBeenCalledWith(
        'Schedule data treatment is done',
      );
    });

    it('should update existing events successfully', async () => {
      const verboseSpy = jest.spyOn(service.logger, 'verbose');
      const schedule = [
        {
          events: [
            {
              startTime: new Date() as any,
              state: 'active',
              type: 'type1',
              blockName: 'block1',
              league: { name: 'league1', slug: 'slug1' } as IScheduleLeague,
              match: {} as IScheduleMatch,
            },
          ],
        },
      ] as IScheduleItem[];

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (scheduleModel.findOne as jest.Mock).mockImplementation(({ id }) => ({
        exec: jest.fn().mockResolvedValue({
          id: '1',
          startTime: new Date() as any,
          state: 'inactive',
          type: 'type1',
          blockName: 'block1',
          league: { name: 'league1', slug: 'slug1' } as IScheduleLeague,
          match: {} as IScheduleMatch,
        }),
      }));
      (scheduleModel.create as jest.Mock).mockResolvedValue({});
      (scheduleModel.updateOne as jest.Mock).mockResolvedValue({});

      await service['saveSchedule'](schedule);

      expect(scheduleModel.findOne).toHaveBeenCalledTimes(1);
      expect(scheduleModel.create).not.toHaveBeenCalled();
      expect(scheduleModel.updateOne).toHaveBeenCalledTimes(1);
      expect(verboseSpy).toHaveBeenCalledWith(
        'Schedule data treatment is done',
      );
    });

    it('should log a warning if no schedule is given', async () => {
      const warnSpy = jest.spyOn(service.logger, 'warn');

      await service['saveSchedule'](undefined);

      expect(warnSpy).toHaveBeenCalledWith('No schedule found');
    });
  });
});
