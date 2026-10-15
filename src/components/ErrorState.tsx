import React from 'react';
import { View, StyleSheet, Pressable, Text, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@/src/constants/theme';
import { RotateCcw } from 'lucide-react-native';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({ message, onRetry, retryLabel = 'Retry' }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Pressable style={styles.button} onPress={onRetry} accessibilityRole="button">
          <RotateCcw size={16} color={COLORS.textPrimary} />
          <Text style={styles.buttonText}>{retryLabel}</Text>
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
    paddingVertical: SPACING.xxxl,
    gap: SPACING.md,
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
    backgroundColor: COLORS.bgElevated,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.body,
    fontFamily: 'Inter-SemiBold',
  },
});
