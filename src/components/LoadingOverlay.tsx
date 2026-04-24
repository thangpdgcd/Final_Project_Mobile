import React from 'react';
import { ActivityIndicator, Modal, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  visible: boolean;
};

export const LoadingOverlay = ({ visible }: Props) => {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.25)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View
          style={{
            height: 64,
            width: 64,
            borderRadius: 16,
            backgroundColor: palette.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ActivityIndicator color={palette.tint} />
        </View>
      </View>
    </Modal>
  );
};

