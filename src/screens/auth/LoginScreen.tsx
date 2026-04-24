import { Link } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, Text, TextStyle, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiGet } from '../../lib/api';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { clearAuthError, login } from '@/redux/slices/authSlice';

export const LoginScreen = () => {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((s) => s.auth);

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [healthText, setHealthText] = React.useState<string | null>(null);
  const [healthLoading, setHealthLoading] = React.useState(false);

  const testApi = React.useCallback(async () => {
    setHealthLoading(true);
    setHealthText(null);
    try {
      const data = await apiGet('/api/health');
      setHealthText(JSON.stringify(data, null, 2));
    } catch (e) {
      setHealthText(e instanceof Error ? e.message : String(e));
    } finally {
      setHealthLoading(false);
    }
  }, []);

  const onSubmit = () => {
    setLocalError(null);
    dispatch(clearAuthError());

    if (!email.trim() || !password) {
      setLocalError('Please enter email and password.');
      return;
    }

    dispatch(login({ email: email.trim(), password }));
  };

  return (
    <Screen contentStyle={{ justifyContent: 'center' }}>
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })}>
        <View style={{ gap: Spacing.lg }}>
          <View style={{ gap: Spacing.xs }}>
            <Text style={{ color: palette.text, fontSize: 38, ...Typography.display } as TextStyle}>
              Welcome
            </Text>
            <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>
              Sign in to continue.
            </Text>
          </View>

          <View style={{ gap: Spacing.md }}>
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
            />
            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
            />
            {localError ? (
              <Text style={{ color: palette.danger, ...Typography.body } as TextStyle}>{localError}</Text>
            ) : null}
            {error?.message ? (
              <Text style={{ color: palette.danger, ...Typography.body } as TextStyle}>{error.message}</Text>
            ) : null}
            <Button title="Login" onPress={onSubmit} loading={status === 'loading'} />
            <Button title="Test API (GET /api/health)" onPress={testApi} loading={healthLoading} />
            {healthText ? (
              <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>{healthText}</Text>
            ) : null}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
            <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>No account?</Text>
            <Link href="/(auth)/register">
              <Text style={{ color: palette.tint, ...Typography.bodyBold } as TextStyle}>Register</Text>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

