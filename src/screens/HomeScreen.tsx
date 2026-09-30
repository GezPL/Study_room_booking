import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList, Room } from '../types';
import { MOCK_ROOMS } from '../utils/mockData';
import { useBookingStore } from '../store/useBookingStore';
import { RoomCard, FilterSection } from '../components';
import { getRoomCurrentStatus } from '../utils/dateHelpers';
import { Ionicons } from '@expo/vector-icons';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MainTabs'
>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { userSession, activeFilters, setFilters, resetFilters, activeBookings } =
    useBookingStore();

  const handleSelectRoom = useCallback(
    (room: Room) => {
      navigation.navigate('RoomDetail', { room });
    },
    [navigation]
  );

  const filteredRooms = useMemo(() => {
    return MOCK_ROOMS.filter((room) => {
      // 1. Building Filter
      if (activeFilters.building && room.building !== activeFilters.building) {
        return false;
      }

      // 2. Capacity Filter
      if (activeFilters.capacity !== null) {
        if (activeFilters.capacity === 2 && (room.capacity < 2 || room.capacity > 4)) {
          return false;
        }
        if (activeFilters.capacity === 5 && (room.capacity < 5 || room.capacity > 10)) {
          return false;
        }
        if (activeFilters.capacity === 11 && (room.capacity < 11 || room.capacity > 20)) {
          return false;
        }
      }

      // 3. Equipment Filter (Must have ALL selected equipment)
      if (activeFilters.equipment.length > 0) {
        const hasAllEquipment = activeFilters.equipment.every((eq) =>
          room.equipment.includes(eq)
        );
        if (!hasAllEquipment) return false;
      }

      // 4. Search Query Filter
      if (activeFilters.searchQuery && activeFilters.searchQuery.trim() !== '') {
        const query = activeFilters.searchQuery.toLowerCase().trim();
        const matchesName = room.name.toLowerCase().includes(query);
        const matchesBuilding = `building ${room.building.toLowerCase()}`.includes(query) ||
          room.building.toLowerCase() === query;
        const matchesEquipment = room.equipment.some((eq) =>
          eq.toLowerCase().includes(query)
        );
        if (!matchesName && !matchesBuilding && !matchesEquipment) {
          return false;
        }
      }

      return true;
    });
  }, [activeFilters]);

  const renderItem = useCallback(
    ({ item }: { item: Room }) => {
      const currentStatus = getRoomCurrentStatus(
        item.id,
        activeBookings,
        item.status
      );
      return (
        <RoomCard
          room={item}
          onPress={handleSelectRoom}
          currentStatus={currentStatus}
        />
      );
    },
    [handleSelectRoom, activeBookings]
  );

  const keyExtractor = useCallback((item: Room) => item.id, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top App Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.greetingText}>
            Xin chào, {userSession?.name.split(' ').slice(-1)[0] || 'Student'} 👋
          </Text>
          <Text style={styles.appTitle}>VKU Study Spaces</Text>
        </View>
        <View style={styles.studentIdBadge}>
          <Ionicons name="school" size={12} color="#2563EB" />
          <Text style={styles.studentIdText}>
            {userSession?.studentId || 'VKU'}
          </Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            placeholder="Search room name, building, equipment..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={activeFilters.searchQuery || ''}
            onChangeText={(text) => setFilters({ searchQuery: text })}
            clearButtonMode="while-editing"
          />
          {activeFilters.searchQuery ? (
            <TouchableOpacity
              onPress={() => setFilters({ searchQuery: '' })}
              style={styles.clearSearchBtn}
            >
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <FlatList
        data={filteredRooms}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        ListHeaderComponent={
          <View>
            <FilterSection
              filters={activeFilters}
              onFilterChange={setFilters}
              onReset={resetFilters}
            />
            <View style={styles.resultCountBar}>
              <Text style={styles.resultCountText}>
                Showing <Text style={styles.resultHighlight}>{filteredRooms.length}</Text> of{' '}
                {MOCK_ROOMS.length} rooms
              </Text>
              {filteredRooms.some(
                (r) =>
                  getRoomCurrentStatus(r.id, activeBookings, r.status) ===
                  'Available Now'
              ) && (
                <View style={styles.liveAvailableBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveAvailableText}>
                    {
                      filteredRooms.filter(
                        (r) =>
                          getRoomCurrentStatus(r.id, activeBookings, r.status) ===
                          'Available Now'
                      ).length
                    }{' '}
                    Available Now
                  </Text>
                </View>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={56} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No matching study rooms</Text>
            <Text style={styles.emptyDescription}>
              Try relaxing your filters or searching with a different keyword.
            </Text>
            <TouchableOpacity style={styles.resetAllButton} onPress={resetFilters}>
              <Ionicons name="refresh" size={16} color="#FFFFFF" />
              <Text style={styles.resetAllButtonText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        }
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  greetingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  studentIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  studentIdText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 12,
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  clearSearchBtn: {
    padding: 2,
  },
  listContainer: {
    paddingBottom: 24,
  },
  resultCountBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
  },
  resultCountText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  resultHighlight: {
    color: '#0F172A',
    fontWeight: '700',
  },
  liveAvailableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveAvailableText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#334155',
    marginTop: 14,
  },
  emptyDescription: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  resetAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginTop: 18,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  resetAllButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
});
