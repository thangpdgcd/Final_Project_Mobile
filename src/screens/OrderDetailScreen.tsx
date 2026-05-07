import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Text, TextStyle, View, ViewStyle } from 'react-native';

import type { Order, OrderLineItem, OrderStatus } from '@/api/types';
import {
  cancelOrderApi,
  getOrderByIdApi,
  deleteOrderApi,
  resolveRefundApi,
  requestRefundApi,
  updateOrderStatusApi,
} from '@/api/orders';
import { Button } from '@/components/button/Button';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/ToastProvider';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { t } from '@/i18n/t';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchOrders, fetchStaffOrders } from '@/redux/slices/ordersSlice';

const formatVnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

const statusLabel = (s: OrderStatus) => {
  switch (s) {
    case 'pending':
      return t('pendingWaitingStaff');
    case 'confirmed':
      return t('confirm');
    case 'processing':
      return t('processing');
    case 'shipped':
      return t('shipped');
    case 'completed':
      return t('completed');
    case 'refund_requested':
      return t('refundPending');
    case 'refunded':
      return t('refunded');
    case 'cancelled':
      return t('cancelled');
    default:
      return String(s);
  }
};

const canRequestRefund = (s: OrderStatus) => s === 'shipped' || s === 'completed';

export const OrderDetailScreen = () => {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const router = useRouter();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const roleID = useAppSelector((s) => s.auth.user?.roleID);
  const isCustomer = roleID === '1';
  const isStaff = roleID === '3';
  const params = useLocalSearchParams<{ id?: string }>();

  const id = String(params.id ?? '').trim();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [order, setOrder] = React.useState<Order | null>(null);
  const [errorText, setErrorText] = React.useState<string | null>(null);

  const refreshOrders = React.useCallback(async () => {
    dispatch(isStaff ? fetchStaffOrders() : fetchOrders());
  }, [dispatch, isStaff]);

  const load = React.useCallback(async () => {
    if (!id) {
      setErrorText(t('missingOrderId'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorText(null);
    try {
      const data = await getOrderByIdApi(id);
      setOrder(data);
    } catch (e) {
      setErrorText(e instanceof Error ? e.message : t('failedToLoadOrder'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    load();
  }, [load]);

  const onRefund = async () => {
    if (!order) return;
    setSaving(true);
    try {
      const updated = await requestRefundApi(order.id);
      setOrder(updated);
      toast.show(t('refundRequestSent'));
      refreshOrders();
      await load();
    } catch (e) {
      toast.show(e instanceof Error ? e.message : t('refundRequestFailed'));
    } finally {
      setSaving(false);
    }
  };

  const onCancelOrder = async () => {
    if (!order) return;
    setSaving(true);
    try {
      const updated = await cancelOrderApi(order.id);
      setOrder(updated);
      toast.show(t('orderCancelled'));
      refreshOrders();
      await load();
    } catch (e) {
      toast.show(e instanceof Error ? e.message : t('cancelOrderFailed'));
    } finally {
      setSaving(false);
    }
  };

  const onStaffUpdateStatus = async (nextStatus: OrderStatus) => {
    if (!order) return;
    setSaving(true);
    try {
      const updated = await updateOrderStatusApi(order.id, { status: nextStatus });
      setOrder(updated);
      toast.show(t('orderUpdated'));
      refreshOrders();
      await load();
    } catch (e) {
      toast.show(e instanceof Error ? e.message : t('updateStatusFailed'));
    } finally {
      setSaving(false);
    }
  };

  const onResolveRefund = async (approved: boolean) => {
    if (!order) return;
    setSaving(true);
    try {
      const updated = await resolveRefundApi(order.id, { approved });
      setOrder(updated);
      toast.show(approved ? t('refundApproved') : t('refundRejected'));
      refreshOrders();
      await load();
    } catch (e) {
      toast.show(e instanceof Error ? e.message : t('resolveRefundFailed'));
    } finally {
      setSaving(false);
    }
  };

  const onDeleteOrder = async () => {
    if (!order) return;
    setSaving(true);
    try {
      await deleteOrderApi(order.id);
      toast.show(t('orderDeleted'));
      refreshOrders();
      router.back();
    } catch (e) {
      toast.show(e instanceof Error ? e.message : t('deleteOrderFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <ActivityIndicator />
          <Text style={{ color: palette.icon } as TextStyle}>{t('loadingEllipsis')}</Text>
        </View>
      </Screen>
    );
  }

  if (errorText || !order) {
    return (
      <Screen>
        <View style={{ flex: 1, gap: Spacing.md }}>
          <Text style={{ color: palette.text, fontSize: 34, ...Typography.display } as TextStyle}>
            {t('order')}
          </Text>
          <Text style={{ color: palette.danger, ...Typography.body } as TextStyle}>
            {errorText ?? t('notFound')}
          </Text>
          <Button title={t('back')} variant="secondary" onPress={() => router.back()} />
          <Button title={t('retry')} onPress={load} />
        </View>
      </Screen>
    );
  }

  const items: OrderLineItem[] = Array.isArray(order.items) ? order.items : [];

  return (
    <Screen>
      <View style={{ flex: 1, gap: Spacing.md }}>
        <View style={{ gap: Spacing.xs }}>
          <Text style={{ color: palette.text, fontSize: 34, ...Typography.display } as TextStyle}>
            {t('order')}
          </Text>
          <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>
            #{order.id} • {new Date(order.createdAt).toLocaleString()}
          </Text>
        </View>

        <View
          style={
            {
              borderWidth: 1,
              borderColor: palette.border,
              backgroundColor: palette.surface,
              borderRadius: Radius.lg,
              padding: Spacing.md,
              gap: 8,
            } as ViewStyle
          }
        >
          <Text style={{ color: palette.icon, ...Typography.bodySemi } as TextStyle}>{t('status')}</Text>
          <Text style={{ color: palette.text, ...Typography.bodyBold } as TextStyle}>
            {statusLabel(order.status)}
          </Text>
          {order.status === 'pending' ? (
            <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>
              {statusLabel(order.status)}
            </Text>
          ) : order.status === 'refund_requested' ? (
            <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>{t('refundPending')}</Text>
          ) : null}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: palette.icon, ...Typography.bodySemi } as TextStyle}>{t('items')}</Text>
          <FlatList
            data={items}
            keyExtractor={(it) => it.productId}
            contentContainerStyle={{ gap: Spacing.sm, paddingTop: Spacing.sm, paddingBottom: Spacing.sm }}
            renderItem={({ item }) => {
              const lineTotal = (item.price ?? 0) * item.quantity;
              return (
                <View
                  style={
                    {
                      borderWidth: 1,
                      borderColor: palette.border,
                      backgroundColor: palette.surface,
                      borderRadius: Radius.lg,
                      padding: Spacing.md,
                      gap: 6,
                    } as ViewStyle
                  }
                >
                  <Text style={{ color: palette.text, ...Typography.bodyBold } as TextStyle}>
                    {item.name}
                  </Text>
                  <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>
                    {item.quantity} × {formatVnd(item.price ?? 0)}
                  </Text>
                  <Text style={{ color: palette.text, ...Typography.bodySemi } as TextStyle}>
                    {formatVnd(lineTotal)}
                  </Text>
                </View>
              );
            }}
          />
        </View>

        <View style={{ gap: Spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>{t('total')}</Text>
            <Text style={{ color: palette.text, ...Typography.bodyBold } as TextStyle}>
              {formatVnd(order.totalAmount ?? 0)}
            </Text>
          </View>

          {isCustomer && canRequestRefund(order.status) ? (
            <Button title={t('requestRefund')} onPress={onRefund} loading={saving} />
          ) : null}

          {isCustomer && order.status === 'refund_requested' ? (
            <Button title={t('refundPending')} onPress={() => {}} disabled variant="secondary" />
          ) : null}

          {isCustomer &&
          (order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing') ? (
            <Button title={t('cancelOrder')} onPress={onCancelOrder} loading={saving} variant="secondary" />
          ) : null}

          {isStaff && order.status === 'pending' ? (
            <Button title={t('confirm')} onPress={() => onStaffUpdateStatus('confirmed')} loading={saving} />
          ) : null}
          {isStaff && order.status === 'confirmed' ? (
            <Button
              title={t('processing')}
              onPress={() => onStaffUpdateStatus('processing')}
              loading={saving}
            />
          ) : null}
          {isStaff && order.status === 'processing' ? (
            <Button title={t('shipped')} onPress={() => onStaffUpdateStatus('shipped')} loading={saving} />
          ) : null}
          {isStaff && order.status === 'shipped' ? (
            <Button
              title={t('completed')}
              onPress={() => onStaffUpdateStatus('completed')}
              loading={saving}
            />
          ) : null}

          {isStaff && order.status === 'refund_requested' ? (
            <>
              <Button title={t('approveRefund')} onPress={() => onResolveRefund(true)} loading={saving} />
              <Button
                title={t('rejectRefund')}
                onPress={() => onResolveRefund(false)}
                loading={saving}
                variant="secondary"
              />
            </>
          ) : null}

          {isStaff ? (
            <Button title={t('deleteOrder')} onPress={onDeleteOrder} loading={saving} variant="danger" />
          ) : null}

          <Button title={t('back')} variant="secondary" onPress={() => router.back()} />
        </View>
      </View>
    </Screen>
  );
};
