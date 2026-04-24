import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';
import { Provider } from 'react-redux';

import { useAppFonts } from '@/hooks/useAppFonts';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ToastProvider } from '@/components/ToastProvider';
import { store } from '@/redux/store';
import { hydrateAuth } from '@/redux/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

export const unstable_settings = {
  anchor: '(tabs)',
};

const RootLayoutGate = () => {
  const fontsLoaded = useAppFonts();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useAppDispatch();
  const { token, isHydrated } = useAppSelector((s) => s.auth);

  React.useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  React.useEffect(() => {
    if (!isHydrated) return;
    if (!fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!token && (inTabsGroup || !inAuthGroup)) {
      router.replace('/(auth)/login');
      return;
    }

    if (token && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [fontsLoaded, isHydrated, router, segments, token]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="checkout" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
};

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <RootLayoutGate />
      </ToastProvider>
    </Provider>
  );
}
