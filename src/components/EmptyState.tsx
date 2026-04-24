import React from 'react';
import { StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Button } from '@/components/Button';

type Props = {
  title: string;
  description?: string;
  actionTitle?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const EmptyState = ({ title, description, actionTitle, onActionPress, style }: Props) => {
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
      <Text style={{ color: palette.text, fontWeight: '800', fontSize: 18 } as TextStyle}>
        {title}
      </Text>
      {description ? (
        <Text style={{ color: palette.icon, textAlign: 'center' } as TextStyle}>{description}</Text>
      ) : null}
      {actionTitle && onActionPress ? (
        <View style={{ marginTop: Spacing.sm, alignSelf: 'stretch' }}>
          <Button title={actionTitle} onPress={onActionPress} variant="secondary" />
        </View>
      ) : null}
    </View>
  );
};

