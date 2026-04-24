import React from 'react';
import { FlatList, RefreshControl, Text, TextStyle, View } from 'react-native';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Screen } from '@/components/Screen';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchOrders } from '@/redux/slices/ordersSlice';

export const OrdersScreen = () => {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((s) => s.orders);

  React.useEffect(() => {
    if (status === 'idle') dispatch(fetchOrders());
  }, [dispatch, status]);

  const onRefresh = () => {
    dispatch(fetchOrders());
  };

  if (status === 'failed') {
    return <ErrorState error={error} onRetry={onRefresh} />;
  }

  if (status !== 'loading' && items.length === 0) {
    return (
      <Screen>
        <EmptyState
          title="No orders yet"
          description="Place your first order/booking and it will appear here."
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
            Orders
          </Text>
          <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>
            Your bookings and purchases in one place.
          </Text>
        </View>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: Spacing.sm, paddingBottom: Spacing.xxl }}
          refreshControl={<RefreshControl refreshing={status === 'loading'} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <Card
              title={
                item.items && item.items.length > 0
                  ? item.items
                      .slice(0, 2)
                      .map((x) => x.name)
                      .join(' • ') + (item.items.length > 2 ? ` +${item.items.length - 2}` : '')
                  : 'Order'
              }
              subtitle={`${item.status} • ${new Date(item.createdAt).toLocaleString()}${
                item.totalAmount != null ? ` • ${item.totalAmount.toLocaleString('vi-VN')}₫` : ''
              }`}
              imageUrl={item.items?.[0]?.imageUrl ?? null}
            />
          )}
        />
      </View>
    </Screen>
  );
};

