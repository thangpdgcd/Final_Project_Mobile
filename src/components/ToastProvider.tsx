import React from 'react';
import { Animated, StyleSheet, Text, TextStyle, View } from 'react-native';

import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ToastContextValue = {
  show: (message: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const [message, setMessage] = React.useState<string | null>(null);
  const opacity = React.useRef(new Animated.Value(0)).current;

  const hideTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = React.useCallback(
    (msg: string) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setMessage(msg);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      hideTimer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
          setMessage(null);
        });
      }, 1600);
    },
    [opacity]
  );

  React.useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {message ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <View style={styles.container}>
            <Animated.View
              style={[
                styles.toast,
                {
                  opacity,
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                },
              ]}>
              <Text style={{ color: palette.text, ...Typography.bodyBold } as TextStyle}>{message}</Text>
            </Animated.View>
          </View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.md,
  },
  toast: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    maxWidth: 420,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});

