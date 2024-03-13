import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ParamsType } from './type';

@Injectable()
export class AxiosService {
  async get<T, P>(
    url: string,
    apiKey?: string,
    params?: ParamsType<P>,
  ): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        headers: {},
        params: params || {},
      };

      if (apiKey) {
        config.headers['x-api-key'] = apiKey;
      }

      Logger.debug(`AxiosService is getting ${url}`);
      Logger.debug(
        `AxiosService is getting with config: ${JSON.stringify(config)}`,
      );

      const response: AxiosResponse<T> = await axios.get(url, config);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        Logger.error(
          `AxiosService has got an error: ${axiosError.message}`,
          axiosError.stack,
        );
        throw axiosError;
      }
      Logger.error(`AxiosService has got an error: ${error}`);
      throw error;
    }
  }
}
