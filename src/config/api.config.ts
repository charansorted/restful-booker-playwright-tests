import dotenv from 'dotenv';
dotenv.config();

export const API_CONFIG = {
  baseURL: process.env.BASE_URL || 'https://automationintesting.online/api',
  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      validate: '/auth/validate'
    },
    room: {
      base: '/room',
      byId: (id: number) => `/room/${id}`
    },
    booking: {
      base: '/booking',
      byId: (id: number) => `/booking/${id}`,
      byRoom: (roomId: number) => `/booking?roomid=${roomId}`
    },
    message: {
      base: '/message',
      byId: (id: number) => `/message/${id}`
    }
  },
  timeout: Number(process.env.API_TIMEOUT) || 30000
};
