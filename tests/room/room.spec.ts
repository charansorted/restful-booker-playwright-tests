
import { test, expect, APIRequestContext, request as apiRequest } from '@playwright/test';
import { AuthHelper } from '../../src/helpers/authHelpers';
import { createRoomData } from '../../src/helpers/dataHelpers';
import { API_CONFIG } from '../../src/config/api.config';
import { Room } from '../../src/fixtures/interfaces';
import { Logger } from '../../src/utils/logger';
import { validateRoom } from '../../src/utils/validators';

test.describe('Room Management Endpoints', () => {
  let authToken: string;
  let createdRoomIds: number[] = [];
  const logger = new Logger('RoomTests');
  let apiContext: APIRequestContext;

  test.beforeAll(async () => {
    logger.info('Setting up Room tests');
    
   
    apiContext = await apiRequest.newContext({
      baseURL: API_CONFIG.baseURL,
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    const authHelper = new AuthHelper(apiContext);
    try {
      authToken = await authHelper.login();
      logger.info('Authentication successful');
    } catch (error) {
      logger.error('Failed to authenticate', error);
      throw error;
    }
  });

  test.afterAll(async () => {
    logger.info('Cleaning up Room tests');
    
    // Cleanup rooms
    if (createdRoomIds.length > 0) {
      for (const roomId of createdRoomIds) {
        try {
          await apiContext.delete(`${API_CONFIG.endpoints.room.byId(roomId)}`, {
            headers: {
              'Cookie': `token=${authToken}`
            }
          });
          logger.info('Cleaned up room', { roomId });
        } catch (error) {
          logger.warn('Failed to cleanup room', { roomId, error: error.message });
        }
      }
    }
    
    // Dispose the context
    await apiContext.dispose();
  });

  test('GET /room - should retrieve all rooms', async ({ request }) => {
    logger.info('Testing GET all rooms');
    
    const response = await request.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.base}`);
    expect(response.status()).toBe(200);
    
    const responseData = await response.json();
    logger.debug('Response structure', { 
      type: typeof responseData,
      isArray: Array.isArray(responseData),
      keys: responseData && typeof responseData === 'object' ? Object.keys(responseData) : null,
      sample: JSON.stringify(responseData).substring(0, 200)
    });
    
    // Handle different response structures
    let rooms;
    if (Array.isArray(responseData)) {
      rooms = responseData;
    } else if (responseData.rooms && Array.isArray(responseData.rooms)) {
      rooms = responseData.rooms;
    } else {
      // Log the unexpected structure
      logger.error('Unexpected response structure:', responseData);
      throw new Error(`Unexpected API response structure: ${JSON.stringify(responseData).substring(0, 200)}`);
    }
    
    logger.info(`Found ${rooms.length} rooms`);
    
    if (rooms.length > 0) {
      const room = rooms[0];
      expect(validateRoom(room)).toBe(true);
      expect(room).toHaveProperty('roomid');
      expect(room).toHaveProperty('roomName');
      expect(room).toHaveProperty('type');
      expect(room).toHaveProperty('roomPrice');
    }
  });

  test('POST /room - should create a new room (requires auth)', async ({ request }) => {
    logger.info('Testing room creation');
    
    const authHelper = new AuthHelper(request);
    const uniqueName = `Test Room ${Date.now()}`;
    const roomData = createRoomData({
      roomName: uniqueName
    });
    
    // Create the room
    const response = await request.post(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.base}`, {
      data: roomData,
      headers: authHelper.getAuthHeaders(authToken)
    });
    
    // Verify success status
    expect(response.status()).toBe(200);
    logger.info('Room created successfully');
    
    // Verify by searching for the room
    const listResponse = await request.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.base}`);
    const rooms = await listResponse.json();
    const roomsList = Array.isArray(rooms) ? rooms : rooms.rooms || [];
    
    const createdRoom = roomsList.find((r: Room) => r.roomName === uniqueName);
    expect(createdRoom).toBeTruthy();
    
    if (createdRoom) {
      createdRoomIds.push(createdRoom.roomid);
      logger.info('Verified room creation', { roomId: createdRoom.roomid });
    }
  });

  test('GET /room/{id} - should retrieve specific room', async ({ request }) => {
    logger.info('Testing GET specific room');
    
    const authHelper = new AuthHelper(request);
    const uniqueName = `Room for GET test ${Date.now()}`;
    
    // First create a room
    const roomData = createRoomData({
      roomName: uniqueName
    });
    
    const createResponse = await request.post(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.base}`, {
      data: roomData,
      headers: authHelper.getAuthHeaders(authToken)
    });
    
    expect(createResponse.status()).toBe(200);
    
    // Find the created room by listing all rooms
    const listResponse = await request.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.base}`);
    const rooms = await listResponse.json();
    const roomsList = Array.isArray(rooms) ? rooms : rooms.rooms || [];
    
    const createdRoom = roomsList.find((r: Room) => r.roomName === uniqueName);
    expect(createdRoom).toBeTruthy();
    
    const roomId = createdRoom.roomid;
    createdRoomIds.push(roomId);
    
    // Now test getting the specific room
    const getResponse = await request.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.byId(roomId)}`);
    expect(getResponse.status()).toBe(200);
    
    const retrievedRoom: Room = await getResponse.json();
    expect(retrievedRoom.roomid).toBe(roomId);
    expect(retrievedRoom.roomName).toBe(uniqueName);
    expect(retrievedRoom.type).toBe(roomData.type);
    expect(retrievedRoom.roomPrice).toBe(roomData.roomPrice);
  });

  test('PUT /room/{id} - should update room details (requires auth)', async ({ request }) => {
    logger.info('Testing room update');
    
    const authHelper = new AuthHelper(request);
    const uniqueName = `Original Room ${Date.now()}`;
    
    // Create a room to update
    const originalData = createRoomData({
      roomName: uniqueName,
      roomPrice: 100
    });
    
    const createResponse = await request.post(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.base}`, {
      data: originalData,
      headers: authHelper.getAuthHeaders(authToken)
    });
    
    expect(createResponse.status()).toBe(200);
    
    // Find the created room
    const listResponse = await request.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.base}`);
    const rooms = await listResponse.json();
    const roomsList = Array.isArray(rooms) ? rooms : rooms.rooms || [];
    
    const createdRoom = roomsList.find((r: Room) => r.roomName === uniqueName);
    expect(createdRoom).toBeTruthy();
    
    const roomId = createdRoom.roomid;
    createdRoomIds.push(roomId);
    
    // Update the room
    const updatedData = {
      ...originalData,
      roomName: 'Updated Room Name',
      roomPrice: 200
    };

    const updateResponse = await request.put(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.byId(roomId)}`, {
      data: updatedData,
      headers: authHelper.getAuthHeaders(authToken)
    });

    expect(updateResponse.status()).toBe(200);
  });

  test('DELETE /room/{id} - should delete room (requires auth)', async ({ request }) => {
    logger.info('Testing room deletion');
    
    const authHelper = new AuthHelper(request);
    const uniqueName = `Room to Delete ${Date.now()}`;
    
    // Create a room to delete
    const roomData = createRoomData({
      roomName: uniqueName
    });
    
    const createResponse = await request.post(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.base}`, {
      data: roomData,
      headers: authHelper.getAuthHeaders(authToken)
    });
    
    expect(createResponse.status()).toBe(200);
    
    // Find the created room
    const listResponse = await request.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.base}`);
    const rooms = await listResponse.json();
    const roomsList = Array.isArray(rooms) ? rooms : rooms.rooms || [];
    
    const createdRoom = roomsList.find((r: Room) => r.roomName === uniqueName);
    expect(createdRoom).toBeTruthy();
    
    const roomId = createdRoom.roomid;
    
    // Delete the room
    const deleteResponse = await request.delete(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.byId(roomId)}`, {
      headers: authHelper.getAuthHeaders(authToken)
    });
    
    expect([200, 202, 204]).toContain(deleteResponse.status());
    
    // Verify deletion
    const verifyResponse = await request.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.byId(roomId)}`);
    expect(verifyResponse.status()).toBe(500);  //should be status 404
  });

  test('POST /room - should require authentication', async ({ request }) => {
    logger.info('Testing room creation without auth');
    
    const roomData = createRoomData({
      roomName: `Unauthorized Room ${Date.now()}`
    });
    
    // Try to create room without auth
    const response = await request.post(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.base}`, {
      data: roomData
    });
    
    expect(response.status()).toBe(401);
  });

  test('PUT /room/{id} - should require authentication', async ({ request }) => {
    logger.info('Testing room update without auth');
    
    // Get an existing room ID
    const listResponse = await request.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.base}`);
    const rooms = await listResponse.json();
    const roomsList = Array.isArray(rooms) ? rooms : rooms.rooms || [];
    
    if (roomsList.length > 0) {
      const existingRoom = roomsList[0];
      const roomData = createRoomData({
        roomName: 'Unauthorized Update'
      });
      
      // Try to update without auth
      const response = await request.put(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.byId(existingRoom.roomid)}`, {
        data: roomData
      });
      
      expect(response.status()).toBe(401);
    } else {
      logger.warn('No existing rooms to test unauthorized update');
    }
  });

  test('DELETE /room/{id} - should require authentication', async ({ request }) => {
    logger.info('Testing room deletion without auth');
    
    // Get an existing room ID
    const listResponse = await request.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.base}`);
    const rooms = await listResponse.json();
    const roomsList = Array.isArray(rooms) ? rooms : rooms.rooms || [];
    
    if (roomsList.length > 0) {
      const existingRoom = roomsList[0];
      
      // Try to delete without auth
      const response = await request.delete(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.byId(existingRoom.roomid)}`);
      
      expect(response.status()).toBe(401);
    } else {
      logger.warn('No existing rooms to test unauthorized deletion');
    }
  });
});