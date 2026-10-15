import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@/src/constants/theme';
import { RotateCcw } from 'lucide-react-native';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onAction && (
        <Pressable style={styles.button} onPress={onAction} accessibilityRole="button">
          <RotateCcw size={16} color={COLORS.textPrimary} />
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxxl * 2,
    gap: SPACING.md,
  },
  iconContainer: {
    marginBottom: SPACING.sm,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.subtitle,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.body,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.purple,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 999,
    marginTop: SPACING.md,
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.body,
    fontFamily: 'Inter-SemiBold',
  },
});
