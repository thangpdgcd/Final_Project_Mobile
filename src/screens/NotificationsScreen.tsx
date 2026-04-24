import React from 'react';
import { FlatList, RefreshControl, Text, TextStyle, View } from 'react-native';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Screen } from '@/components/Screen';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchNotifications } from '@/redux/slices/notificationsSlice';

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
          title="No notifications"
          description="You’re all caught up."
          actionTitle="Reload"
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
            Notifications
          </Text>
          <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>
            Updates about your orders and account.
          </Text>
        </View>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: Spacing.sm, paddingBottom: Spacing.xxl }}
          refreshControl={<RefreshControl refreshing={status === 'loading'} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <Card title={item.title} subtitle={item.body} />
          )}
        />
      </View>
    </Screen>
  );
};

