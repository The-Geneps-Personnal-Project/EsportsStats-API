import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

import { LeagueDto } from '../dto/league.dto';

describe('LeagueDto', () => {
  it('should succeed with valid data', async () => {
    const validLeagueDto = {
      id: '1',
      slug: 'test-league',
      name: 'Test League',
      region: 'Test Region',
      image: 'http://example.com/image.png',
      priority: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const leagueDto = plainToClass(LeagueDto, validLeagueDto);
    const errors = await validate(leagueDto);
    expect(errors.length).toBe(0);
  });

  it('should fail with invalid data', async () => {
    const invalidLeagueDto = {
      id: 1,
      slug: 'test-league',
      name: 'Test League',
      region: 'Test Region',
      image: 'http://example.com/image.png',
      priority: 'high',
      createdAt: '2022-01-01',
      updatedAt: '2022-01-01',
    };

    const leagueDto = plainToClass(LeagueDto, invalidLeagueDto);
    const errors = await validate(leagueDto);
    expect(errors.length).toEqual(4);
    expect(errors.map((err) => err.property)).toEqual(
      expect.arrayContaining(['id', 'priority', 'createdAt', 'updatedAt']),
    );
  });

  it('should fail when required fields are missing', async () => {
    const invalidLeagueDto = {
      slug: 'test-league',
      name: 'Test League',
      region: 'Test Region',
      image: 'http://example.com/image.png',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const leagueDto = plainToClass(LeagueDto, invalidLeagueDto);
    const errors = await validate(leagueDto);
    expect(errors.length).toEqual(1);
    expect(errors.map((err) => err.property)).toContain('id');
  });
});
