import { Room, Booking, Message } from '../fixtures/interfaces';

export function validateRoom(room: any): room is Room {
  return (
    room &&
    typeof room.roomName === 'string' &&
    typeof room.type === 'string' &&
    typeof room.roomPrice === 'number'
  );
}

export function validateBooking(booking: any): booking is Booking {
  return (
    booking &&
    typeof booking.roomid === 'number' &&
    typeof booking.firstname === 'string' &&
    typeof booking.lastname === 'string' &&
    booking.bookingdates &&
    typeof booking.bookingdates.checkin === 'string' &&
    typeof booking.bookingdates.checkout === 'string'
  );
}

export function validateMessage(message: any): message is Message {
  return (
    message &&
    typeof message.name === 'string' &&
    typeof message.email === 'string' &&
    typeof message.phone === 'string'
  );
}