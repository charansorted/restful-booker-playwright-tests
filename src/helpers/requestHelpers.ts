import { APIRequestContext, APIResponse } from '@playwright/test';
import { ApiResponse } from '../fixtures/interfaces';

export class RequestHelper {
  constructor(private request: APIRequestContext) {}

  async get<T>(endpoint: string, options?: any): Promise<ApiResponse<T>> {
    const response = await this.request.get(endpoint, options);
    return this.parseResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any, options?: any): Promise<ApiResponse<T>> {
    const response = await this.request.post(endpoint, {
      ...options,
      data
    });
    return this.parseResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any, options?: any): Promise<ApiResponse<T>> {
    const response = await this.request.put(endpoint, {
      ...options,
      data
    });
    return this.parseResponse<T>(response);
  }

  async delete(endpoint: string, options?: any): Promise<ApiResponse<void>> {
    const response = await this.request.delete(endpoint, options);
    return this.parseResponse<void>(response);
  }

  private async parseResponse<T>(response: APIResponse): Promise<ApiResponse<T>> {
    let data: T;
    
    try {
      if (response.status() !== 204) {
        data = await response.json();
      } else {
        data = null as any;
      }
    } catch (error) {
      data = null as any;
    }

    return {
      status: response.status(),
      data,
      headers: response.headers()
    };
  }
}
