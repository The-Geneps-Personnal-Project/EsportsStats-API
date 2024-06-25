import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { LiveDto } from '../dto/live.dto';
import { ILiveLeague, ILiveMatch, ILiveStream } from '../types/live';

describe('LiveDto', () => {
  it('should succeed with valid data', async () => {
    const validLiveDto = {
      id: '1',
      startTime: new Date(),
      state: 'active',
      type: 'match',
      blockName: 'block1',
      league: { id: 'league1', name: 'League 1' } as ILiveLeague,
      match: { id: 'match1', teams: [] } as ILiveMatch,
      tournament: { id: 'tournament1' },
      stream: [{}] as ILiveStream[],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const liveDto = plainToClass(LiveDto, validLiveDto);
    const errors = await validate(liveDto);
    expect(errors.length).toBe(0);
  });

  it('should fail with invalid data', async () => {
    const invalidLiveDto = {
      id: 1,
      startTime: '2023-06-01',
      state: 'active',
      type: 'match',
      blockName: 'block1',
      league: 'league1',
      match: 'match1',
      tournament: { id: 1 },
      stream: 'http://example.com/stream',
      createdAt: '2023-06-01',
      updatedAt: '2023-06-10',
    };

    const liveDto = plainToClass(LiveDto, invalidLiveDto);
    const errors = await validate(liveDto);
    expect(errors.length).toEqual(7);
    expect(errors.map((err) => err.property)).toEqual(
      expect.arrayContaining([
        'id',
        'startTime',
        'league',
        'match',
        'stream',
        'createdAt',
        'updatedAt',
      ]),
    );
  });

  it('should fail when required fields are missing', async () => {
    const invalidLiveDto = {
      startTime: new Date(),
      state: 'active',
      type: 'match',
      blockName: 'block1',
      league: { id: 'league1', name: 'League 1' } as ILiveLeague,
      match: { id: 'match1', teams: [] } as ILiveMatch,
      tournament: { id: 'tournament1' },
      stream: [{}] as ILiveStream[],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const liveDto = plainToClass(LiveDto, invalidLiveDto);
    const errors = await validate(liveDto);
    expect(errors.length).toEqual(1);
    expect(errors.map((err) => err.property)).toContain('id');
  });
});
