import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { getModelToken } from '@nestjs/mongoose';

import { minutesToMilliseconds } from 'date-fns';

import { LiveSynchroService } from '../live-synchro.service';
import { AxiosService } from '../../../lib/axios/axios.service';
import { ILive, ILiveLeague, ILiveMatch, ILiveStream } from '../types/live';

jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  minutesToMilliseconds: jest.fn(),
}));

describe('LiveSynchroService', () => {
  let service: LiveSynchroService;
  let schedulerRegistry: SchedulerRegistry;

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
        {
          provide: SchedulerRegistry,
          useValue: {
            addInterval: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LiveSynchroService>(LiveSynchroService);
    schedulerRegistry = module.get<SchedulerRegistry>(SchedulerRegistry);
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
      (minutesToMilliseconds as jest.Mock).mockReturnValue(3600000);
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
        'sync-live',
        expect.anything(),
      );
      jest.useRealTimers();
    });
  });

  describe('start', () => {
    it('should call getLive and saveLive', async () => {
      const live = [];
      const debugSpy = jest.spyOn(service['logger'], 'debug');
      /* eslint-disable @typescript-eslint/no-explicit-any */
      jest.spyOn(service as any, 'getLive').mockResolvedValue(live);
      jest.spyOn(service as any, 'saveLive').mockResolvedValue(undefined);

      await service['start']();

      expect(debugSpy).toHaveBeenCalledWith('LiveSynchroService is running');
      expect(service['getLive']).toHaveBeenCalled();
      expect(service['saveLive']).toHaveBeenCalledWith(live);
    });

    it('should log error if getLive fails', async () => {
      const error = new Error('Test error');
      const errorSpy = jest.spyOn(service['logger'], 'error');
      jest.spyOn(service as any, 'getLive').mockRejectedValue(error);

      await service['start']();

      expect(errorSpy).toHaveBeenCalledWith(
        'Error while synchronizing live',
        error,
      );
    });
  });

  describe('getLive', () => {
    it('should return live data', async () => {
      const live = [{ id: '1' }, { id: '2' }];
      const debugSpy = jest.spyOn(service['logger'], 'debug');
      jest
        .spyOn(service['axiosService'], 'get')
        .mockResolvedValue({ data: { schedule: { events: live } } });

      const result = await service['getLive']();

      expect(debugSpy).toHaveBeenCalledWith(
        'LiveSynchroService is getting live',
      );
      expect(result).toEqual(live);
    });
  });

  describe('saveLive', () => {
    it('should save live successfully', async () => {
      const live: ILive[] = [
        {
          id: '1',
          startTime: new Date() as any,
          state: 'active',
          type: 'type1',
          blockName: 'block1',
          league: {} as ILiveLeague,
          tournament: { id: '1' },
          match: {} as ILiveMatch,
          stream: [{}] as ILiveStream[],
        },
        {
          id: '2',
          startTime: new Date() as any,
          state: 'inactive',
          type: 'type2',
          blockName: 'block2',
          league: {} as ILiveLeague,
          tournament: { id: '2' },
          match: {} as ILiveMatch,
          stream: [{}] as ILiveStream[],
        },
      ];
      const debugSpy = jest.spyOn(service['logger'], 'debug');
      jest.spyOn(service['liveModel'], 'findOne').mockResolvedValue(null);
      jest.spyOn(service['liveModel'], 'create').mockResolvedValue(undefined);

      await service['saveLive'](live);

      expect(debugSpy).toHaveBeenCalledWith(
        'LiveSynchroService is saving live',
      );
      expect(service['liveModel'].findOne).toHaveBeenCalledTimes(2);
      expect(service['liveModel'].create).toHaveBeenCalledTimes(2);
    });

    it('should update existing live successfully', async () => {
      const live: ILive[] = [
        {
          id: '1',
          startTime: new Date() as any,
          state: 'active',
          type: 'type1',
          blockName: 'block1',
          league: {} as ILiveLeague,
          tournament: { id: '1' },
          match: {} as ILiveMatch,
          stream: [{}] as ILiveStream[],
        },
      ];
      const debugSpy = jest.spyOn(service['logger'], 'debug');
      jest.spyOn(service['liveModel'], 'findOne').mockResolvedValue({
        id: '1',
        startTime: new Date() as any,
        state: 'active',
        type: 'type1',
        blockName: 'block1',
        league: {} as ILiveLeague,
        tournament: { id: '1' },
        match: {} as ILiveMatch,
        stream: [{}] as ILiveStream[],
      });
      jest
        .spyOn(service['liveModel'], 'updateOne')
        .mockResolvedValue(undefined);

      await service['saveLive'](live);

      expect(debugSpy).toHaveBeenCalledWith(
        'LiveSynchroService is saving live',
      );
      expect(service['liveModel'].findOne).toHaveBeenCalledTimes(1);
      expect(service['liveModel'].updateOne).toHaveBeenCalledTimes(1);
    });
  });
});
