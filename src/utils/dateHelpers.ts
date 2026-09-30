export interface DaySlot {
  dateString: string; // YYYY-MM-DD
  dayLabel: string; // 'Today', 'Tomorrow', 'Wed', etc.
  dayNumber: string; // '29', '30', etc.
  monthLabel: string; // 'Sep', 'Oct', etc.
  isToday: boolean;
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

