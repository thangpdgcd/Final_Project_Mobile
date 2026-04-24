import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, Text, TextStyle, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
  textStyle,
}: Props) => {
  const scheme = useColorScheme() ?? 'light';
  const scale = useSharedValue(1);

  const palette = Colors[scheme];

  const bg =
    variant === 'primary' ? palette.tint : variant === 'danger' ? palette.danger : palette.muted;
  const fg = variant === 'secondary' ? palette.text : '#ffffff';
  const borderColor = variant === 'secondary' ? palette.border : 'transparent';

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 18, stiffness: 220 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 18, stiffness: 220 });
      }}
      style={[
        {
          height: 48,
          borderRadius: Radius.md,
          backgroundColor: bg,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: Spacing.md,
          opacity: isDisabled ? 0.7 : 1,
          flexDirection: 'row',
          gap: Spacing.sm,
        },
        aStyle,
        style,
      ]}>
      {loading ? <ActivityIndicator color={fg} /> : null}
      <Text
        style={[
          {
            color: fg,
            fontSize: 14,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            ...Typography.bodyBold,
          } as TextStyle,
          textStyle,
        ]}>
        {title}
      </Text>
    </AnimatedPressable>
  );
};

