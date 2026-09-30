import { Booking, RoomStatus } from '../types';

export interface DaySlot {
  dateString: string; // YYYY-MM-DD
  dayLabel: string; // 'Today', 'Tomorrow', 'Wed', etc.
  dayNumber: string; // '29', '30', etc.
  monthLabel: string; // 'Sep', 'Oct', etc.
  isToday: boolean;
}

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getNext7Days(): DaySlot[] {
  const days: DaySlot[] = [];
  const now = new Date();

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    let dayLabel = weekdayNames[d.getDay()];
    if (i === 0) dayLabel = 'Today';
    if (i === 1) dayLabel = 'Tomorrow';

    days.push({
      dateString,
      dayLabel,
      dayNumber: String(d.getDate()),
      monthLabel: monthNames[d.getMonth()],
      isToday: i === 0,
    });
  }

  return days;
}

/**
 * Checks whether a time slot has already started or passed today
 */
export function isTimeSlotInPast(dateString: string, timeSlot: string): boolean {
  const now = new Date();
  const todayStr = getTodayString();

  if (dateString < todayStr) return true;
  if (dateString > todayStr) return false;

  // Same day: check start time (e.g. "07:30")
  const startStr = timeSlot.split('-')[0].trim();
  const [hours, minutes] = startStr.split(':').map(Number);
  const slotStartDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0,
    0
  );

  return now.getTime() >= slotStartDate.getTime();
}

/**
 * Checks whether a booking has completely ended (past end-time)
 */
export function isBookingPast(dateString: string, timeSlot: string): boolean {
  const now = new Date();
  const todayStr = getTodayString();

  if (dateString < todayStr) return true;
  if (dateString > todayStr) return false;

  // Same day: check end time (e.g. "09:30")
  const parts = timeSlot.split('-');
  if (parts.length < 2) return false;
  const endStr = parts[1].trim();
  const [hours, minutes] = endStr.split(':').map(Number);
  const slotEndDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0,
    0
  );

  return now.getTime() >= slotEndDate.getTime();
}

/**
 * Calculates whether a room is currently occupied by an active booking right now
 */
export function getRoomCurrentStatus(
  roomId: string,
  activeBookings: Booking[],
  fallbackStatus: RoomStatus = 'Available Now'
): RoomStatus {
  const now = new Date();
  const todayStr = getTodayString();

  const isOccupiedRightNow = activeBookings.some((b) => {
    if (b.roomId !== roomId || b.date !== todayStr) return false;
    const parts = b.timeSlot.split('-');
    if (parts.length < 2) return false;
    const [sH, sM] = parts[0].trim().split(':').map(Number);
    const [eH, eM] = parts[1].trim().split(':').map(Number);

    const slotStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      sH,
      sM,
      0
    );
    const slotEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      eH,
      eM,
      0
    );

    return (
      now.getTime() >= slotStart.getTime() && now.getTime() < slotEnd.getTime()
    );
  });

  if (isOccupiedRightNow) {
    return 'Occupied';
  }

  return fallbackStatus;
}
