import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Building, EquipmentType, ActiveFilters } from '../types';
import { BUILDINGS, EQUIPMENT_OPTIONS } from '../utils/mockData';
import { Ionicons } from '@expo/vector-icons';

interface FilterSectionProps {
  filters: ActiveFilters;
  onFilterChange: (filters: Partial<ActiveFilters>) => void;
  onReset: () => void;
}

export const CAPACITY_PRESETS = [
  { label: 'All Seats', value: null },
  { label: '2–4', min: 2, max: 4 },
  { label: '5–10', min: 5, max: 10 },
  { label: '11–20', min: 11, max: 20 },
];

export const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const hasActiveFilters =
    filters.building !== null ||
    filters.capacity !== null ||
    filters.equipment.length > 0;

  const handleBuildingSelect = (b: Building | null) => {
    onFilterChange({ building: filters.building === b ? null : b });
  };

  const handleCapacitySelect = (capacityValue: number | null) => {
    onFilterChange({
      capacity: filters.capacity === capacityValue ? null : capacityValue,
    });
  };

  const handleEquipmentToggle = (item: EquipmentType) => {
    const exists = filters.equipment.includes(item);
    const updated = exists
      ? filters.equipment.filter((e) => e !== item)
      : [...filters.equipment, item];
    onFilterChange({ equipment: updated });
  };

  return (
    <View style={styles.container}>
      {/* Header bar with Reset action */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Ionicons name="filter" size={16} color="#2563EB" />
          <Text style={styles.sectionHeaderTitle}>Filters</Text>
          {hasActiveFilters && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                {(filters.building ? 1 : 0) +
                  (filters.capacity ? 1 : 0) +
                  filters.equipment.length}
              </Text>
            </View>
          )}
        </View>
        {hasActiveFilters && (
          <TouchableOpacity onPress={onReset} style={styles.resetButton}>
            <Ionicons name="refresh-outline" size={14} color="#EF4444" />
            <Text style={styles.resetText}>Reset All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Building Filter Chips */}
      <View style={styles.group}>
        <Text style={styles.groupLabel}>Building Block</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          <TouchableOpacity
            style={[
              styles.chip,
              filters.building === null && styles.chipActive,
            ]}
            onPress={() => handleBuildingSelect(null)}
          >
            <Text
              style={[
                styles.chipText,
                filters.building === null && styles.chipTextActive,
              ]}
            >
              All Buildings
            </Text>
          </TouchableOpacity>
          {BUILDINGS.map((building) => {
            const isSelected = filters.building === building;
            return (
              <TouchableOpacity
                key={building}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => handleBuildingSelect(building)}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextActive,
                  ]}
                >
                  Block {building}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Capacity Filter Chips */}
      <View style={styles.group}>
        <Text style={styles.groupLabel}>Room Capacity</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {CAPACITY_PRESETS.map((preset) => {
            const isSelected =
              preset.value === null
                ? filters.capacity === null
                : filters.capacity === preset.min;

            return (
              <TouchableOpacity
                key={preset.label}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() =>
                  handleCapacitySelect(preset.value === null ? null : preset.min!)
                }
              >
                <Ionicons
                  name="people-outline"
                  size={13}
                  color={isSelected ? '#FFFFFF' : '#64748B'}
                  style={styles.chipIcon}
                />
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextActive,
                  ]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Equipment Multi-select Chips */}
      <View style={styles.group}>
        <Text style={styles.groupLabel}>Required Equipment</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {EQUIPMENT_OPTIONS.map((item) => {
            const isSelected = filters.equipment.includes(item);
            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.chip,
                  styles.equipmentChip,
                  isSelected && styles.chipActive,
                ]}
                onPress={() => handleEquipmentToggle(item)}
              >
                <Ionicons
                  name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                  size={14}
                  color={isSelected ? '#FFFFFF' : '#64748B'}
                  style={styles.chipIcon}
                />
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  countBadge: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
  },
  resetText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  group: {
    marginTop: 8,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  equipmentChip: {
    paddingHorizontal: 10,
  },
  chipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
  },
  chipIcon: {
    marginRight: 4,
  },
  chipText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

