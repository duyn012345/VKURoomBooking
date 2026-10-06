export type Role = 'student' | 'lecturer' | 'admin';
export type RoomStatus = 'active' | 'maintenance';

export interface Room {
  id: string;
  name: string;
  location: string;
  capacity: number;
  image_url: string | null;
  description: string | null;
  equipment: string[] | null;
  status: RoomStatus;
}

export interface Slot {
  id: number;
  label: string;
  time: string;
  endMin: number;
}

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  email: string | null;
  phone: string | null;
  student_code: string | null;
  faculty: string | null;
  class_name: string | null;
  created_at: string;
}

export type BookingStatus = 'confirmed' | 'cancelled';

export interface BookingWithRoom {
  id: string;
  booking_date: string;
  slot: number;
  status: BookingStatus;
  rooms: { name: string; location: string; image_url: string | null } | null;
}

export interface AdminBooking {
  id: string;
  booking_date: string;
  slot: number;
  status: BookingStatus;
  user_id: string;
  rooms: { name: string } | null;
  profiles: { full_name: string; role: Role; email: string | null } | null;
}

export type SlotState = 'free' | 'mine' | 'occupied' | 'past' | 'maintenance';