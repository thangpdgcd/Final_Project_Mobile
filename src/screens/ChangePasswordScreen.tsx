import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TextStyle, View } from 'react-native';

import { changePasswordApi } from '@/api/profile';
import { Button } from '@/components/button/Button';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { t } from '@/i18n/t';

export const ChangePasswordScreen = () => {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const router = useRouter();

  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [errorText, setErrorText] = React.useState<string | null>(null);
  const [successText, setSuccessText] = React.useState<string | null>(null);

  const onSubmit = async () => {
    setErrorText(null);
    setSuccessText(null);

    if (!oldPassword || !newPassword) {
      setErrorText(t('pleaseEnterCurrentPasswordAndNewPassword'));
      return;
    }
    if (newPassword.length < 6) {
      setErrorText(t('newPasswordMustBeAtLeast6Characters'));
      return;
    }
    if (confirmNewPassword && confirmNewPassword !== newPassword) {
      setErrorText(t('confirmPasswordDoesNotMatch'));
      return;
    }

    setSaving(true);
    try {
      await changePasswordApi({
        oldPassword,
        newPassword,
        confirmNewPassword: confirmNewPassword || undefined,
      });
      setSuccessText(t('passwordUpdatedSuccessfully'));
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => router.back(), 700);
    } catch (e) {
      setErrorText(e instanceof Error ? e.message : t('changePasswordFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <View style={{ flex: 1, gap: Spacing.md }}>
        <View style={{ gap: Spacing.xs }}>
          <Text style={{ color: palette.text, fontSize: 34, ...Typography.display } as TextStyle}>
            {t('changePassword')}
          </Text>
          <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>{t('updatePassword')}</Text>
        </View>

        <View style={{ gap: Spacing.md }}>
          <TextField
            label={t('currentPassword')}
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry
            returnKeyType="next"
          />
          <TextField
            label={t('newPassword')}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            returnKeyType="next"
          />
          <TextField
            label={t('confirmNewPasswordOptional')}
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            secureTextEntry
            returnKeyType="done"
          />

          {errorText ? (
            <Text style={{ color: palette.danger, ...Typography.body } as TextStyle}>{errorText}</Text>
          ) : null}
          {successText ? (
            <Text style={{ color: palette.tint, ...Typography.body } as TextStyle}>{successText}</Text>
          ) : null}

          <Button title={t('updatePassword')} onPress={onSubmit} loading={saving} />
          <Button title={t('cancel')} variant="secondary" onPress={() => router.back()} />
        </View>
      </View>
    </Screen>
  );
};
