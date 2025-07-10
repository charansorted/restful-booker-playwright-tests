import dotenv from 'dotenv';
dotenv.config();

export const TEST_CONFIG = {
  credentials: {
    admin: {
      username: String (process.env.ADMIN_USERNAME ),
      password: String (process.env.ADMIN_PASSWORD )
    }
  },
  retryConfig: {
    maxRetries: Number(process.env.MAX_RETRIES) || 3,
    retryDelay: Number(process.env.RETRY_DELAY) || 1000
  },
  timeouts: {
    short: Number(process.env.SHORT_TIMEOUT) || 5000,
    medium: Number(process.env.MEDIUM_TIMEOUT) || 10000,
    long: Number(process.env.LONG_TIMEOUT) || 30000
  }
};
