import { faker } from '@faker-js/faker';

export const TEST_DATA = {
  room: {
    types: ['Single', 'Double', 'Twin', 'Family', 'Suite'],
    features: ['WiFi', 'TV', 'Safe', 'Mini Bar', 'Sea View'],
    prices: [50, 75, 100, 150, 200, 300]
  },
  booking: {
    additionalNeeds: ['Breakfast', 'Late Checkout', 'Early Checkin', 'Airport Transfer']
  }
};