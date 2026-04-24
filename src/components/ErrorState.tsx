import React from 'react';
import { StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';

import type { ApiError } from '@/api/types';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Button } from '@/components/Button';

type Props = {
  title?: string;
  error?: ApiError | null;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const ErrorState = ({ title = 'Something went wrong', error, onRetry, style }: Props) => {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];

  return (
    <View
      style={[
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: Spacing.lg,
          gap: Spacing.sm,
        },
        style,
      ]}>
      <Text style={{ color: palette.danger, fontWeight: '800', fontSize: 18 } as TextStyle}>
        {title}
      </Text>
      {error?.message ? (
        <Text style={{ color: palette.icon, textAlign: 'center' } as TextStyle}>{error.message}</Text>
      ) : null}
      {onRetry ? (
        <View style={{ marginTop: Spacing.sm, alignSelf: 'stretch' }}>
          <Button title="Try again" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
};

