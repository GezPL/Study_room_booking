import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InteractiveQRCodeProps {
  passId: string;
  roomName: string;
  studentId: string;
}

export const InteractiveQRCode: React.FC<InteractiveQRCodeProps> = ({
  passId,
  roomName,
  studentId,
}) => {
  const [isScanned, setIsScanned] = useState(false);

  // Generates a deterministic visually authentic QR matrix pattern
  const matrix = React.useMemo(() => {
    const size = 15;
    const grid: boolean[][] = [];
    let seed = 0;
    for (let i = 0; i < passId.length; i++) {
      seed = (seed * 31 + passId.charCodeAt(i)) % 10007;
    }

    for (let r = 0; r < size; r++) {
      grid[r] = [];
      for (let c = 0; c < size; c++) {
        // Corner markers (Finder patterns)
        const isTopLeft = r < 4 && c < 4;
        const isTopRight = r < 4 && c >= size - 4;
        const isBottomLeft = r >= size - 4 && c < 4;

        if (isTopLeft || isTopRight || isBottomLeft) {
          const localR = isBottomLeft ? r - (size - 4) : r;
          const localC = isTopRight ? c - (size - 4) : c;
          const isBorder =
            localR === 0 || localR === 3 || localC === 0 || localC === 3;
          const isCenter = localR === 1 && localC === 1;
          grid[r][c] = isBorder || isCenter;
        } else {
          seed = (seed * 1103515245 + 12345) % 2147483647;
          grid[r][c] = seed % 2 === 0;
        }
      }
    }
    return grid;
  }, [passId]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => setIsScanned((prev) => !prev)}
      style={styles.container}
    >
      <View style={styles.qrCard}>
        {/* QR Matrix Render */}
        <View style={styles.matrixContainer}>
          {matrix.map((row, rIdx) => (
            <View key={`row-${rIdx}`} style={styles.matrixRow}>
              {row.map((cell, cIdx) => (
                <View
                  key={`cell-${rIdx}-${cIdx}`}
                  style={[
                    styles.matrixCell,
                    cell ? styles.darkCell : styles.lightCell,
                  ]}
                />
              ))}
            </View>
          ))}

          {/* Interactive center badge */}
          <View style={styles.centerLogo}>
            <Text style={styles.centerLogoText}>VKU</Text>
          </View>
        </View>

        <View style={styles.passInfoContainer}>
          <Text style={styles.passLabel}>PASS CODE</Text>
          <Text style={styles.passCode}>{passId}</Text>
          <View style={styles.interactiveHint}>
            <Ionicons
              name={isScanned ? 'checkmark-circle' : 'finger-print-outline'}
              size={14}
              color={isScanned ? '#10B981' : '#6366F1'}
            />
            <Text
              style={[
                styles.interactiveHintText,
                isScanned && { color: '#10B981' },
              ]}
            >
              {isScanned ? 'Verified for Entry' : 'Tap QR to simulate check-in scan'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 14,
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  matrixContainer: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matrixRow: {
    flexDirection: 'row',
  },
  matrixCell: {
    width: 10,
    height: 10,
  },
  darkCell: {
    backgroundColor: '#0F172A',
  },
  lightCell: {
    backgroundColor: '#FFFFFF',
  },
  centerLogo: {
    position: 'absolute',
    backgroundColor: '#2563EB',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  centerLogoText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  passInfoContainer: {
    marginTop: 14,
    alignItems: 'center',
  },
  passLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 1,
  },
  passCode: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1.5,
    marginTop: 2,
  },
  interactiveHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interactiveHintText: {
    fontSize: 11,
    color: '#6366F1',
    fontWeight: '600',
  },
});
