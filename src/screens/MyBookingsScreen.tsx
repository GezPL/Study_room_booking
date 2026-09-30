import React, { useState } from 'react';
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
import { isBookingPast } from '../utils/dateHelpers';
import { Ionicons } from '@expo/vector-icons';
import { Booking, RootStackParamList } from '../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BookingPassModal, RescheduleModal } from '../components';

type MyBookingsNavProp = NativeStackNavigationProp<RootStackParamList>;

export default function MyBookingsScreen() {
  const navigation = useNavigation<MyBookingsNavProp>();
  const { activeBookings, cancelBooking, userSession, clearAllBookings } =
    useBookingStore();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  const [viewingPassBooking, setViewingPassBooking] = useState<Booking | null>(
    null
  );
  const [showPassModal, setShowPassModal] = useState(false);

  const [
    reschedulingBooking,
    setReschedulingBooking,
  ] = useState<Booking | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  // Split bookings into upcoming vs past history
  const upcomingBookings = activeBookings.filter(
    (b) => !isBookingPast(b.date, b.timeSlot)
  );

  const historyBookings = activeBookings.filter((b) =>
    isBookingPast(b.date, b.timeSlot)
  );

  const displayBookings =
    activeTab === 'upcoming' ? upcomingBookings : historyBookings;

  const handleOpenPass = (booking: Booking) => {
    setViewingPassBooking(booking);
    setShowPassModal(true);
  };

  const handleOpenReschedule = (booking: Booking) => {
    setShowPassModal(false);
    setReschedulingBooking(booking);
    setShowRescheduleModal(true);
  };

  const handleRescheduleSuccess = (updatedBooking: Booking) => {
    setViewingPassBooking(updatedBooking);
  };

  const handleBookAgain = (booking: Booking) => {
    navigation.navigate('RoomDetail', { room: booking.room });
  };

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

      {/* Segmented Control Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'upcoming' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('upcoming')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="calendar"
            size={15}
            color={activeTab === 'upcoming' ? '#2563EB' : '#64748B'}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'upcoming' && styles.tabButtonTextActive,
            ]}
          >
            Upcoming ({upcomingBookings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'history' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('history')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="time"
            size={15}
            color={activeTab === 'history' ? '#2563EB' : '#64748B'}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'history' && styles.tabButtonTextActive,
            ]}
          >
            History ({historyBookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      {displayBookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons
              name={
                activeTab === 'upcoming'
                  ? 'calendar-outline'
                  : 'file-tray-outline'
              }
              size={48}
              color="#94A3B8"
            />
          </View>
          <Text style={styles.emptyTitle}>
            {activeTab === 'upcoming'
              ? 'No upcoming reservations'
              : 'No booking history yet'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'upcoming'
              ? 'You have no scheduled sessions coming up. Browse available spaces across VKU blocks and book your spot!'
              : 'Completed study room sessions will automatically be recorded here after your reservation time ends.'}
          </Text>
          {activeTab === 'upcoming' && (
            <TouchableOpacity
              style={styles.browseRoomsBtn}
              onPress={() => navigation.navigate('MainTabs')}
              activeOpacity={0.85}
            >
              <Ionicons name="search" size={16} color="#FFFFFF" />
              <Text style={styles.browseRoomsBtnText}>
                Browse Available Rooms
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={displayBookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isCompleted = isBookingPast(item.date, item.timeSlot);

            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.92}
                onPress={() => handleOpenPass(item)}
              >
                {/* Card Header & Room Info */}
                <View style={styles.cardTopRow}>
                  <Image
                    source={{ uri: item.room.image_url }}
                    style={styles.thumbnail}
                  />
                  <View style={styles.roomInfo}>
                    <View style={styles.badgeRow}>
                      {isCompleted ? (
                        <View style={styles.completedPill}>
                          <View style={styles.grayDot} />
                          <Text style={styles.completedText}>Completed</Text>
                        </View>
                      ) : (
                        <View style={styles.confirmedPill}>
                          <View style={styles.greenDot} />
                          <Text style={styles.confirmedText}>Confirmed</Text>
                        </View>
                      )}
                      <View style={styles.qrBadge}>
                        <Ionicons name="qr-code" size={11} color="#2563EB" />
                        <Text style={styles.qrBadgeText}>
                          Pass #{item.id.slice(-5).toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.roomName}>{item.room.name}</Text>
                    <Text style={styles.roomLocation}>
                      Building {item.room.building} • Floor {item.room.floor}
                    </Text>
                  </View>
                </View>

                {/* Time Schedule Banner */}
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

                {/* Notification indicator for active bookings */}
                {!isCompleted && item.notificationId && (
                  <View style={styles.reminderRow}>
                    <Ionicons
                      name="notifications-outline"
                      size={13}
                      color="#059669"
                    />
                    <Text style={styles.reminderText}>
                      Reminder alert set 15m prior
                    </Text>
                  </View>
                )}

                {/* Action Buttons Row */}
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={styles.viewPassBtn}
                    onPress={() => handleOpenPass(item)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="qr-code-outline"
                      size={15}
                      color="#2563EB"
                    />
                    <Text style={styles.viewPassText}>View QR Pass</Text>
                  </TouchableOpacity>

                  {isCompleted ? (
                    <TouchableOpacity
                      style={styles.bookAgainBtn}
                      onPress={() => handleBookAgain(item)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="repeat-outline"
                        size={15}
                        color="#059669"
                      />
                      <Text style={styles.bookAgainText}>Book Again</Text>
                    </TouchableOpacity>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={styles.rescheduleBtn}
                        onPress={() => handleOpenReschedule(item)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={15}
                          color="#4F46E5"
                        />
                        <Text style={styles.rescheduleText}>Change Time</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => handleCancel(item)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={15}
                          color="#EF4444"
                        />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Booking Pass Modal */}
      <BookingPassModal
        visible={showPassModal}
        booking={viewingPassBooking}
        mode="view"
        onClose={() => setShowPassModal(false)}
        onEditTime={
          viewingPassBooking &&
          !isBookingPast(viewingPassBooking.date, viewingPassBooking.timeSlot)
            ? handleOpenReschedule
            : undefined
        }
      />

      {/* Reschedule Modal */}
      <RescheduleModal
        visible={showRescheduleModal}
        booking={reschedulingBooking}
        onClose={() => setShowRescheduleModal(false)}
        onSuccess={handleRescheduleSuccess}
      />
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
  tabButtonActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#2563EB',
    fontWeight: '700',
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
  completedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  grayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
  },
  completedText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  qrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  qrBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
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
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  viewPassBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 9,
    borderRadius: 10,
  },
  viewPassText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  rescheduleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingVertical: 9,
    borderRadius: 10,
  },
  rescheduleText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '700',
  },
  bookAgainBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 9,
    borderRadius: 10,
  },
  bookAgainText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
});
