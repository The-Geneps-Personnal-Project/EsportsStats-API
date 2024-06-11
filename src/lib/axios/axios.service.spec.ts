import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';

import { AxiosService } from './axios.service';

import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AxiosService', () => {
  let service: AxiosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AxiosService],
    }).compile();

    service = module.get<AxiosService>(AxiosService);
    jest.spyOn(Logger, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call axios.get with correct parameter and return data on success', async () => {
    const url = 'http://example.com';
    const responseData = { data: 'test' };
    mockedAxios.get.mockResolvedValueOnce({ data: responseData });

    const result = await service.get(url);

    expect(mockedAxios.get).toHaveBeenCalledWith(url, {
      headers: {},
      params: {},
    });
    expect(result).toEqual(responseData);
  });

  it('should include apiKey in headers if provided', async () => {
    const url = 'http://example.com';
    const apiKey = 'test-api-key';
    const responseData = { data: 'test' };
    mockedAxios.get.mockResolvedValueOnce({ data: responseData });

    const result = await service.get(url, apiKey);

    expect(mockedAxios.get).toHaveBeenCalledWith(url, {
      headers: { 'x-api-key': apiKey },
      params: {},
    });
    expect(result).toEqual(responseData);
  });

  it('should include params if provided', async () => {
    const url = 'http://example.com';
    const params = { key: 'value' };
    const responseData = { data: 'test' };
    mockedAxios.get.mockResolvedValueOnce({ data: responseData });

    const result = await service.get(url, undefined, params);

    expect(mockedAxios.get).toHaveBeenCalledWith(url, {
      headers: {},
      params: params,
    });
    expect(result).toEqual(responseData);
  });

  // it('should handle AxiosError correctly', async () => {
  //   const url = 'http://example.com';
  //   const axiosError = new Error('Axios error') as AxiosError;
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   axiosError.config = { headers: {} as any }; // Satisfy the type checker
  //   axiosError.isAxiosError = true;

  //   mockedAxios.get.mockRejectedValueOnce(axiosError);

  //   await expect(service.get(url)).rejects.toThrow(axiosError);

  //   expect(Logger.error).toHaveBeenCalledWith(
  //     `AxiosService has got an error: Error: ${axiosError.message}`,
  //   );
  // });

  it('should handle unknown errors correctly', async () => {
    const url = 'http://example.com';
    const unknownError = new Error('Unknown error');
    mockedAxios.get.mockRejectedValueOnce(unknownError);

    await expect(service.get(url)).rejects.toThrow(unknownError);

    expect(Logger.error).toHaveBeenCalledWith(
      `AxiosService has got an error: ${unknownError}`,
    );
  });
});
