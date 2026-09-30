import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useBookingStore } from '../store/useBookingStore';
import { cancelBookingReminder } from '../utils/notifications';
import { Ionicons } from '@expo/vector-icons';
import { Booking, MainTabParamList } from '../types';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type MyBookingsNavProp = BottomTabNavigationProp<MainTabParamList, 'MyBookings'>;

export default function MyBookingsScreen() {
  const navigation = useNavigation<MyBookingsNavProp>();
  const { activeBookings, cancelBooking, userSession, clearAllBookings } =
    useBookingStore();

  const handleCancel = (booking: Booking) => {
    Alert.alert(
      'Cancel Reservation',
      `Are you sure you want to cancel your booking for ${booking.room.name} on ${booking.date} (${booking.timeSlot})?`,
      [
        { text: 'Keep Reservation', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            if (booking.notificationId) {
              await cancelBookingReminder(booking.notificationId);
            }
            cancelBooking(booking.id);
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    if (activeBookings.length === 0) return;
    Alert.alert(
      'Clear All Reservations',
      'This will cancel all your active bookings. Are you sure?',
      [
        { text: 'Keep All', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            for (const b of activeBookings) {
              if (b.notificationId) {
                await cancelBookingReminder(b.notificationId);
              }
            }
            clearAllBookings();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>My Reservations</Text>
          <Text style={styles.subtitle}>
            {userSession?.name} • {userSession?.studentId}
          </Text>
        </View>
        {activeBookings.length > 0 && (
          <TouchableOpacity
            style={styles.clearAllBtn}
            onPress={handleClearAll}
          >
            <Text style={styles.clearAllBtnText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {activeBookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="calendar-outline" size={48} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>No active reservations</Text>
          <Text style={styles.emptySubtitle}>
            You have not reserved any study rooms yet. Browse available spaces across VKU blocks and book your spot!
          </Text>
          <TouchableOpacity
            style={styles.browseRoomsBtn}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.85}
          >
            <Ionicons name="search" size={16} color="#FFFFFF" />
            <Text style={styles.browseRoomsBtnText}>Browse Available Rooms</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={activeBookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTopRow}>
                <Image
                  source={{ uri: item.room.image_url }}
                  style={styles.thumbnail}
                />
                <View style={styles.roomInfo}>
                  <View style={styles.badgeRow}>
                    <View style={styles.confirmedPill}>
                      <View style={styles.greenDot} />
                      <Text style={styles.confirmedText}>Confirmed</Text>
                    </View>
                    <Text style={styles.passCodeTag}>
                      #{item.id.slice(-5).toUpperCase()}
                    </Text>
                  </View>

                  <Text style={styles.roomName}>{item.room.name}</Text>
                  <Text style={styles.roomLocation}>
                    Building {item.room.building} • Floor {item.room.floor}
                  </Text>
                </View>
              </View>

              <View style={styles.scheduleBox}>
                <View style={styles.scheduleItem}>
                  <Ionicons name="calendar" size={15} color="#2563EB" />
                  <Text style={styles.scheduleText}>{item.date}</Text>
                </View>
                <View style={styles.scheduleDivider} />
                <View style={styles.scheduleItem}>
                  <Ionicons name="time" size={15} color="#2563EB" />
                  <Text style={styles.scheduleTextBold}>{item.timeSlot}</Text>
                </View>
              </View>

              {item.notificationId && (
                <View style={styles.reminderRow}>
                  <Ionicons name="notifications-outline" size={13} color="#059669" />
                  <Text style={styles.reminderText}>
                    Reminder alert set 15m prior
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleCancel(item)}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={14} color="#EF4444" />
                <Text style={styles.cancelBtnText}>Cancel Reservation</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  clearAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  clearAllBtnText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    gap: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 18,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  browseRoomsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 24,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  browseRoomsBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardTopRow: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  roomInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  confirmedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  confirmedText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  passCodeTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  roomLocation: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  scheduleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  scheduleTextBold: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
  },
  scheduleDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 12,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  reminderText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '500',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    paddingVertical: 9,
    borderRadius: 10,
    marginTop: 12,
  },
  cancelBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
});
