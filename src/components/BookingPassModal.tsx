import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Booking } from '../types';
import { InteractiveQRCode } from './InteractiveQRCode';
import { Ionicons } from '@expo/vector-icons';
import { useBookingStore } from '../store/useBookingStore';

interface BookingPassModalProps {
  visible: boolean;
  booking: Booking | null;
  onClose: () => void;
  onViewMyBookings?: () => void;
  onEditTime?: (booking: Booking) => void;
  mode?: 'new' | 'view';
}

export const BookingPassModal: React.FC<BookingPassModalProps> = ({
  visible,
  booking,
  onClose,
  onViewMyBookings,
  onEditTime,
  mode = 'new',
}) => {
  const userSession = useBookingStore((state) => state.userSession);

  if (!booking) return null;

  const isViewMode = mode === 'view';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.passTicket}>
            {/* Header */}
            <View style={styles.ticketHeader}>
              <View
                style={[
                  styles.iconBubble,
                  isViewMode ? styles.viewIconBubble : styles.successIconBubble,
                ]}
              >
                <Ionicons
                  name={isViewMode ? 'qr-code' : 'checkmark-circle'}
                  size={32}
                  color={isViewMode ? '#2563EB' : '#10B981'}
                />
              </View>
              <Text style={styles.modalTitle}>
                {isViewMode ? 'Study Room Pass' : 'Booking Confirmed!'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {isViewMode
                  ? 'Present QR code at entrance check-in'
                  : 'Study Room Entry Pass'}
              </Text>
            </View>

            {/* Interactive QR Code Component */}
            <InteractiveQRCode
              passId={booking.id.toUpperCase()}
              roomName={booking.room.name}
              studentId={userSession?.studentId || 'VKU'}
            />

            {/* Room and Slot Details */}
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Study Room</Text>
                <Text style={styles.detailValueBold}>{booking.room.name}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>
                  Building {booking.room.building}, Floor {booking.room.floor}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValueBold}>{booking.date}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Time Slot</Text>
                <Text style={styles.detailValueHighlight}>{booking.timeSlot}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Reserved By</Text>
                <Text style={styles.detailValue}>
                  {userSession?.name} ({userSession?.studentId})
                </Text>
              </View>
            </View>

            {/* Notification reminder banner */}
            <View style={styles.notificationBanner}>
              <Ionicons name="notifications" size={16} color="#2563EB" />
              <Text style={styles.notificationText}>
                Reminder scheduled 15 mins before start time
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
              {isViewMode ? (
                <>
                  {onEditTime && (
                    <TouchableOpacity
                      style={styles.rescheduleBtn}
                      onPress={() => onEditTime(booking)}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="calendar-outline" size={16} color="#2563EB" />
                      <Text style={styles.rescheduleBtnText}>Change Time</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.doneBtn}
                    onPress={onClose}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.doneText}>Close</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {onViewMyBookings && (
                    <TouchableOpacity
                      style={styles.viewBookingsBtn}
                      onPress={onViewMyBookings}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="calendar-outline" size={16} color="#2563EB" />
                      <Text style={styles.viewBookingsText}>My Bookings</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.doneBtn}
                    onPress={onClose}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.doneText}>Done</Text>
                  </TouchableOpacity>
                </>
              )}
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
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
  },
  passTicket: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  ticketHeader: {
    alignItems: 'center',
  },
  iconBubble: {
    marginBottom: 6,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconBubble: {
    backgroundColor: '#ECFDF5',
  },
  viewIconBubble: {
    backgroundColor: '#EFF6FF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  detailsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
  },
  detailValueBold: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  detailValueHighlight: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  notificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  notificationText: {
    fontSize: 11,
    color: '#1E40AF',
    fontWeight: '600',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  rescheduleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  rescheduleBtnText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '700',
  },
  viewBookingsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  viewBookingsText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '700',
  },
  doneBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2563EB',
  },
  doneText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
