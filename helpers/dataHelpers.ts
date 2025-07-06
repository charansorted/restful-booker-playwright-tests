import type { Room, Booking, Message } from '../fixtures/interfaces';

export function createRoomData(): Omit<Room, 'roomid'> {
  return {
    roomName: `Test Room ${Date.now()}`,
    type: 'Double',
    accessible: true,
    image: 'https://example.com/room.jpg',
    description: 'A comfortable test room with modern amenities',
    features: ['WiFi', 'TV', 'Safe'],
    roomPrice: 150
  };
}

export function createBookingData(roomId: number): Omit<Booking, 'bookingid'> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(tomorrow.getDate() + 2);

  return {
    roomid: roomId,
    firstname: 'Test',
    lastname: 'User',
    depositpaid: true,
    bookingdates: {
      checkin: tomorrow.toISOString().split('T')[0],
      checkout: dayAfter.toISOString().split('T')[0]
    }
  };
}

export function createMessageData(): Omit<Message, 'messageid'> {
  return {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+447700900123',
    subject: 'Test Inquiry',
    description: 'This is a test message from automated tests'
  };
}
