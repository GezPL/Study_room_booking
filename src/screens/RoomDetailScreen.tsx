import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Booking } from '../types';
import { TIME_SLOTS } from '../utils/mockData';
import {
  getNext7Days,
  DaySlot,
  isTimeSlotInPast,
  isBookingPast,
} from '../utils/dateHelpers';
import { useBookingStore } from '../store/useBookingStore';
import { scheduleBookingReminder } from '../utils/notifications';
import { BookingPassModal } from '../components';
import { Ionicons } from '@expo/vector-icons';

type RoomDetailRouteProp = RouteProp<RootStackParamList, 'RoomDetail'>;
type RoomDetailNavProp = NativeStackNavigationProp<RootStackParamList>;

export default function RoomDetailScreen() {
  const route = useRoute<RoomDetailRouteProp>();
  const navigation = useNavigation<RoomDetailNavProp>();
  const { room } = route.params;

  const { isSlotBooked, addBooking, activeBookings } = useBookingStore();

  const daysList: DaySlot[] = useMemo(() => getNext7Days(), []);
  const [selectedDate, setSelectedDate] = useState<string>(daysList[0].dateString);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [showPassModal, setShowPassModal] = useState(false);

  // Check conflicts and past time for all slots for the selected room and date
  const slotAvailability = useMemo(() => {
    return TIME_SLOTS.map((slot) => {
      const booked = isSlotBooked(room.id, selectedDate, slot);
      const past = isTimeSlotInPast(selectedDate, slot);
      return {
        slot,
        isBooked: booked,
        isPast: past,
      };
    });
  }, [room.id, selectedDate, isSlotBooked]);

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedSlot(null); // Reset selected slot when changing date
  };

  const handleSlotSelect = (slot: string, isBooked: boolean, isPast: boolean) => {
    if (isPast) {
      Alert.alert(
        'Time Slot Passed',
        `The time slot (${slot}) has already ended or started for today. Please select an upcoming slot or choose another date.`
      );
      return;
    }
    if (isBooked) {
      Alert.alert(
        'Slot Unavailable',
        `This time slot (${slot}) has already been reserved for ${room.name} on this date. Please choose another slot.`
      );
      return;
    }
    setSelectedSlot(slot);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      Alert.alert('Selection Required', 'Please choose an available time slot.');
      return;
    }

    // Quota check: maximum 3 active upcoming reservations per student
    const activeUpcomingCount = activeBookings.filter(
      (b) => !isBookingPast(b.date, b.timeSlot)
    ).length;

    if (activeUpcomingCount >= 3) {
      Alert.alert(
        'Reservation Limit Reached (Max 3)',
        'VKU study room policy allows each student to hold up to 3 active bookings at the same time. Please complete or cancel an existing booking before reserving another slot.'
      );
      return;
    }

    if (isSlotBooked(room.id, selectedDate, selectedSlot)) {
      Alert.alert('Conflict Detected', 'This slot was just reserved. Please select another slot.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Schedule local push notification 15 minutes before the slot
      const notificationId = await scheduleBookingReminder(
        room.name,
        selectedDate,
        selectedSlot
      );

      // 2. Add booking to persistent Zustand store
      const booking = addBooking(
        room,
        selectedDate,
        selectedSlot,
        notificationId
      );

      setCreatedBooking(booking);
      setSelectedSlot(null);
      setShowPassModal(true);
    } catch {
      Alert.alert('Error', 'Unable to complete booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClosePassModal = () => {
    setShowPassModal(false);
  };

  const handleNavigateToMyBookings = () => {
    setShowPassModal(false);
    navigation.navigate('MainTabs');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Room Image Header */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: room.image_url }} style={styles.image} />
          <View style={styles.imageOverlay} />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.floatingStatus}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    room.status === 'Available Now' ? '#10B981' : '#EF4444',
                },
              ]}
            />
            <Text style={styles.floatingStatusText}>{room.status}</Text>
          </View>
        </View>

        {/* Room Header Info */}
        <View style={styles.roomHeader}>
          <Text style={styles.roomTitle}>{room.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={15} color="#2563EB" />
            <Text style={styles.locationText}>
              Building {room.building}, Floor {room.floor} • VKU Da Nang Campus
            </Text>
          </View>

          {/* Quick Specs */}
          <View style={styles.specsRow}>
            <View style={styles.specCard}>
              <Ionicons name="people" size={18} color="#2563EB" />
              <Text style={styles.specValue}>{room.capacity} seats</Text>
              <Text style={styles.specLabel}>Capacity</Text>
            </View>
            <View style={styles.specCard}>
              <Ionicons name="hardware-chip" size={18} color="#2563EB" />
              <Text style={styles.specValue}>{room.equipment.length} items</Text>
              <Text style={styles.specLabel}>Equipment</Text>
            </View>
            <View style={styles.specCard}>
              <Ionicons name="business" size={18} color="#2563EB" />
              <Text style={styles.specValue}>Block {room.building}</Text>
              <Text style={styles.specLabel}>Building</Text>
            </View>
          </View>

          {/* Equipment Pills */}
          <View style={styles.equipmentSection}>
            <Text style={styles.sectionSubtitle}>Included Facilities</Text>
            <View style={styles.equipmentWrap}>
              {room.equipment.map((eq) => (
                <View key={eq} style={styles.eqPill}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                  <Text style={styles.eqPillText}>{eq}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Date Selector (7-day horizontal scroll) */}
        <View style={styles.bookingEngineSection}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="calendar" size={18} color="#2563EB" />
            <Text style={styles.sectionHeaderTitle}>1. Select Date (Next 7 Days)</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateSelectorScroll}
          >
            {daysList.map((day) => {
              const isSelected = selectedDate === day.dateString;
              return (
                <TouchableOpacity
                  key={day.dateString}
                  style={[
                    styles.dateCard,
                    isSelected && styles.dateCardActive,
                  ]}
                  onPress={() => handleDateSelect(day.dateString)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dayLabel,
                      isSelected && styles.dayTextActive,
                    ]}
                  >
                    {day.dayLabel}
                  </Text>
                  <Text
                    style={[
                      styles.dayNumber,
                      isSelected && styles.dayTextActive,
                    ]}
                  >
                    {day.dayNumber}
                  </Text>
                  <Text
                    style={[
                      styles.monthLabel,
                      isSelected && styles.dayTextActive,
                    ]}
                  >
                    {day.monthLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Time Slot Grid (Conflict Engine) */}
          <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
            <Ionicons name="time" size={18} color="#2563EB" />
            <Text style={styles.sectionHeaderTitle}>2. Choose 2-Hour Time Slot</Text>
          </View>
          <Text style={styles.sectionHint}>
            Red/disabled slots are already booked by other students for this date.
          </Text>

          <View style={styles.timeSlotGrid}>
            {slotAvailability.map(({ slot, isBooked, isPast }) => {
              const isSelected = selectedSlot === slot;
              const isDisabled = isBooked || isPast;

              return (
                <TouchableOpacity
                  key={slot}
                  style={[
                    styles.slotCard,
                    isDisabled && styles.slotCardDisabled,
                    isSelected && styles.slotCardSelected,
                  ]}
                  onPress={() => handleSlotSelect(slot, isBooked, isPast)}
                  disabled={isDisabled}
                  activeOpacity={0.8}
                >
                  <View style={styles.slotHeader}>
                    <Ionicons
                      name="alarm-outline"
                      size={16}
                      color={
                        isSelected
                          ? '#FFFFFF'
                          : isDisabled
                          ? '#94A3B8'
                          : '#2563EB'
                      }
                    />
                    <View
                      style={[
                        styles.slotBadge,
                        isSelected
                          ? styles.slotBadgeSelected
                          : isPast
                          ? styles.slotBadgeExpired
                          : isBooked
                          ? styles.slotBadgeDisabled
                          : styles.slotBadgeAvailable,
                      ]}
                    >
                      <Text
                        style={[
                          styles.slotBadgeText,
                          isSelected
                            ? styles.slotBadgeTextSelected
                            : isPast
                            ? styles.slotBadgeTextExpired
                            : isBooked
                            ? styles.slotBadgeTextDisabled
                            : styles.slotBadgeTextAvailable,
                        ]}
                      >
                        {isPast ? 'Expired' : isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.slotTimeText,
                      isDisabled && styles.slotTimeTextDisabled,
                      isSelected && styles.slotTimeTextSelected,
                    ]}
                  >
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Booking Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomLabel}>Selected Reservation</Text>
          <Text style={styles.bottomSelectedDate}>
            {selectedDate} • {selectedSlot || 'Select a slot'}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.bookConfirmBtn,
            (!selectedSlot || isSubmitting) && styles.bookConfirmBtnDisabled,
          ]}
          onPress={handleConfirmBooking}
          disabled={!selectedSlot || isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkbox-outline" size={18} color="#FFFFFF" />
              <Text style={styles.bookConfirmText}>Confirm Booking</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Booking Pass Modal */}
      <BookingPassModal
        visible={showPassModal}
        booking={createdBooking}
        onClose={handleClosePassModal}
        onViewMyBookings={handleNavigateToMyBookings}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  imageContainer: {
    position: 'relative',
    height: 250,
    width: '100%',
    backgroundColor: '#CBD5E1',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 16 : 24,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  floatingStatus: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  floatingStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  roomHeader: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  roomTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  locationText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 10,
  },
  specCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  specValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 4,
  },
  specLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  equipmentSection: {
    marginTop: 16,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  equipmentWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  eqPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  eqPillText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  bookingEngineSection: {
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionHint: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  dateSelectorScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  dateCard: {
    width: 68,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCardActive: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginVertical: 2,
  },
  monthLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  slotCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
  },
  slotCardDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    opacity: 0.7,
  },
  slotCardSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  slotBadgeAvailable: {
    backgroundColor: '#ECFDF5',
  },
  slotBadgeDisabled: {
    backgroundColor: '#FEE2E2',
  },
  slotBadgeExpired: {
    backgroundColor: '#F1F5F9',
  },
  slotBadgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  slotBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  slotBadgeTextAvailable: {
    color: '#059669',
  },
  slotBadgeTextDisabled: {
    color: '#DC2626',
  },
  slotBadgeTextExpired: {
    color: '#64748B',
  },
  slotBadgeTextSelected: {
    color: '#FFFFFF',
  },
  slotTimeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  slotTimeTextDisabled: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  slotTimeTextSelected: {
    color: '#FFFFFF',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 10,
  },
  bottomInfo: {
    flex: 1,
    marginRight: 12,
  },
  bottomLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  bottomSelectedDate: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  bookConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  bookConfirmBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  bookConfirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
