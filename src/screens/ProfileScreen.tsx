import React from 'react';
import { Text, TextStyle, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';
import { fetchProfile, updateProfile } from '@/redux/slices/profileSlice';

export const ProfileScreen = () => {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const dispatch = useAppDispatch();
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
      <View style={{ flex: 1, gap: Spacing.md }}>
        <View style={{ gap: Spacing.xs }}>
          <Text style={{ color: palette.text, fontSize: 34, ...Typography.display } as TextStyle}>
            Profile
          </Text>
          <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>
            Manage your account details.
          </Text>
        </View>

        <View style={{ gap: Spacing.md }}>
          <TextField label="Name" value={name} onChangeText={setName} />
          <TextField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          {error?.message ? (
            <Text style={{ color: palette.danger, ...Typography.body } as TextStyle}>{error.message}</Text>
          ) : null}
          <Button title="Save changes" onPress={onSave} loading={status === 'loading'} />
        </View>

        <View style={{ flex: 1 }} />

        <Button title="Logout" onPress={() => dispatch(logout())} variant="secondary" />
      </View>
    </Screen>
  );
};

