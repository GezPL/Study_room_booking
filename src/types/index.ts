export type Building = 'A' | 'B' | 'C' | 'V';

export type EquipmentType = 'Projector' | 'Whiteboard' | 'High-spec PC' | 'AC';

export type RoomStatus = 'Available Now' | 'Occupied';

export interface Room {
  id: string;
  name: string;
  image_url: string;
  building: Building;
  floor: number;
  capacity: number; // 2-20
  equipment: EquipmentType[];
  status: RoomStatus;
  description?: string;
}

export type TimeSlot =
  | '07:30 - 09:30'
  | '09:30 - 11:30'
  | '13:00 - 15:00'
  | '15:00 - 17:00';

export interface Booking {
  id: string;
  roomId: string;
  room: Room;
  date: string; // Format: YYYY-MM-DD
  timeSlot: string;
  createdAt: string;
  notificationId?: string;
}

export interface UserSession {
  id: string;
  name: string;
  studentId: string;
  email: string;
  faculty: string;
}

export interface ActiveFilters {
  building: Building | null;
  capacity: number | null;
  equipment: EquipmentType[];
  searchQuery?: string;
}

export type RootStackParamList = {
  MainTabs: undefined;
  RoomDetail: { room: Room };
};

export type MainTabParamList = {
  Home: undefined;
  MyBookings: undefined;
};

