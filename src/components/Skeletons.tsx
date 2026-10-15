import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS } from '@/src/constants/theme';

export function Skeleton({ width, height, radius = RADIUS.sm }: { width: number | `${number}%` | string; height: number; radius?: number }) {
  return <View style={[styles.skeleton, { width: width as any, height, borderRadius: radius }]} />;
}

export function TrackCardSkeleton() {
  return (
    <View style={styles.trackCard}>
      <Skeleton width={56} height={56} />
      <View style={styles.trackInfo}>
        <Skeleton width="60%" height={14} />
        <Skeleton width="40%" height={12} />
      </View>
    </View>
  );
}

export function AlbumCardSkeleton({ size = 160 }: { size?: number }) {
  return (
    <View style={{ marginRight: SPACING.lg }}>
      <Skeleton width={size} height={size} radius={RADIUS.md} />
      <View style={{ marginTop: SPACING.sm, gap: 4 }}>
        <Skeleton width={size * 0.7} height={14} />
        <Skeleton width={size * 0.5} height={12} />
      </View>
    </View>
  );
}

export function TrackListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View style={{ gap: SPACING.sm }}>
      {Array.from({ length: count }).map((_, i) => (
        <TrackCardSkeleton key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.bgElevated,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  trackInfo: {
    flex: 1,
    gap: 4,
  },
});
