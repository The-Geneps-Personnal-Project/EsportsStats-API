import { validate, Environment } from './env.validation';

describe('Configuration Validation', () => {
  const validConfig = {
    NODE_ENV: Environment.Development,
    PORT: 3000,
    MONGO_URI: 'mongodb://localhost:27017/test',
    LOL_ESPORTS_API_KEY: 'testapikey',
    LEAGUES_FREQUENCY: 24,
    TOURNAMENTS_FREQUENCY: 24,
    SCHEDULE_FREQUENCY: 60,
    TEAMS_FREQUENCY: 24,
    LIVE_FREQUENCY: 2,
  };

  it('should validate a correct config', () => {
    expect(() => validate(validConfig)).not.toThrow();
  });

  it('should throw an error for invalid NODE_ENV', () => {
    const invalidConfig = { ...validConfig, NODE_ENV: 'invalid' };
    expect(() => validate(invalidConfig)).toThrow();
  });

  it('should throw an error for missing required fields', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { NODE_ENV, ...partialConfig } = validConfig;
    expect(() => validate(partialConfig)).toThrow();
  });

  it('should allow optional fields to be missing', () => {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      PORT,
      LEAGUES_FREQUENCY,
      TOURNAMENTS_FREQUENCY,
      SCHEDULE_FREQUENCY,
      TEAMS_FREQUENCY,
      LIVE_FREQUENCY,
      ...partialConfig
    } = validConfig;
    expect(() => validate(partialConfig)).not.toThrow();
  });

  it('should throw an error for non-number PORT', () => {
    const invalidConfig = { ...validConfig, PORT: 'not-a-number' };
    expect(() => validate(invalidConfig)).toThrow();
  });

  it('should throw an error for non-number frequency fields', () => {
    const invalidConfig = { ...validConfig, LEAGUES_FREQUENCY: 'not-a-number' };
    expect(() => validate(invalidConfig)).toThrow();
  });

  it('should allow PORT to be optional', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { PORT, ...partialConfig } = validConfig;
    expect(() => validate(partialConfig)).not.toThrow();
  });
});
``;
