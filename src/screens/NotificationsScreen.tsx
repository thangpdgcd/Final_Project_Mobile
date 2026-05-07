import React from 'react';
import { FlatList, RefreshControl, Text, TextStyle, View } from 'react-native';

import { Card } from '@/components/carts/Card';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Screen } from '@/components/Screen';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchNotifications } from '@/redux/slices/notificationsSlice';
import { t } from '@/i18n/t';

const localizedNotificationTitle = (rawType?: string | null, fallbackTitle?: string) => {
  const type = String(rawType ?? '').toLowerCase();
  const fallback = String(fallbackTitle ?? '').trim();
  const fallbackLower = fallback.toLowerCase();

  if (type.includes('order')) return t('order');
  if (type.includes('chat')) return t('chat');
  if (type.includes('voucher')) return t('voucher');

  if (fallbackLower.startsWith('order')) return t('order');
  if (fallbackLower.startsWith('chat')) return t('chat');
  if (fallbackLower.startsWith('voucher')) return t('voucher');
  if (fallbackLower.startsWith('notification')) return t('notification');

  // Vietnamese titles coming from backend should stay as-is.
  if (fallbackLower.startsWith('đơn')) return fallback;

  return fallbackTitle || t('notification');
};

export const NotificationsScreen = () => {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((s) => s.notifications);

  React.useEffect(() => {
    if (status === 'idle') dispatch(fetchNotifications());
  }, [dispatch, status]);

  const onRefresh = () => {
    dispatch(fetchNotifications());
  };

  if (status === 'failed') {
    return <ErrorState error={error} onRetry={onRefresh} />;
  }

  if (status !== 'loading' && items.length === 0) {
    return (
      <Screen>
        <EmptyState
          title={t('noNotifications')}
          description={t('allCaughtUp')}
          actionTitle={t('reload')}
          onActionPress={onRefresh}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ gap: Spacing.md, flex: 1 }}>
        <View style={{ gap: Spacing.xs }}>
          <Text style={{ color: palette.text, fontSize: 34, ...Typography.display } as TextStyle}>
            {t('notifications')}
          </Text>
          <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>
            {t('updatesAboutOrdersAndAccount')}
          </Text>
        </View>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: Spacing.sm, paddingBottom: Spacing.xxl }}
          refreshControl={<RefreshControl refreshing={status === 'loading'} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <Card title={localizedNotificationTitle(item.type, item.title)} subtitle={item.body} />
          )}
        />
      </View>
    </Screen>
  );
};
