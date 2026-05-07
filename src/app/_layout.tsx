import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import 'react-native-reanimated';
import { Provider } from 'react-redux';

import { ToastProvider } from '@/components/ToastProvider';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppFonts } from '@/hooks/useAppFonts';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { hydrateAuth } from '@/redux/slices/authSlice';
import { store } from '@/redux/store';
import { t } from '@/i18n/t';
import { I18nProvider, useI18n } from '@/i18n/I18nProvider';

export const unstable_settings = {
  anchor: '(tabs)',
};

const RootLayoutGate = () => {
  const fontsLoaded = useAppFonts();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useAppDispatch();
  const { lang } = useI18n();
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

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        <ActivityIndicator />
        <Text>{t('loadingEllipsis')}</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack key={lang}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="order/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="checkout" options={{ headerShown: false }} />
        <Stack.Screen name="change-password" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
};

export default function RootLayout() {
  return (
    <I18nProvider>
      <Provider store={store}>
        <ToastProvider>
          <RootLayoutGate />
        </ToastProvider>
      </Provider>
    </I18nProvider>
  );
}
