import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../src/helpers/authHelpers';
import { createRoomData, createBookingData, createMessageData } from '../../src/helpers/dataHelpers';
import { API_CONFIG } from '../../src/config/api.config';
import { Room, Booking, Message } from '../../src/fixtures/interfaces';
import { Logger } from '../../src/utils/logger';
import { getDateRange } from '../../src/utils/dateUtils';

test.describe('End-to-End User Flows', () => {
  const logger = new Logger('E2ETests');

  test('Complete booking flow: Admin creates room, user books it, sends message, admin manages everything', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    let authToken: string;
    let createdRoomId: number;
    let createdBookingId: number;
    let createdMessageId: number;

    try {
      // Step 1: Admin logs in
      logger.info('Step 1: Admin authentication');
      authToken = await authHelper.login();
      expect(authToken).toBeTruthy();

      // Step 2: Validate token
      logger.info('Step 2: Validating auth token');
      const isValid = await authHelper.validateToken(authToken);
      expect(isValid).toBe(true);

      // Step 3: Admin creates a room
      logger.info('Step 3: Creating room');
      const uniqueRoomName = `E2E Test Suite Room ${Date.now()}`;
      const roomData = createRoomData({
        roomName: uniqueRoomName,
        roomPrice: 150,
        type: 'Double'
      });

      const roomResponse = await request.post(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.base}`, {
        data: roomData,
        headers: authHelper.getAuthHeaders(authToken)
      });
      expect(roomResponse.status()).toBe(200); // As per API behavior

      // Step 4: Get room ID by listing rooms
      const listResponse = await request.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.base}`);
      expect(listResponse.status()).toBe(200);
      const rooms = await listResponse.json();
      const roomsList = Array.isArray(rooms) ? rooms : rooms.rooms || [];

      const createdRoom = roomsList.find((r: Room) => r.roomName === uniqueRoomName);
      expect(createdRoom).toBeTruthy();
      createdRoomId = createdRoom.roomid!;
      logger.info(`✅ Created room with ID: ${createdRoomId}`);

      // Step 5: User books the created room
      logger.info('Step 5: Creating booking');
      const bookingData = createBookingData(createdRoomId, {
        firstname: 'E2E',
        lastname: 'Tester',
        bookingdates: getDateRange(7, 10)
      });

      const bookingResponse = await request.post(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.base}`, {
        data: bookingData
      });
      expect(bookingResponse.status()).toBe(201);
      const createdBooking: Booking = await bookingResponse.json();
      createdBookingId = createdBooking.bookingid!;
      expect(createdBooking.roomid).toBe(createdRoomId);
      logger.info(`✅ Created booking with ID: ${createdBookingId}`);

      // Step 6: Retrieve booking to confirm
      logger.info('Step 6: Confirming booking');
      const bookingCheck = await request.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.byId(createdBookingId)}`);
      expect(bookingCheck.status()).toBe(200);
      const fetchedBooking: Booking = await bookingCheck.json();
      expect(fetchedBooking.firstname).toBe(bookingData.firstname);

      // Step 7: User sends message
      logger.info('Step 7: Sending contact message');
      const messageData = createMessageData({
        name: 'E2E Tester',
        subject: 'Question about my booking',
        description: `I have a question about booking ${createdBookingId}`
      });

      const messageResponse = await request.post(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.message.base}`, {
        data: messageData
      });
      expect(messageResponse.status()).toBe(201);
      const message: Message = await messageResponse.json();
      createdMessageId = message.messageid!;
      expect(message.name).toBe(messageData.name);
      logger.info(`✅ Created message with ID: ${createdMessageId}`);

      // Step 8: Admin retrieves all messages
      logger.info('Step 8: Admin retrieving messages');
      const messagesResponse = await request.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.message.base}`, {
        headers: authHelper.getAuthHeaders(authToken)
      });
      expect(messagesResponse.status()).toBe(200);
      const allMessages = await messagesResponse.json();
      const foundMessage = allMessages.messages.find((m: Message) => m.messageid === createdMessageId);
      expect(foundMessage).toBeTruthy();

      // Step 9: Admin updates booking
      logger.info('Step 9: Admin updates booking');
      const updatedBookingData = {
        ...bookingData,
        depositpaid: false,
        additionalneeds: 'Late checkout requested'
      };

      const updateResponse = await request.put(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.byId(createdBookingId)}`, {
        data: updatedBookingData,
        headers: authHelper.getAuthHeaders(authToken)
      });
      expect(updateResponse.status()).toBe(200);
      const updatedBooking = await updateResponse.json();
      expect(updatedBooking.additionalneeds).toBe('Late checkout requested');

      // Step 10: Admin deletes message
      logger.info('Step 10: Admin deletes message');
      const deleteMessageResponse = await request.delete(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.message.byId(createdMessageId)}`, {
        headers: authHelper.getAuthHeaders(authToken)
      });
      expect(deleteMessageResponse.status()).toBe(204);

      // Step 11: Admin deletes booking using roomId (as per API behavior)
      logger.info('Step 11: Admin deletes booking using roomId');
      const deleteBookingResponse = await request.delete(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.byId(createdRoomId)}`, {
        headers: authHelper.getAuthHeaders(authToken)
      });
      expect(deleteBookingResponse.status()).toBe(204);

      // Step 12: Admin deletes room
      logger.info('Step 12: Admin deletes room');
      const deleteRoomResponse = await request.delete(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.byId(createdRoomId)}`, {
        headers: authHelper.getAuthHeaders(authToken)
      });
      expect([200, 204]).toContain(deleteRoomResponse.status());

      // Step 13: Admin logs out
      logger.info('Step 13: Admin logout');
      await authHelper.logout(authToken);

      logger.info('✅ E2E test completed successfully');

    } catch (error) {
      logger.error('❌ E2E test failed:', error);
      throw error;
    }
  });
});
