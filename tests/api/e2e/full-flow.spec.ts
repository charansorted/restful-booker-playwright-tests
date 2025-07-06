import { test, expect } from "@playwright/test";
import { AuthHelper } from "../../../src/helpers/authHelpers";
import {
  createRoomData,
  createBookingData,
} from "../../../src/helpers/dataHelpers";
import { API_CONFIG } from "../../../src/config/api.config";
import { Room, Booking, Message } from "../../../src/fixtures/interfaces";
import { Logger } from "../../../src/utils/logger";
import { getDateRange } from "../../../src/utils/dateUtils";

test.describe("End-to-End User Flows", () => {
  const logger = new Logger("E2ETests");

  test("Complete booking flow: Admin creates room, user books it, sends message, admin manages everything", async ({
    request,
  }) => {
    const authHelper = new AuthHelper(request);
    let authToken: string;
    let createdRoomId: number;
    let createdBookingId: number;
    let createdMessageId: number;

    try {
      // Step 1: Admin logs in
      logger.info("Step 1: Admin authentication");
      authToken = await authHelper.login();
      expect(authToken).toBeTruthy();

      // Step 2: Validate token
      logger.info("Step 2: Validating auth token");
      const isValid = await authHelper.validateToken(authToken);
      expect(isValid).toBe(true);

      // Step 3: Admin creates a room
      logger.info("Step 3: Creating room");
      const uniqueRoomName = `E2E Test Suite Room ${Date.now()}`;
      const roomData = createRoomData({
        roomName: uniqueRoomName,
        roomPrice: 150,
        type: "Double",
      });

      const roomResponse = await request.post(
        `${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.base}`,
        {
          data: roomData,
          headers: authHelper.getAuthHeaders(authToken),
        }
      );
      expect(roomResponse.status()).toBe(200); // As per API behavior

      // Step 4: Get room ID by listing rooms
      const listResponse = await request.get(
        `${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.base}`
      );
      expect(listResponse.status()).toBe(200);
      const rooms = await listResponse.json();
      const roomsList = Array.isArray(rooms) ? rooms : rooms.rooms || [];

      const createdRoom = roomsList.find(
        (r: Room) => r.roomName === uniqueRoomName
      );
      expect(createdRoom).toBeTruthy();
      createdRoomId = createdRoom.roomid!;
      logger.info(`✅ Created room with ID: ${createdRoomId}`);

      // Step 5: User books the created room
      logger.info("Step 5: Creating booking");
      const uniqueFirstname = `E2E${Date.now()}`;
      const bookingData = createBookingData(createdRoomId, {
        firstname: uniqueFirstname,
        lastname: "Tester",
        bookingdates: getDateRange(7, 10),
      });
      logger.info("Booking data:", JSON.stringify(bookingData, null, 2));

      const bookingResponse = await request.post(
        `${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.base}`,
        {
          data: bookingData,
        }
      );
      logger.info("Response status:", bookingResponse.status());
      expect(bookingResponse.status()).toBe(200);
      logger.info("✅ Booking created (no booking ID in response)");

      // Step 6: Retrieve booking by room to confirm and get booking ID
      logger.info("Step 6: Confirming booking via room ID");

      const bookingCheck = await request.get(
        `${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.byRoom(
          createdRoomId
        )}`,
        {
          headers: {
            Cookie: `token=${authToken}`,
          },
        }
      );

      expect(bookingCheck.status()).toBe(200);

      const bookingListResponse = await bookingCheck.json();
      const bookings = bookingListResponse.bookings ?? [];
      expect(Array.isArray(bookings)).toBe(true);
      expect(bookings.length).toBeGreaterThan(0);

      const matchedBooking = bookings.find(
        (b: Booking) => b.firstname === uniqueFirstname
      );
      expect(matchedBooking).toBeTruthy();

      createdBookingId = matchedBooking.bookingid!;
      expect(matchedBooking.roomid).toBe(createdRoomId);

      logger.info(
        `✅ Verified booking created and retrieved: ID ${createdBookingId}`
      );
      // Step 7: User sends message
      logger.info("Step 7: Sending contact message");

      // Ensure all required fields are included based on the working payload
      const messageData = {
        name: "E2E Tester",
        email: "test@test.com",
        phone: "45647577678676677676", // Using the phone format that works
        subject: "Question about my booking",
        description: `I have a question about booking ${createdBookingId}`
      };
      
      // Log the payload for debugging
      logger.info("Message payload:", JSON.stringify(messageData, null, 2));
      
      try {
        const messageResponse = await request.post(
          `${API_CONFIG.baseURL}${API_CONFIG.endpoints.message.base}`,
          {
            data: messageData,
            headers: {
              ...authHelper.getAuthHeaders(authToken),
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );
      
        
        logger.info(`Message response status: ${messageResponse.status()}`);
        
       
        expect(messageResponse.status()).toBe(200);
        
        const createResponse = await messageResponse.json();
        expect(createResponse.success).toBe(true);
        
        logger.info("✅ Message created successfully");
      
        // Step 8: Admin retrieves all messages to find the created one
        logger.info("Step 8: Admin retrieving messages");
        const messagesResponse = await request.get(
          `${API_CONFIG.baseURL}${API_CONFIG.endpoints.message.base}`,
          {
            headers: authHelper.getAuthHeaders(authToken),
          }
        );
        
        expect(messagesResponse.status()).toBe(200);
        const messagesData = await messagesResponse.json();
        
       
        expect(messagesData).toHaveProperty('messages');
        expect(Array.isArray(messagesData.messages)).toBe(true);
        
        // Find the message we just created by matching name and subject
        const foundMessage = messagesData.messages.find(
          (m: any) => m.name === messageData.name && m.subject === messageData.subject
        );
        
        expect(foundMessage).toBeTruthy();
        expect(foundMessage.read).toBe(false); // New messages should be unread
        
        // Store the message ID for later use
        createdMessageId = foundMessage.id;
        
        logger.info(`✅ Found created message with ID: ${createdMessageId}`);
        
        
      } catch (error) {
        logger.error("Failed to create/retrieve message:", error);
        throw error;
      }
       

      // Step 10: Admin deletes message
      logger.info("Step 10: Admin deletes message");
      const deleteMessageResponse = await request.delete(
        `${API_CONFIG.baseURL}${API_CONFIG.endpoints.message.byId(
          createdMessageId
        )}`,
        {
          headers: authHelper.getAuthHeaders(authToken),
        }
      );
      expect(deleteMessageResponse.status()).toBe(200); //wrong status code should be 204

      // Step 11: Admin deletes booking using roomId (as per API behavior)
      logger.info("Step 11: Admin deletes booking using roomId");
      const deleteBookingResponse = await request.delete(
        `${API_CONFIG.baseURL}${API_CONFIG.endpoints.booking.byId(
          createdRoomId
        )}`,
        {
          headers: authHelper.getAuthHeaders(authToken),
        }
      );
      expect(deleteBookingResponse.status()).toBe(200);

      // Step 12: Admin deletes room
      logger.info("Step 12: Admin deletes room");
      const deleteRoomResponse = await request.delete(
        `${API_CONFIG.baseURL}${API_CONFIG.endpoints.room.byId(createdRoomId)}`,
        {
          headers: authHelper.getAuthHeaders(authToken),
        }
      );
      expect([200, 204]).toContain(deleteRoomResponse.status());

      // Step 13: Admin logs out
      logger.info("Step 13: Admin logout");
      await authHelper.logout(authToken);

      logger.info("✅ E2E test completed successfully");
    } catch (error) {
      logger.error("❌ E2E test failed:", error);
      throw error;
    }
  });
});
