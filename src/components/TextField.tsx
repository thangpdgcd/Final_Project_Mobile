import React from 'react';
import { StyleProp, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from 'react-native';

import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = TextInputProps & {
  label?: string;
  errorText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export const TextField = ({ label, errorText, containerStyle, inputStyle, ...props }: Props) => {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];

  return (
    <View style={[{ gap: Spacing.xs }, containerStyle]}>
      {label ? (
        <Text
          style={
            {
              color: palette.icon,
              textTransform: 'uppercase',
              letterSpacing: 1.2,
              fontSize: 11,
              ...Typography.bodySemi,
            } as TextStyle
          }>
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={scheme === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(47,31,24,0.35)'}
        {...props}
        style={[
          {
            height: 48,
            borderRadius: Radius.md,
            borderWidth: 1,
            borderColor: errorText ? palette.danger : palette.border,
            backgroundColor: palette.surface,
            paddingHorizontal: Spacing.md,
            color: palette.text,
            ...Typography.body,
          } as TextStyle,
          inputStyle,
        ]}
      />
      {errorText ? <Text style={{ color: palette.danger } as TextStyle}>{errorText}</Text> : null}
    </View>
  );
};

