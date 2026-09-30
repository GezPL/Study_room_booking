import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Booking } from '../types';
import { TIME_SLOTS } from '../utils/mockData';
import { getNext7Days, DaySlot, isTimeSlotInPast } from '../utils/dateHelpers';
import { useBookingStore } from '../store/useBookingStore';
import {
  scheduleBookingReminder,
  cancelBookingReminder,
} from '../utils/notifications';
import { Ionicons } from '@expo/vector-icons';

interface RescheduleModalProps {
  visible: boolean;
  booking: Booking | null;
  onClose: () => void;
  onSuccess?: (updatedBooking: Booking) => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  visible,
  booking,
  onClose,
  onSuccess,
}) => {
  const { isSlotBooked, updateBooking } = useBookingStore();
  const daysList: DaySlot[] = useMemo(() => getNext7Days(), []);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!booking) return null;

  const effectiveDate = selectedDate ?? booking.date;
  const effectiveSlot = selectedSlot ?? booking.timeSlot;

  const handleClose = () => {
    setSelectedDate(null);
    setSelectedSlot(null);
    onClose();
  };

  const isCurrentSchedule =
    effectiveDate === booking.date && effectiveSlot === booking.timeSlot;

  // Check availability for all slots, excluding current booking
  const slotAvailability = TIME_SLOTS.map((slot) => {
    const booked = isSlotBooked(booking.room.id, effectiveDate, slot, booking.id);
    const isThisCurrentSlot =
      effectiveDate === booking.date && slot === booking.timeSlot;
    const isPast = isTimeSlotInPast(effectiveDate, slot);

    return {
      slot,
      isBooked: booked,
      isCurrent: isThisCurrentSlot,
      isPast,
    };
  });

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  const handleSlotSelect = (slot: string, isBooked: boolean, isPast: boolean) => {
    if (isPast) {
      Alert.alert(
        'Time Slot Passed',
        `This time slot (${slot}) has already ended or started for today. Please select an upcoming slot.`
      );
      return;
    }
    if (isBooked) {
      Alert.alert(
        'Slot Unavailable',
        `This time slot (${slot}) has already been reserved for ${booking.room.name}. Please select another time slot.`
      );
      return;
    }
    setSelectedSlot(slot);
  };

  const handleConfirmReschedule = async () => {
    if (isCurrentSchedule) {
      Alert.alert(
        'No Changes Detected',
        'Please select a different date or time slot to reschedule.'
      );
      return;
    }

    if (isSlotBooked(booking.room.id, effectiveDate, effectiveSlot, booking.id)) {
      Alert.alert(
        'Conflict Detected',
        'This slot has just been reserved. Please pick another slot.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Cancel previous scheduled notification if exists
      if (booking.notificationId) {
        await cancelBookingReminder(booking.notificationId);
      }

      // 2. Schedule new notification 15 minutes before the new slot
      const newNotificationId = await scheduleBookingReminder(
        booking.room.name,
        effectiveDate,
        effectiveSlot
      );

      // 3. Update store
      updateBooking(
        booking.id,
        effectiveDate,
        effectiveSlot,
        newNotificationId
      );

      const updatedBooking: Booking = {
        ...booking,
        date: effectiveDate,
        timeSlot: effectiveSlot,
        notificationId: newNotificationId,
      };

      Alert.alert(
        'Reschedule Confirmed!',
        `Your reservation for ${booking.room.name} has been updated to ${effectiveDate} (${effectiveSlot}).`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (onSuccess) onSuccess(updatedBooking);
              handleClose();
            },
          },
        ]
      );
    } catch {
      Alert.alert('Error', 'Unable to reschedule booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalCard}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons name="time" size={20} color="#2563EB" />
                </View>
                <View>
                  <Text style={styles.title}>Reschedule Booking</Text>
                  <Text style={styles.roomSubtitle}>
                    {booking.room.name} • Block {booking.room.building}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollBody}
            >
              {/* Current reservation preview */}
              <View style={styles.currentBox}>
                <Ionicons name="information-circle" size={16} color="#4F46E5" />
                <View style={styles.currentInfo}>
                  <Text style={styles.currentLabel}>Current reservation:</Text>
                  <Text style={styles.currentValue}>
                    {booking.date} • {booking.timeSlot}
                  </Text>
                </View>
              </View>

              {/* 1. Date Selector */}
              <Text style={styles.sectionTitle}>1. Select New Date</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dateRow}
              >
                {daysList.map((day) => {
                  const isSelected = effectiveDate === day.dateString;
                  const isOriginal = day.dateString === booking.date;

                  return (
                    <TouchableOpacity
                      key={day.dateString}
                      style={[
                        styles.dateChip,
                        isSelected && styles.dateChipActive,
                      ]}
                      onPress={() => handleDateSelect(day.dateString)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.dateChipDay,
                          isSelected && styles.textWhite,
                        ]}
                      >
                        {day.dayLabel}
                      </Text>
                      <Text
                        style={[
                          styles.dateChipNumber,
                          isSelected && styles.textWhite,
                        ]}
                      >
                        {day.dayNumber}
                      </Text>
                      <Text
                        style={[
                          styles.dateChipMonth,
                          isSelected && styles.textWhite,
                        ]}
                      >
                        {day.monthLabel}
                      </Text>
                      {isOriginal && (
                        <View
                          style={[
                            styles.originalDot,
                            isSelected && { backgroundColor: '#FFFFFF' },
                          ]}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* 2. Time Slot Grid */}
              <Text style={styles.sectionTitle}>2. Choose 2-Hour Time Slot</Text>
              <View style={styles.slotsGrid}>
                {slotAvailability.map(({ slot, isBooked, isCurrent, isPast }) => {
                  const isSelected = effectiveSlot === slot;
                  const isDisabled = (isBooked || isPast) && !isCurrent;

                  return (
                    <TouchableOpacity
                      key={slot}
                      style={[
                        styles.slotItem,
                        isDisabled && styles.slotItemDisabled,
                        isSelected && styles.slotItemActive,
                      ]}
                      onPress={() => handleSlotSelect(slot, isBooked, isPast)}
                      disabled={isDisabled}
                      activeOpacity={0.8}
                    >
                      <View style={styles.slotTop}>
                        <Ionicons
                          name="alarm-outline"
                          size={15}
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
                            styles.badge,
                            isCurrent
                              ? styles.badgeCurrent
                              : isPast
                              ? styles.badgeExpired
                              : isBooked
                              ? styles.badgeBooked
                              : isSelected
                              ? styles.badgeSelected
                              : styles.badgeAvailable,
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              isCurrent
                                ? styles.badgeTextCurrent
                                : isPast
                                ? styles.badgeTextExpired
                                : isBooked
                                ? styles.badgeTextBooked
                                : isSelected
                                ? styles.badgeTextWhite
                                : styles.badgeTextAvailable,
                            ]}
                          >
                            {isCurrent
                              ? 'Current'
                              : isPast
                              ? 'Expired'
                              : isBooked
                              ? 'Booked'
                              : isSelected
                              ? 'Selected'
                              : 'Available'}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.slotTime,
                          isDisabled && styles.slotTimeDisabled,
                          isSelected && styles.textWhite,
                        ]}
                      >
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (isCurrentSchedule || isSubmitting) &&
                    styles.saveButtonDisabled,
                ]}
                onPress={handleConfirmReschedule}
                disabled={isCurrentSchedule || isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-sharp" size={17} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  roomSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    padding: 20,
  },
  currentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  currentInfo: {
    flex: 1,
  },
  currentLabel: {
    fontSize: 11,
    color: '#6366F1',
    fontWeight: '600',
  },
  currentValue: {
    fontSize: 13,
    color: '#312E81',
    fontWeight: '700',
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
    marginTop: 4,
  },
  dateRow: {
    gap: 10,
    paddingBottom: 14,
  },
  dateChip: {
    width: 64,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
  },
  dateChipDay: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  dateChipNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginVertical: 2,
  },
  dateChipMonth: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  originalDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#6366F1',
    marginTop: 4,
  },
  textWhite: {
    color: '#FFFFFF',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  slotItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
  },
  slotItemDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    opacity: 0.7,
  },
  slotItemActive: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
  },
  slotTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeAvailable: {
    backgroundColor: '#ECFDF5',
  },
  badgeCurrent: {
    backgroundColor: '#EEF2FF',
  },
  badgeBooked: {
    backgroundColor: '#FEE2E2',
  },
  badgeExpired: {
    backgroundColor: '#F1F5F9',
  },
  badgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  badgeTextAvailable: {
    color: '#059669',
  },
  badgeTextCurrent: {
    color: '#4338CA',
  },
  badgeTextBooked: {
    color: '#DC2626',
  },
  badgeTextExpired: {
    color: '#64748B',
  },
  badgeTextWhite: {
    color: '#FFFFFF',
  },
  slotTime: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  slotTimeDisabled: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2563EB',
  },
  saveButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
