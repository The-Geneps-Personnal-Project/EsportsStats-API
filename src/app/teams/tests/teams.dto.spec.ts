import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { TeamDto } from '../dto/teams.dto';
import { IPlayer } from '../types/teams';

describe('TeamDto', () => {
  it('should succeed with valid data', async () => {
    const validTeamDto = {
      id: '1',
      name: 'Test Team',
      slug: 'test-team',
      code: 'TT',
      image: 'http://example.com/image.png',
      alternativeImage: 'http://example.com/alt-image.png',
      backgroundImage: 'http://example.com/bg-image.png',
      status: 'active',
      homeLeague: {
        name: 'Test League',
        region: 'Test Region',
      },
      players: [
        {
          id: 'player1',
          firstName: 'Player',
          lastName: 'One',
          image: 'http://example.com/player.png',
          role: 'forward',
        },
      ] as IPlayer[],
    };

    const teamDto = plainToClass(TeamDto, validTeamDto);
    const errors = await validate(teamDto);
    expect(errors.length).toBe(0);
  });

  it('should fail with invalid data', async () => {
    const invalidTeamDto = {
      id: 1, // Should be a string
      name: 'Test Team',
      slug: 'test-team',
      code: 'TT',
      image: 'http://example.com/image.png',
      alternativeImage: 'http://example.com/alt-image.png',
      backgroundImage: 'http://example.com/bg-image.png',
      status: 'active',
      homeLeague: {
        name: 'Test League',
        region: 'Test Region',
      },
      players: [
        {
          id: 'player1',
          firstName: 'Player',
          lastName: 'One',
          image: 'http://example.com/player.png',
          role: 'forward',
        },
      ] as IPlayer[],
    };

    const teamDto = plainToClass(TeamDto, invalidTeamDto);
    const errors = await validate(teamDto);
    expect(errors.length).toEqual(1);
    expect(errors[0].property).toBe('id');
  });

  it('should fail when required fields are missing', async () => {
    const invalidTeamDto = {
      id: '1',
      code: 'TT',
      image: 'http://example.com/image.png',
      alternativeImage: 'http://example.com/alt-image.png',
      backgroundImage: 'http://example.com/bg-image.png',
      status: 'active',
      homeLeague: {
        name: 'Test League',
        region: 'Test Region',
      },
      players: [
        {
          id: 'player1',
          firstName: 'Player',
          lastName: 'One',
          image: 'http://example.com/player.png',
          role: 'forward',
        },
      ] as IPlayer[],
    };

    const teamDto = plainToClass(TeamDto, invalidTeamDto);
    const errors = await validate(teamDto);
    expect(errors.length).toEqual(2);
    expect(errors[0].property).toBe('name');
  });
});
