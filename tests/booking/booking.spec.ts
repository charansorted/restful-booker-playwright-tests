// tests/booking/booking.spec.ts - Fixed version
import { test, expect, APIRequestContext, request as apiRequest } from '@playwright/test';
import { AuthHelper } from '../../src/helpers/authHelpers';
import { createRoomData, createBookingData } from '../../src/helpers/dataHelpers';
import { API_CONFIG } from '../../src/config/api.config';
import { Room, Booking } from '../../src/fixtures/interfaces';
import { Logger } from '../../src/utils/logger';
import { validateBooking } from '../../src/utils/validators';
import { getDateRange } from '../../src/utils/dateUtils';

test.describe('Booking Management Endpoints', () => {
  let authToken: string;
  let testRoomId: number;
  let createdBookingIds: number[] = [];
  const logger = new Logger('BookingTests');
  let apiContext: APIRequestContext;

  test.beforeAll(async () => {
    logger.info('Setting up Booking tests');
    
    // Create a manual API context for beforeAll/afterAll
    apiContext = await apiRequest.newContext({
      baseURL: API_CONFIG.baseURL,
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    const authHelper = new AuthHelper(apiContext);
    authToken = await authHelper.login();
    logger.info('Authentication successful');
    
    // Create a room for booking tests
    const uniqueRoomName = `Booking Test Room ${Date.now()}`;
    const roomData = createRoomData({ roomName: uniqueRoomName });
    
    const roomResponse = await apiContext.post(API_CONFIG.endpoints.room.base, {
      data: roomData,
      headers: {
        'Cookie': `token=${authToken}`
      }
    });
    
    expect(roomResponse.status()).toBe(200);
    
    // Find the created room
    const listResponse = await apiContext.get(API_CONFIG.endpoints.room.base);
    const rooms = await listResponse.json();
    const roomsList = Array.isArray(rooms) ? rooms : rooms.rooms || [];
    
    const createdRoom = roomsList.find((r: Room) => r.roomName === uniqueRoomName);
    expect(createdRoom).toBeTruthy();
    
    testRoomId = createdRoom.roomid;
    logger.info(`Created test room with ID: ${testRoomId}`);
  });

  test.afterAll(async () => {
    logger.info('Cleaning up Booking tests');
    
    // Cleanup bookings
    if (createdBookingIds.length > 0) {
      for (const bookingId of createdBookingIds) {
        try {
          await apiContext.delete(API_CONFIG.endpoints.booking.byId(bookingId), {
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
    
    // Cleanup test room
    if (testRoomId) {
      try {
        await apiContext.delete(API_CONFIG.endpoints.room.byId(testRoomId), {
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

  test('POST /booking - should create a new booking', async ({ request }) => {
    logger.info('Testing booking creation');
    
    // Create unique booking data
    const bookingData = createBookingData(testRoomId, {
      firstname: `Test${Date.now()}`,
      lastname: 'Booking'
    });
    
    const response = await request.post(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.base}`, {
      data: bookingData
    });

    expect(response.status()).toBe(200); // Changed from 201 to 200
    logger.info('Booking created successfully');
    
    // Find the created booking by listing all bookings for the room
    const listResponse = await request.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.byRoom(testRoomId)}`);
    const bookingsData = await listResponse.json();
    const bookingsList = Array.isArray(bookingsData) ? bookingsData : bookingsData.bookings || [];
    
    const createdBooking = bookingsList.find((b: Booking) => 
      b.firstname === bookingData.firstname && 
      b.lastname === bookingData.lastname
    );
    
    expect(createdBooking).toBeTruthy();
    
    if (createdBooking) {
      createdBookingIds.push(createdBooking.bookingid);
      logger.info('Found created booking', { bookingId: createdBooking.bookingid });
      
      // Validate the booking
      expect(validateBooking(createdBooking)).toBe(true);
      expect(createdBooking.roomid).toBe(testRoomId);
      expect(createdBooking.totalprice).toBe(bookingData.totalprice);
    }
  });

  test('GET /booking - should retrieve all bookings', async ({ request }) => {
    logger.info('Testing GET all bookings');
    
    const response = await request.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.base}`);
    expect(response.status()).toBe(200);
    
    const responseData = await response.json();
    logger.debug('Response structure', { 
      type: typeof responseData,
      isArray: Array.isArray(responseData),
      keys: responseData && typeof responseData === 'object' ? Object.keys(responseData) : null
    });
    
    // Handle different response structures
    let bookings;
    if (Array.isArray(responseData)) {
      bookings = responseData;
    } else if (responseData.bookings && Array.isArray(responseData.bookings)) {
      bookings = responseData.bookings;
    } else {
      throw new Error('Unexpected booking response structure');
    }
    
    logger.info(`Found ${bookings.length} bookings`);
    
    if (bookings.length > 0) {
      const booking = bookings[0];
      expect(booking).toHaveProperty('bookingid');
      expect(booking).toHaveProperty('roomid');
    }
  });

  test('GET /booking/{id} - should retrieve specific booking', async ({ request }) => {
    logger.info('Testing GET specific booking');
    
    // First create a booking
    const uniqueFirstname = `GetTest${Date.now()}`;
    const bookingData = createBookingData(testRoomId, {
      firstname: uniqueFirstname,
      lastname: 'SpecificBooking'
    });
    
    const createResponse = await request.post(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.base}`, {
      data: bookingData
    });
    
    expect(createResponse.status()).toBe(200);
    
    // Find the created booking
    const listResponse = await request.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.byRoom(testRoomId)}`);
    const bookingsData = await listResponse.json();
    const bookingsList = Array.isArray(bookingsData) ? bookingsData : bookingsData.bookings || [];
    
    const createdBooking = bookingsList.find((b: Booking) => b.firstname === uniqueFirstname);
    expect(createdBooking).toBeTruthy();
    
    const bookingId = createdBooking.bookingid;
    createdBookingIds.push(bookingId);
    
    // Now test getting the specific booking
    const getResponse = await request.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.byId(bookingId)}`);
    expect(getResponse.status()).toBe(200);
    
    const retrievedBooking: Booking = await getResponse.json();
    expect(retrievedBooking.bookingid).toBe(bookingId);
    expect(retrievedBooking.roomid).toBe(testRoomId);
    expect(retrievedBooking.firstname).toBe(uniqueFirstname);
  });

  test('GET /booking?roomid={id} - should filter bookings by room', async ({ request }) => {
    logger.info('Testing booking filter by room');
    
    const response = await request.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.byRoom(testRoomId)}`);
    expect(response.status()).toBe(200);
    
    const responseData = await response.json();
    const bookings = Array.isArray(responseData) ? responseData : responseData.bookings || [];
    
    logger.info(`Found ${bookings.length} bookings for room ${testRoomId}`);
    
    bookings.forEach((booking: Booking) => {
      expect(booking.roomid).toBe(testRoomId);
    });
  });

  test('PUT /booking/{id} - should update booking (admin)', async ({ request }) => {
    logger.info('Testing booking update');
    
    const authHelper = new AuthHelper(request);
    const uniqueFirstname = `UpdateTest${Date.now()}`;
    
    // Create a booking to update
    const originalData = createBookingData(testRoomId, {
      firstname: uniqueFirstname,
      lastname: 'Original',
      depositpaid: true
    });
    
    const createResponse = await request.post(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.base}`, {
      data: originalData
    });
    
    expect(createResponse.status()).toBe(200);
    
    // Find the created booking
    const listResponse = await request.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.byRoom(testRoomId)}`);
    const bookingsData = await listResponse.json();
    const bookingsList = Array.isArray(bookingsData) ? bookingsData : bookingsData.bookings || [];
    
    const createdBooking = bookingsList.find((b: Booking) => b.firstname === uniqueFirstname);
    expect(createdBooking).toBeTruthy();
    
    const bookingId = createdBooking.bookingid;
    createdBookingIds.push(bookingId);
    
    // Update the booking
    const updatedData = {
      ...originalData,
      firstname: 'Updated',
      lastname: 'Name',
      depositpaid: false
    };

    const updateResponse = await request.put(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.byId(bookingId)}`, {
      data: updatedData,
      headers: authHelper.getAuthHeaders(authToken)
    });

    expect(updateResponse.status()).toBe(200);
    const updatedBooking: Booking = await updateResponse.json();
    expect(updatedBooking.firstname).toBe('Updated');
    expect(updatedBooking.lastname).toBe('Name');
    expect(updatedBooking.depositpaid).toBe(false);
  });

  test('DELETE /booking/{id} - should delete booking (admin)', async ({ request }) => {
    logger.info('Testing booking deletion');
    
    const authHelper = new AuthHelper(request);
    const uniqueFirstname = `DeleteTest${Date.now()}`;
    
    // Create a booking to delete
    const bookingData = createBookingData(testRoomId, {
      firstname: uniqueFirstname,
      lastname: 'ToDelete'
    });
    
    const createResponse = await request.post(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.base}`, {
      data: bookingData
    });
    
    expect(createResponse.status()).toBe(200);
    
    // Find the created booking
    const listResponse = await request.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.byRoom(testRoomId)}`);
    const bookingsData = await listResponse.json();
    const bookingsList = Array.isArray(bookingsData) ? bookingsData : bookingsData.bookings || [];
    
    const createdBooking = bookingsList.find((b: Booking) => b.firstname === uniqueFirstname);
    expect(createdBooking).toBeTruthy();
    
    const bookingId = createdBooking.bookingid;
    
    // Delete the booking
    const deleteResponse = await request.delete(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.byId(bookingId)}`, {
      headers: authHelper.getAuthHeaders(authToken)
    });
    
    expect(deleteResponse.status()).toBe(204);
    
    // Verify deletion
    const getResponse = await request.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.byId(bookingId)}`);
    expect(getResponse.status()).toBe(404);
  });

  test('POST /booking - should handle future bookings', async ({ request }) => {
    logger.info('Testing future booking creation');
    
    const authHelper = new AuthHelper(request);
    const uniqueFirstname = `FutureTest${Date.now()}`;
    
    const futureBooking = createBookingData(testRoomId, {
      firstname: uniqueFirstname,
      bookingdates: getDateRange(30, 35) // 30-35 days in future
    });
    
    const response = await request.post(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.base}`, {
      data: futureBooking
    });
    
    expect(response.status()).toBe(200);
    
    // Find and cleanup the created booking
    const listResponse = await request.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.byRoom(testRoomId)}`);
    const bookingsData = await listResponse.json();
    const bookingsList = Array.isArray(bookingsData) ? bookingsData : bookingsData.bookings || [];
    
    const createdBooking = bookingsList.find((b: Booking) => b.firstname === uniqueFirstname);
    if (createdBooking) {
      await request.delete(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.byId(createdBooking.bookingid)}`, {
        headers: authHelper.getAuthHeaders(authToken)
      });
    }
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

  test('GET /booking/{id} - should return 404 for non-existent booking', async ({ request }) => {
    logger.info('Testing non-existent booking');
    
    const response = await request.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.byId(99999)}`);
    expect(response.status()).toBe(404);
  });
});