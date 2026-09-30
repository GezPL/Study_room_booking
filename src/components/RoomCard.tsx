import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Room } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface RoomCardProps {
  room: Room;
  onPress: (room: Room) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onPress }) => {
  const isAvailable = room.status === 'Available Now';

  const getEquipmentIcon = (name: string): keyof typeof Ionicons.glyphMap => {
    switch (name) {
      case 'Projector':
        return 'videocam-outline';
      case 'Whiteboard':
        return 'easel-outline';
      case 'High-spec PC':
        return 'desktop-outline';
      case 'AC':
        return 'snow-outline';
      default:
        return 'hardware-chip-outline';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() => onPress(room)}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: room.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Real-time Status Badge */}
        <View
          style={[
            styles.statusBadge,
            isAvailable ? styles.availableBadge : styles.occupiedBadge,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isAvailable ? '#10B981' : '#EF4444' },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: isAvailable ? '#065F46' : '#991B1B' },
            ]}
          >
            {room.status}
          </Text>
        </View>

        {/* Capacity Badge */}
        <View style={styles.capacityBadge}>
          <Ionicons name="people" size={13} color="#FFFFFF" />
          <Text style={styles.capacityText}>{room.capacity} seats</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {room.name}
          </Text>
          <Ionicons name="chevron-forward-circle" size={22} color="#2563EB" />
        </View>

        {/* Building / Floor info */}
        <View style={styles.locationRow}>
          <Ionicons name="business" size={14} color="#64748B" />
          <Text style={styles.locationText}>
            Building {room.building} • Floor {room.floor}
          </Text>
        </View>

        {/* Equipment Badges */}
        <View style={styles.equipmentRow}>
          {room.equipment.map((item) => (
            <View key={item} style={styles.equipmentTag}>
              <Ionicons
                name={getEquipmentIcon(item)}
                size={12}
                color="#475569"
                style={styles.equipIcon}
              />
              <Text style={styles.equipmentText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
    }),
  },
  imageWrapper: {
    position: 'relative',
    height: 160,
    width: '100%',
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 6,
  },
  availableBadge: {
    backgroundColor: 'rgba(236, 253, 245, 0.95)',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  occupiedBadge: {
    backgroundColor: 'rgba(254, 242, 242, 0.95)',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  capacityBadge: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  capacityText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  body: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  equipmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  equipmentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  equipIcon: {
    marginRight: 4,
  },
  equipmentText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
});

// React.memo optimization to ensure 60fps scrolling
export default React.memo(RoomCard);

