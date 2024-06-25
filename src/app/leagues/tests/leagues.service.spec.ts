import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { LeaguesService } from '../leagues.service';
import { League } from '../schemas/league.schema';

describe('LeaguesService', () => {
  let service: LeaguesService;
  let leagueModel: Model<League>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaguesService,
        {
          provide: getModelToken(League.name),
          useValue: {
            find: jest.fn().mockReturnValue({
              exec: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<LeaguesService>(LeaguesService);
    leagueModel = module.get<Model<League>>(getModelToken(League.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of leagues', async () => {
      const result = [{ name: 'Test League' }];
      const execMock = jest.fn().mockResolvedValueOnce(result);
      jest
        .spyOn(leagueModel, 'find')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockReturnValueOnce({ exec: execMock } as any);

      const leagues = await service.findAll();
      expect(leagues).toEqual(result);
      expect(leagueModel.find).toHaveBeenCalled();
      expect(execMock).toHaveBeenCalled();
    });
  });
});
