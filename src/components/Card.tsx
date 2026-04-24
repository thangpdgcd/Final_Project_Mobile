import React from 'react';
import { Pressable, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  right?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const Card = ({ title, subtitle, imageUrl, right, onPress, style }: Props) => {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];

  const Container = onPress ? Pressable : View;
  const shadow =
    scheme === 'dark'
      ? ({
          shadowColor: '#000',
          shadowOpacity: 0.35,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 8,
        } as ViewStyle)
      : ({
          shadowColor: '#4b2e2b',
          shadowOpacity: 0.12,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
          elevation: 6,
        } as ViewStyle);

  return (
    <Container
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={[
        {
          backgroundColor: palette.surface,
          borderRadius: Radius.lg,
          padding: Spacing.md,
          borderWidth: 1,
          borderColor: palette.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: Spacing.md,
        },
        shadow,
        style,
      ]}>
      <View
        style={{
          width: 54,
          height: 54,
          borderRadius: 16,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: palette.border,
          backgroundColor: palette.muted,
        }}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: palette.icon, fontWeight: '800' } as TextStyle}>
              {title.trim().slice(0, 1).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: palette.text, fontWeight: '700', fontSize: 16 } as TextStyle}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ color: palette.icon } as TextStyle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </Container>
  );
};

