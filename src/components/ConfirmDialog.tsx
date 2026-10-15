import React from 'react';
import { View, StyleSheet, Pressable, Text, Modal, TextInput } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/src/constants/theme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttons}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              style={[styles.confirmButton, destructive && styles.destructiveButton]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.overlayDark,
    padding: SPACING.xl,
  },
  dialog: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 340,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.subtitle,
    fontFamily: 'Inter-SemiBold',
    marginBottom: SPACING.sm,
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.body,
    fontFamily: 'Inter-Regular',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  buttons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center',
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.body,
    fontFamily: 'Inter-SemiBold',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
  },
  destructiveButton: {
    backgroundColor: COLORS.error,
  },
  confirmText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.body,
    fontFamily: 'Inter-SemiBold',
  },
});
