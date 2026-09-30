import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import {
  getPermissionsAsync,
  requestPermissionsAsync,
} from 'expo-notifications/build/NotificationPermissions';
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
import { Platform } from 'react-native';

// Set default notification handler
setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    const { status: existingStatus } = await getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await setNotificationChannelAsync('room-bookings', {
        name: 'Room Booking Reminders',
        importance: AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563EB',
      });
    }

    return true;
  } catch (error) {
    console.warn('Notifications permission/channel warning:', error);
    return false;
  }
}

/**
 * Calculates notification trigger date 15 minutes before slot start
 * @param dateStr Format: YYYY-MM-DD
 * @param timeSlot Format: e.g. "07:30 - 09:30"
 */
export function calculateNotificationTriggerTime(
  dateStr: string,
  timeSlot: string
): Date {
  const startTime = timeSlot.split('-')[0].trim(); // e.g. "07:30"
  const [hours, minutes] = startTime.split(':').map(Number);

  const [year, month, day] = dateStr.split('-').map(Number);
  const slotDate = new Date(year, month - 1, day, hours, minutes, 0, 0);

  // 15 minutes before
  return new Date(slotDate.getTime() - 15 * 60 * 1000);
}

/**
 * Schedules a local reminder notification 15 minutes prior to session
 */
export async function scheduleBookingReminder(
  roomName: string,
  dateStr: string,
  timeSlot: string
): Promise<string | undefined> {
  try {
    const triggerDate = calculateNotificationTriggerTime(dateStr, timeSlot);
    const now = new Date();

    // If trigger date has already passed, schedule 5 seconds from now for immediate feedback/demo
    const effectiveTrigger =
      triggerDate.getTime() > now.getTime()
        ? triggerDate
        : new Date(now.getTime() + 5000);

    const identifier = await scheduleNotificationAsync({
      content: {
        title: '🔔 VKU Study Room Reminder',
        body: `Your booking for ${roomName} starts in 15 minutes (${timeSlot}).`,
        data: { roomName, date: dateStr, timeSlot },
        sound: true,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: effectiveTrigger,
      },
    });

    return identifier;
  } catch (error) {
    console.warn('Failed to schedule notification:', error);
    return undefined;
  }
}

/**
 * Cancels a scheduled local notification
 */
export async function cancelBookingReminder(notificationId: string): Promise<void> {
  try {
    await cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.warn('Failed to cancel scheduled notification:', error);
  }
}
