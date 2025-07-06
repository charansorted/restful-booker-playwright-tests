import { API_CONFIG } from "@config/api.config";
import { TEST_CONFIG } from "@config/test.config";
import { Auth } from "@fixtures/interfaces";
import { APIRequestContext } from "@playwright/test";

export class AuthHelper {
  constructor(private request: APIRequestContext) {}

  async login(credentials?: Auth): Promise<string> {
    const loginData = credentials || TEST_CONFIG.credentials.admin;
    const loginUrl = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.login}`;
    
    const response = await this.request.post(loginUrl, {
      data: loginData,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (response.status() !== 200) {
      throw new Error(`Login failed with status: ${response.status()}`);
    }

    const { token } = await response.json();
    return token;
  }

  async logout(token: string): Promise<void> {
    const logoutUrl = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.logout}`;
    await this.request.post(logoutUrl, {
      headers: {
        'Cookie': `token=${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  async validateToken(token: string): Promise<boolean> {
    const validateUrl = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.validate}`;
    const response = await this.request.post(validateUrl, {
      data: { token },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response.status() === 200;
  }

  getAuthHeaders(token: string): Record<string, string> {
    return {
      'Cookie': `token=${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }
}