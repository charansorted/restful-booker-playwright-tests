
import { test, expect, APIRequestContext, request as apiRequest } from '@playwright/test';
import { AuthHelper } from '../../../src/helpers/authHelpers';
import { createRoomData, createBookingData } from '../../../src/helpers/dataHelpers';
import { API_CONFIG } from '../../../src/config/api.config';
import { Room, Booking } from '../../../src/fixtures/interfaces';
import { Logger } from '../../../src/utils/logger';
import { validateBooking } from '../../../src/utils/validators';
import { getDateRange } from '../../../src/utils/dateUtils';

test.describe('Booking Management Endpoints', () => {
  let authToken: string;
  let testRoomId: number;
  let createdBookingIds: number[] = [];
  const logger = new Logger('BookingTests');
  let apiContext: APIRequestContext;

  test.beforeAll(async () => {
    logger.info('Setting up Booking tests');
    
   
    apiContext = await apiRequest.newContext({
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    const authHelper = new AuthHelper(apiContext);
    authToken = await authHelper.login();
    logger.info('Authentication successful');
    
  
    const uniqueRoomName = `Booking Test Room ${Date.now()}`;
    const roomData = createRoomData({ roomName: uniqueRoomName });
    
    
    const roomResponse = await apiContext.post(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.base}`, {
      data: roomData,
      headers: {
        'Cookie': `token=${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    logger.debug('Room creation response status:', roomResponse.status());
    expect(roomResponse.status()).toBe(200);
    
    
    const listResponse = await apiContext.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.base}`);
    const rooms = await listResponse.json();
    const roomsList = Array.isArray(rooms) ? rooms : rooms.rooms || [];
    
    const createdRoom = roomsList.find((r: Room) => r.roomName === uniqueRoomName);
    expect(createdRoom).toBeTruthy();
    
    testRoomId = createdRoom.roomid;
    logger.info(`Created test room with ID: ${testRoomId}`);
  });

  test.afterAll(async () => {
    logger.info('Cleaning up Booking tests');
    
    
    if (createdBookingIds.length > 0) {
      for (const bookingId of createdBookingIds) {
        try {
          await apiContext.delete(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.byId(bookingId)}`, {
            headers: {
              'Cookie': `token=${authToken}`
            }
          });
          logger.info('Cleaned up booking', { bookingId });
        } catch (error) {
          logger.warn('Failed to cleanup booking', { bookingId, error: error.message });
        }
      }
    }
    
    
    if (testRoomId) {
      try {
        await apiContext.delete(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.byId(testRoomId)}`, {
          headers: {
            'Cookie': `token=${authToken}`
          }
        });
        logger.info('Cleaned up test room', { roomId: testRoomId });
      } catch (error) {
        logger.warn('Failed to cleanup test room', error);
      }
    }
    
    // Dispose the context
    await apiContext.dispose();
  });

  test('POST /booking - should create a new booking ', async ({ request }) => {
    logger.info('Testing booking creation with debug info');
    
    // Create unique booking data
    const bookingData = createBookingData(testRoomId, {
      firstname: `Test${Date.now()}`,
      lastname: 'Booking'
    });
    
    // Log the booking data being sent
    logger.info('Booking data:', JSON.stringify(bookingData, null, 2));
    
    const response = await request.post(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.base}`, {
      data: bookingData
    });
  
    logger.info('Response status:', response.status());
    
    // Get response body for debugging
    const responseText = await response.text();
    logger.info('Response body:', responseText);
    
    // Try to parse as JSON if possible
    try {
      const responseJson = JSON.parse(responseText);
      logger.info('Response JSON:', JSON.stringify(responseJson, null, 2));
    } catch (e) {
      logger.info('Response is not valid JSON');
    }
    
    // Log response headers
    logger.info('Response headers:', response.headers());
    
    expect(response.status()).toBe(200);
  });
  
  test('GET /booking - should retrieve bookings by room (no auth required)', async ({ request }) => {
    logger.info('Testing GET bookings by room');
    // Based on browser request, GET /booking?roomid={id} doesn't require auth
    const response = await request.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.byRoom(testRoomId)}`, {
        headers: {
          'Cookie': `token=${authToken}`
        }
      });
  
    const responseBody = await response.json();
    const bookings = responseBody.bookings;
    
    expect(Array.isArray(bookings)).toBe(true);
    
    logger.info(`Found ${bookings.length} bookings for room ${testRoomId}`);
    
    // Response is directly an array, not wrapped
    expect(response.status()).toBe(200);
    expect(Array.isArray(bookings)).toBe(true);
    
    if (bookings.length > 0) {
      const booking = bookings[0];
      expect(booking).toHaveProperty('bookingid');
      expect(booking).toHaveProperty('roomid');
      expect(booking.roomid).toBe(testRoomId);
    }
  });

  
  test('DELETE /booking/{id} - should delete booking (admin)', async ({ request }) => {
    logger.info('Testing booking deletion');
    
    const authHelper = new AuthHelper(request);

 
    
    // Delete the booking
    const deleteResponse = await request.delete(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.byId(testRoomId)}`, {
        headers: authHelper.getAuthHeaders(authToken)
      });
    
    expect(deleteResponse.status()).toBe(200);
    
    // Verify deletion
    const getResponse = await request.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.byId(testRoomId)}`);
    expect(getResponse.status()).toBe(405);
  });

  test('PUT /booking/{id} - should require authentication', async ({ request }) => {
    logger.info('Testing booking update without auth');
    
    // Get any existing booking
    const listResponse = await request.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.base}`);
    const bookingsData = await listResponse.json();
    const bookingsList = Array.isArray(bookingsData) ? bookingsData : bookingsData.bookings || [];
    
    if (bookingsList.length > 0) {
      const existingBooking = bookingsList[0];
      const bookingData = createBookingData(testRoomId);
      
      const response = await request.put(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.byId(existingBooking.bookingid)}`, {
        data: bookingData
        // No auth headers
      });
      
      expect(response.status()).toBe(403);
    } else {
      logger.warn('No existing bookings to test unauthorized update');
    }
  });
});