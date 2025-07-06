import { Room, Booking, BookingDates, Message } from '../fixtures/interfaces';

export function createRoomData(overrides?: Partial<Room>): Room {
  const timestamp = Date.now();
  return {
    roomName: `Test Room ${timestamp}`,
    type: 'Single',
    accessible: true,
    image: 'https://example.com/room.jpg',
    description: 'A comfortable test room',
    features: ['WiFi', 'TV', 'Safe'],
    roomPrice: 100,
    ...overrides
  };
}

export function createBookingData(roomId: number, overrides?: Partial<Booking>): Booking {
  const checkin = new Date();
  const checkout = new Date();
  checkout.setDate(checkout.getDate() + 3);

  return {
    roomid: roomId,
    firstname: 'Test',
    lastname: 'User',
    totalprice: 300,
    depositpaid: true,
    bookingdates: {
      checkin: checkin.toISOString().split('T')[0],
      checkout: checkout.toISOString().split('T')[0]
    },
    email: 'test@test.com',
    phone: '0795657788', 
    ...overrides
  };
}

export function createMessageData(overrides?: Partial<Message>): Message {
  const timestamp = Date.now();
  return {
    name: `Test User ${timestamp}`,
    email: `test${timestamp}@example.com`,
    phone: '1234567890',
    subject: 'Test Message',
    description: 'This is a test message',
    ...overrides
  };
}