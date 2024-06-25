import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { TournamentDto } from '../dto/tournament.dto';

describe('TournamentDto', () => {
  it('should succeed with valid data', async () => {
    const validTournamentDto = {
      id: '1',
      slug: 'test-tournament',
      startDate: '2023-06-01',
      endDate: '2023-06-10',
      leagueId: 'league1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const tournamentDto = plainToClass(TournamentDto, validTournamentDto);
    const errors = await validate(tournamentDto);
    expect(errors.length).toBe(0);
  });

  it('should fail with invalid data', async () => {
    const invalidTournamentDto = {
      id: 1,
      slug: 'test-tournament',
      startDate: 123456,
      endDate: 654321,
      leagueId: 123,
      createdAt: '2023-06-01',
      updatedAt: '2023-06-10',
    };

    const tournamentDto = plainToClass(TournamentDto, invalidTournamentDto);
    const errors = await validate(tournamentDto);
    expect(errors.length).toEqual(6);
    expect(errors.map((err) => err.property)).toEqual(
      expect.arrayContaining([
        'id',
        'startDate',
        'endDate',
        'leagueId',
        'createdAt',
        'updatedAt',
      ]),
    );
  });

  it('should fail when required fields are missing', async () => {
    const invalidTournamentDto = {
      slug: 'test-tournament',
      startDate: '2023-06-01',
      endDate: '2023-06-10',
      leagueId: 'league1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const tournamentDto = plainToClass(TournamentDto, invalidTournamentDto);
    const errors = await validate(tournamentDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.map((err) => err.property)).toContain('id');
  });
});
