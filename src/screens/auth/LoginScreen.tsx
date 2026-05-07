import { Link } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, Text, TextStyle, View } from 'react-native';

import { Button } from '@/components/button/Button';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { clearAuthError, login } from '@/redux/slices/authSlice';
import { t } from '@/i18n/t';

export const LoginScreen = () => {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((s) => s.auth);

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [localError, setLocalError] = React.useState<string | null>(null);

  const onSubmit = () => {
    setLocalError(null);
    dispatch(clearAuthError());

    if (!email.trim() || !password) {
      setLocalError(t('pleaseEnterEmailAndPassword'));
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
              {t('welcome')}
            </Text>
            <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>
              {t('signInToContinue')}
            </Text>
          </View>

          <View style={{ gap: Spacing.md }}>
            <TextField
              label={t('email')}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
            />
            <TextField
              label={t('password')}
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
            <Button title={t('login')} onPress={onSubmit} loading={status === 'loading'} />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
            <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>{t('noAccount')}</Text>
            <Link href="/(auth)/register">
              <Text style={{ color: palette.tint, ...Typography.bodyBold } as TextStyle}>
                {t('register')}
              </Text>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};
