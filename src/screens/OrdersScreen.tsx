import React from 'react';
import { FlatList, Pressable, RefreshControl, Text, TextStyle, View, ViewStyle } from 'react-native';

import { Card } from '@/components/carts/Card';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Screen } from '@/components/Screen';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchOrders, fetchStaffOrders, requestRefund } from '@/redux/slices/ordersSlice';
import { useRouter } from 'expo-router';
import { t } from '@/i18n/t';

export const OrdersScreen = () => {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items, status, error } = useAppSelector((s) => s.orders);
  const roleID = useAppSelector((s) => s.auth.user?.roleID);
  const isCustomer = roleID === '1';
  const isStaffOrAdmin = roleID === '2' || roleID === '3';

  React.useEffect(() => {
    if (status === 'idle') {
      dispatch(isStaffOrAdmin ? fetchStaffOrders() : fetchOrders());
    }
  }, [dispatch, status, isStaffOrAdmin]);

  const onRefresh = () => {
    dispatch(isStaffOrAdmin ? fetchStaffOrders() : fetchOrders());
  };

  if (status === 'failed') {
    return <ErrorState error={error} onRetry={onRefresh} />;
  }

  if (status !== 'loading' && items.length === 0) {
    return (
      <Screen>
        <EmptyState
          title={t('noOrdersYet')}
          description={t('placeYourFirstOrderDescription')}
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
            {t('orders')}
          </Text>
          <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>{t('yourOrders')}</Text>
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
                  : t('order')
              }
              subtitle={`${item.status} • ${new Date(item.createdAt).toLocaleString()}${
                item.totalAmount != null ? ` • ${item.totalAmount.toLocaleString('vi-VN')}₫` : ''
              }`}
              imageUrl={item.items?.[0]?.imageUrl ?? null}
              onPress={() => router.push(`/order/${item.id}`)}
              right={
                isCustomer && (item.status === 'shipped' || item.status === 'completed') ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => dispatch(requestRefund({ orderId: item.id }))}
                    style={
                      {
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: palette.border,
                        backgroundColor: palette.muted,
                      } as ViewStyle
                    }
                  >
                    <Text style={{ color: palette.text, ...Typography.bodySemi } as TextStyle}>
                      {t('refund')}
                    </Text>
                  </Pressable>
                ) : isCustomer && item.status === 'refund_requested' ? (
                  <View
                    style={
                      {
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: palette.border,
                        backgroundColor: palette.surface,
                      } as ViewStyle
                    }
                  >
                    <Text style={{ color: palette.icon, ...Typography.bodySemi } as TextStyle}>
                      {t('refundPending')}
                    </Text>
                  </View>
                ) : isCustomer && item.status === 'refunded' ? (
                  <View
                    style={
                      {
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: palette.border,
                        backgroundColor: palette.surface,
                      } as ViewStyle
                    }
                  >
                    <Text style={{ color: palette.tint, ...Typography.bodySemi } as TextStyle}>
                      {t('refunded')}
                    </Text>
                  </View>
                ) : null
              }
            />
          )}
        />
      </View>
    </Screen>
  );
};
