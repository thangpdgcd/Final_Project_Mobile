import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleProp, View, ViewStyle } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export const Screen = ({ children, style, contentStyle }: Props) => {
  const scheme = useColorScheme() ?? 'light';
  const bg = Colors[scheme].background;

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: bg }, style]}>
      <View style={[{ flex: 1, padding: Spacing.md }, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
};

