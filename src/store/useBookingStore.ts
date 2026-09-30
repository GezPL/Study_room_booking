import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking, Room, UserSession, ActiveFilters } from '../types';
import { DEFAULT_USER_SESSION } from '../utils/mockData';

export interface BookingStore {
  userSession: UserSession | null;
  activeBookings: Booking[];
  activeFilters: ActiveFilters;

  // Actions
  addBooking: (
    room: Room,
    date: string,
    timeSlot: string,
    notificationId?: string
  ) => Booking;
  cancelBooking: (bookingId: string) => void;
  setFilters: (filters: Partial<ActiveFilters>) => void;
  resetFilters: () => void;
  setUserSession: (session: UserSession | null) => void;
  isSlotBooked: (roomId: string, date: string, timeSlot: string) => boolean;
  clearAllBookings: () => void;
}

export const INITIAL_FILTERS: ActiveFilters = {
  building: null,
  capacity: null,
  equipment: [],
  searchQuery: '',
};

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      userSession: DEFAULT_USER_SESSION,
      activeBookings: [],
      activeFilters: INITIAL_FILTERS,

      addBooking: (room, date, timeSlot, notificationId) => {
        const newBooking: Booking = {
          id: `book-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          roomId: room.id,
          room,
          date,
          timeSlot,
          createdAt: new Date().toISOString(),
          notificationId,
        };

        set((state) => ({
          activeBookings: [newBooking, ...state.activeBookings],
        }));

        return newBooking;
      },

      cancelBooking: (bookingId) => {
        set((state) => ({
          activeBookings: state.activeBookings.filter(
            (booking) => booking.id !== bookingId
          ),
        }));
      },

      setFilters: (filters) => {
        set((state) => ({
          activeFilters: {
            ...state.activeFilters,
            ...filters,
          },
        }));
      },

      resetFilters: () => {
        set({
          activeFilters: INITIAL_FILTERS,
        });
      },

      setUserSession: (session) => {
        set({ userSession: session });
      },

      isSlotBooked: (roomId, date, timeSlot) => {
        const { activeBookings } = get();
        return activeBookings.some(
          (b) =>
            b.roomId === roomId &&
            b.date === date &&
            b.timeSlot === timeSlot
        );
      },

      clearAllBookings: () => {
        set({ activeBookings: [] });
      },
    }),
    {
      name: 'vku-booking-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist userSession and activeBookings, keep activeFilters ephemeral or persistent
      partialize: (state) => ({
        userSession: state.userSession,
        activeBookings: state.activeBookings,
      }),
    }
  )
);

