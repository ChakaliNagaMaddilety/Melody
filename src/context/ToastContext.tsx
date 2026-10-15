import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/src/constants/theme';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react-native';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((toast) => {
        const icon =
          toast.type === 'success' ? (
            <CheckCircle size={20} color={COLORS.success} />
          ) : toast.type === 'error' ? (
            <AlertCircle size={20} color={COLORS.error} />
          ) : (
            <Info size={20} color={COLORS.purple} />
          );
        const borderColor =
          toast.type === 'success' ? COLORS.success : toast.type === 'error' ? COLORS.error : COLORS.purple;

        return (
          <Modal key={toast.id} transparent visible animationType="fade" onRequestClose={() => dismiss(toast.id)}>
            <View style={styles.overlay}>
              <Pressable style={[styles.toast, { borderLeftColor: borderColor }]} onPress={() => dismiss(toast.id)}>
                {icon}
                <Text style={styles.message} numberOfLines={3}>
                  {toast.message}
                </Text>
                <X size={16} color={COLORS.textTertiary} />
              </Pressable>
            </View>
          </Modal>
        );
      })}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'transparent',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderLeftWidth: 3,
    maxWidth: '100%',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.caption,
    fontFamily: 'Inter-Regular',
  },
});
