import React from 'react';
import { Pressable, ScrollView, Text, TextStyle, View } from 'react-native';

import { Button } from '@/components/button/Button';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';
import { fetchProfile, updateProfile } from '@/redux/slices/profileSlice';
import { useRouter } from 'expo-router';
import { t } from '@/i18n/t';
import { useI18n } from '@/i18n/I18nProvider';

export const ProfileScreen = () => {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { lang, toggleLang } = useI18n();
  const authUser = useAppSelector((s) => s.auth.user);
  const { user, status, error } = useAppSelector((s) => s.profile);

  React.useEffect(() => {
    if (status === 'idle') dispatch(fetchProfile());
  }, [dispatch, status]);

  const [name, setName] = React.useState(authUser?.name ?? user?.name ?? '');
  const [phone, setPhone] = React.useState(authUser?.phone ?? user?.phone ?? '');

  React.useEffect(() => {
    setName(user?.name ?? authUser?.name ?? '');
    setPhone((user?.phone ?? authUser?.phone ?? '') || '');
  }, [authUser?.name, authUser?.phone, user?.name, user?.phone]);

  const onSave = () => {
    dispatch(updateProfile({ name: name.trim(), phone: phone.trim() }));
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: Spacing.md, paddingBottom: Spacing.xxl }}>
        <View style={{ gap: Spacing.xs }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: palette.text, fontSize: 34, ...Typography.display } as TextStyle}>
                {t('profile')}
              </Text>
              <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>
                {t('manageYourAccountDetails')}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void toggleLang();
              }}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: palette.border,
                backgroundColor: palette.surface,
              }}
            >
              <Text style={{ color: palette.text, ...Typography.bodySemi } as TextStyle}>
                {lang === 'vi' ? 'VN' : 'EN'}
              </Text>
              <Text style={{ color: palette.icon, fontSize: 12 } as TextStyle}>
                {lang === 'vi' ? t('switchToEnglish') : t('switchToVietnamese')}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={{ gap: Spacing.md }}>
          <TextField label={t('name')} value={name} onChangeText={setName} />
          <TextField
            label={t('phoneNumber')}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          {error?.message ? (
            <Text style={{ color: palette.danger, ...Typography.body } as TextStyle}>{error.message}</Text>
          ) : null}
          <Button title={t('saveChanges')} onPress={onSave} loading={status === 'loading'} />
          <Button
            title={t('changePassword')}
            variant="secondary"
            onPress={() => router.push('/change-password')}
          />
          <Button title={t('logout')} onPress={() => dispatch(logout())} variant="secondary" />
        </View>
      </ScrollView>
    </Screen>
  );
};
