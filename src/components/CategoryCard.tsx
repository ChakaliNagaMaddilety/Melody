import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/src/constants/theme';
import { Music, Guitar, Mic, Radio, Music2, Music3, Heart, Music4 } from 'lucide-react-native';

const ICONS: Record<string, React.ElementType> = {
  Music,
  Guitar,
  Mic,
  Radio,
  Music2,
  Music3,
  Heart,
  Music4,
};

const GRADIENT_PAIRS: Record<string, [string, string]> = {
  pop: ['#FF6B6B', '#FF8E53'],
  rock: ['#8B5CF6', '#6366F1'],
  hiphop: ['#EC4899', '#F43F5E'],
  electronic: ['#06B6D4', '#3B82F6'],
  jazz: ['#F59E0B', '#EF4444'],
  classical: ['#10B981', '#06B6D4'],
  rnb: ['#8B5CF6', '#EC4899'],
  country: ['#F59E0B', '#D97706'],
};

interface CategoryCardProps {
  label: string;
  icon: string;
  id: string;
  onPress: () => void;
}

export function CategoryCard({ label, icon, id, onPress }: CategoryCardProps) {
  const IconComponent = ICONS[icon] || Music;
  const colors = GRADIENT_PAIRS[id] || GRADIENT_PAIRS.pop;

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Browse ${label} music`}
    >
      <View style={[styles.gradient, { backgroundColor: colors[0] }]}>
        <View style={[styles.gradientOverlay, { backgroundColor: colors[1] }]} />
        <IconComponent size={24} color={COLORS.textPrimary} strokeWidth={2} />
        <Text style={styles.label}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  pressed: {
    opacity: 0.85,
  },
  gradient: {
    width: 160,
    height: 80,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
    borderRadius: RADIUS.lg,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.caption,
    fontFamily: 'Inter-SemiBold',
  },
});
