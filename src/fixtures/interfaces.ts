export interface Auth {
    username: string;
    password: string;
  }
  
  export interface Token {
    token: string;
  }
  
  export interface Room {
    roomid?: number;
    roomName: string;
    type: string;
    accessible: boolean;
    image: string;
    description: string;
    features: string[];
    roomPrice: number;
  }
  
  export interface BookingDates {
    checkin: string;
    checkout: string;
  }
  
  export interface Booking {
    bookingid?: number;
    roomid: number;
    firstname: string;
    lastname: string;
    totalprice: number;
    depositpaid: boolean;
    bookingdates: BookingDates;
    additionalneeds?: string;
  }
  
  export interface Message {
    messageid?: number;
    name: string;
    email: string;
    phone: string;
    subject: string;
    description: string;
  }
  
  export interface ApiResponse<T> {
    status: number;
    data: T;
    headers: Record<string, string>;
  }
  