import React from 'react';
import { StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';

import type { ApiError } from '@/api/types';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Button } from '@/components/button/Button';
import { t } from '@/i18n/t';

type Props = {
  title?: string;
  error?: ApiError | null;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const ErrorState = ({ title, error, onRetry, style }: Props) => {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const finalTitle = title ?? t('somethingWentWrong');

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
      ]}
    >
      <Text style={{ color: palette.danger, fontWeight: '800', fontSize: 18 } as TextStyle}>
        {finalTitle}
      </Text>
      {error?.message ? (
        <Text style={{ color: palette.icon, textAlign: 'center' } as TextStyle}>{error.message}</Text>
      ) : null}
      {onRetry ? (
        <View style={{ marginTop: Spacing.sm, alignSelf: 'stretch' }}>
          <Button title={t('tryAgain')} onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
};
