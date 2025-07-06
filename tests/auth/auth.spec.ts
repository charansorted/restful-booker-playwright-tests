import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../src/helpers/authHelpers';
import { Logger } from '../../src/utils/logger';

test.describe('Authentication Endpoints', () => {
  let authHelper: AuthHelper;
  const logger = new Logger('AuthTests');
  
  test.beforeEach(async ({ request }) => {
    authHelper = new AuthHelper(request);
  });

  test('POST /auth/login - should authenticate with valid credentials', async () => {
    logger.info('Testing login with valid credentials');
    
    const token = await authHelper.login();
    
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
    logger.info('Login successful', { tokenLength: token.length });
  });

  test('POST /auth/login - should reject invalid credentials', async () => {
    logger.info('Testing login with invalid credentials');
    
    await expect(authHelper.login({
      username: 'invalid_user',
      password: 'wrong_password'
    })).rejects.toThrow('Login failed with status: 401');
    
    logger.info('Invalid credentials correctly rejected');
  });

  test('POST /auth/validate - should validate valid token', async () => {
    logger.info('Testing token validation');
    
    // First login to get a token
    const token = await authHelper.login();
    logger.debug('Got token', { token });
    
    // Then validate it
    const isValid = await authHelper.validateToken(token);
    expect(isValid).toBe(true);
    logger.info('Token validation successful');
  });

  test('POST /auth/logout - should successfully logout', async () => {
    logger.info('Testing logout');
    
    // First login to get a token
    const token = await authHelper.login();
    logger.debug('Got token for logout test', { token });
    
    // Then logout (no error means success)
    await expect(authHelper.logout(token)).resolves.not.toThrow();
    logger.info('Logout successful');
  });

  test.fixme('Auth flow - complete login, validate, logout cycle', async () => {
    logger.info('Testing complete auth flow');
    
    // Login
    const token = await authHelper.login();
    expect(token).toBeTruthy();
    logger.info('Step 1: Login successful');
    
    // Validate
    const isValid = await authHelper.validateToken(token);
    expect(isValid).toBe(true);
    logger.info('Step 2: Token validated');
    
    // Logout
    await authHelper.logout(token);
    logger.info('Step 3: Logout successful');
    
    // Verify token is no longer valid after logout
    const isStillValid = await authHelper.validateToken(token);
    expect(isStillValid).toBe(false);  // bug
    logger.info('Step 4: Confirmed token is invalid after logout');
  });
});