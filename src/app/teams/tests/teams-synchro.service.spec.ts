import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { getModelToken } from '@nestjs/mongoose';

import { hoursToMilliseconds } from 'date-fns';

import { TeamsSynchroService } from '../teams-synchro.service';
import { AxiosService } from '../../../lib/axios/axios.service';
import { TeamDto } from '../dto/teams.dto';
import { IPlayer } from '../types/teams';

jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  hoursToMilliseconds: jest.fn(),
}));

describe('TeamsSynchroService', () => {
  let service: TeamsSynchroService;
  let schedulerRegistry: SchedulerRegistry;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsSynchroService,
        AxiosService,
        ConfigService,
        {
          provide: getModelToken('Team'),
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

    service = module.get<TeamsSynchroService>(TeamsSynchroService);
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
      (hoursToMilliseconds as jest.Mock).mockReturnValue(3600000);
    });

    afterEach(() => {
      jest.clearAllTimers();
      jest.restoreAllMocks();
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
        'sync-teams',
        expect.anything(),
      );
      jest.useRealTimers();
    });
  });

  describe('start', () => {
    it('should call getTeams and saveTeams', async () => {
      const teams = [];
      const debugSpy = jest.spyOn(service['logger'], 'debug');
      /* eslint-disable @typescript-eslint/no-explicit-any */
      jest.spyOn(service as any, 'getTeams').mockResolvedValue(teams);
      jest.spyOn(service as any, 'saveTeams').mockResolvedValue(undefined);

      await service['start']();

      expect(debugSpy).toHaveBeenCalledWith('TeamsSynchroService is running');
      expect(service['getTeams']).toHaveBeenCalled();
      expect(service['saveTeams']).toHaveBeenCalledWith(teams);
    });

    it('should log an error if an error occurs', async () => {
      const error = new Error('Test error');
      const errorSpy = jest.spyOn(service['logger'], 'error');
      jest.spyOn(service as any, 'getTeams').mockRejectedValue(error);

      await service['start']();

      expect(errorSpy).toHaveBeenCalledWith(
        'Error while synchronizing teams',
        error,
      );
    });
  });

  describe('getTeams', () => {
    it('should call axiosService.get with the correct parameters', async () => {
      const axiosServiceGetSpy = jest.spyOn(service['axiosService'], 'get');
      const teams = [
        { id: '1', name: 'Team 1' },
        { id: '2', name: 'Team 2' },
      ];
      const debugSpy = jest.spyOn(service['logger'], 'debug');
      jest
        .spyOn(service['axiosService'], 'get')
        .mockResolvedValue({ data: { teams } });
      axiosServiceGetSpy.mockResolvedValue({ data: { teams } });

      const result = await service['getTeams']();

      expect(result).toEqual(teams);
      expect(debugSpy).toHaveBeenCalledWith(
        'TeamsSynchroService is getting teams',
      );
    });
  });

  describe('saveTeams', () => {
    it('should save teams', async () => {
      const teams: TeamDto[] = [
        {
          id: '1',
          name: 'Team 1',
          code: 'T1',
          image: 'image',
          slug: 'team-1',
          alternativeImage: 'alternativeImage',
          backgroundImage: 'backgroundImage',
          status: 'active',
          homeLeague: { region: 'Region 1', name: 'League 1' },
          players: [] as IPlayer[],
        },
        {
          id: '2',
          name: 'Team 2',
          code: 'T2',
          image: 'image',
          slug: 'team-2',
          alternativeImage: 'alternativeImage',
          backgroundImage: 'backgroundImage',
          status: 'active',
          homeLeague: { region: 'Region 2', name: 'League 2' },
          players: [] as IPlayer[],
        },
      ];
      const debugSpy = jest.spyOn(service['logger'], 'debug');

      const teamModel = service['teamModel'];

      const findOneSpy = jest
        .spyOn(teamModel, 'findOne')
        .mockResolvedValue(null);
      const createSpy = jest.spyOn(teamModel, 'create').mockResolvedValue(null);

      await service['saveTeams'](teams);

      expect(debugSpy).toHaveBeenCalledWith(
        'TeamsSynchroService is saving teams',
      );
      expect(findOneSpy).toHaveBeenCalledTimes(2);
      expect(createSpy).toHaveBeenCalledTimes(2);
    });

    it('should update existing teams', async () => {
      const teams: TeamDto[] = [
        {
          id: '1',
          name: 'Team 1',
          code: 'T1',
          image: 'image',
          slug: 'team-1',
          alternativeImage: 'alternativeImage',
          backgroundImage: 'backgroundImage',
          status: 'active',
          homeLeague: { region: 'Region 1', name: 'League 1' },
          players: [] as IPlayer[],
        },
      ];
      const debugSpy = jest.spyOn(service['logger'], 'debug');

      const teamModel = service['teamModel'];

      const findOneSpy = jest.spyOn(teamModel, 'findOne').mockResolvedValue({
        id: '1',
        name: 'Team 1',
        code: 'T1',
        image: 'image',
        slug: 'team-1',
        alternativeImage: 'alternativeImage',
        backgroundImage: 'backgroundImage',
        status: 'active',
        homeLeague: { region: 'Region 1', name: 'League 1' },
        players: [] as IPlayer[],
      });
      const updateOneSpy = jest
        .spyOn(teamModel, 'updateOne')
        .mockResolvedValue(null);

      await service['saveTeams'](teams);

      expect(debugSpy).toHaveBeenCalledWith(
        'TeamsSynchroService is saving teams',
      );
      expect(findOneSpy).toHaveBeenCalledTimes(1);
      expect(updateOneSpy).toHaveBeenCalledTimes(1);
    });
  });
});
