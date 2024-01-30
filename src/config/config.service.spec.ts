import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get the correct port', () => {
    expect(service.port).toBe(3000);
  });

  it('should get the correct database URL', () => {
    expect(service.databaseUrl).toBe('mongodb://localhost:27017/mydatabase');
  });
});
