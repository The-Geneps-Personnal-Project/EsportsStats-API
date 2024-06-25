import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { scheduleEventDto } from '../dto/scheduleEvent.dto';
import { IScheduleLeague, IScheduleMatch } from '../types/schedule';

describe('scheduleEventDto', () => {
  it('should succeed with valid data', async () => {
    const validScheduleEventDto = {
      startTime: new Date(),
      state: 'active',
      type: 'match',
      blockName: 'block1',
      league: {} as IScheduleLeague,
      match: {} as IScheduleMatch,
    };

    const scheduleEvent = plainToClass(scheduleEventDto, validScheduleEventDto);
    const errors = await validate(scheduleEvent);
    expect(errors.length).toBe(0);
  });

  it('should fail with invalid data', async () => {
    const invalidScheduleEventDto = {
      startTime: '2023-06-01',
      state: 123,
      type: 456,
      blockName: {},
      league: 'league1',
      match: 'match1',
    };

    const scheduleEvent = plainToClass(
      scheduleEventDto,
      invalidScheduleEventDto,
    );
    const errors = await validate(scheduleEvent);
    expect(errors.length).toEqual(6);
    expect(errors.map((err) => err.property)).toEqual(
      expect.arrayContaining([
        'startTime',
        'state',
        'type',
        'blockName',
        'league',
        'match',
      ]),
    );
  });

  it('should fail when required fields are missing', async () => {
    const invalidScheduleEventDto = {
      state: 'active',
      type: 'match',
      blockName: 'block1',
      league: {} as IScheduleLeague,
      match: {} as IScheduleMatch,
    };

    const scheduleEvent = plainToClass(
      scheduleEventDto,
      invalidScheduleEventDto,
    );
    const errors = await validate(scheduleEvent);
    expect(errors.length).toEqual(1);
    expect(errors.map((err) => err.property)).toContain('startTime');
  });
});
