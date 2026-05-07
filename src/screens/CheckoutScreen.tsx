import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Text, TextStyle, View } from 'react-native';

import { Button } from '@/components/button/Button';
import { Card } from '@/components/carts/Card';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { createOrder, resetCreateOrderStatus } from '@/redux/slices/ordersSlice';
import { clearCart } from '@/redux/slices/cartSlice';
import { useToast } from '@/components/ToastProvider';
import { fetchNotifications } from '@/redux/slices/notificationsSlice';
import { t } from '@/i18n/t';

export const CheckoutScreen = () => {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const router = useRouter();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { createStatus, error } = useAppSelector((s) => s.orders);
  const cartItems = useAppSelector((s) => s.cart.items);

  const [shippingAddress, setShippingAddress] = React.useState('');
  // Mobile chỉ hỗ trợ COD.
  const paymentMethod = 'cod' as const;
  const [note, setNote] = React.useState('');

  React.useEffect(() => {
    if (createStatus === 'succeeded') {
      dispatch(resetCreateOrderStatus());
      dispatch(clearCart());
      dispatch(fetchNotifications());
      toast.show('Order placed successfully');
      router.replace('/(tabs)/orders');
    }
  }, [createStatus, dispatch, router, toast]);

  React.useEffect(() => {
    if (createStatus === 'failed' && error?.message) {
      toast.show(error.message);
    }
  }, [createStatus, error?.message, toast]);

  const onPlace = () => {
    if (cartItems.length === 0) return;
    if (!shippingAddress.trim()) return;
    const doOrder = async () => {
      const items = cartItems.map((l) => ({
        productId: l.product.id,
        quantity: l.quantity,
        price: l.product.price ?? null,
      }));

      dispatch(
        createOrder({
          items,
          paymentMethod,
          shippingAddress: shippingAddress.trim(),
          note: note.trim() ? note.trim() : undefined,
        }),
      );
    };

    void doOrder().catch((e) => {
      toast.show(e instanceof Error ? e.message : String(e));
    });
  };

  return (
    <Screen>
      <View style={{ flex: 1, gap: Spacing.md }}>
        <View style={{ gap: 6 }}>
          <Text style={{ color: palette.text, fontSize: 26, fontWeight: '900' } as TextStyle}>
            {t('checkout')}
          </Text>
          <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>
            {t('choosePaymentMethodAndEnterShippingAddress')}
          </Text>
        </View>

        <View style={{ gap: Spacing.md }}>
          <View style={{ gap: 8 }}>
            <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>{t('paymentMethod')}</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: palette.tint,
                  backgroundColor: palette.muted,
                }}
              >
                <Text style={{ color: palette.text, ...Typography.bodyBold } as TextStyle}>
                  {t('cashOnDelivery')}
                </Text>
              </View>
            </View>
          </View>

          <TextField
            label={t('shippingAddress')}
            value={shippingAddress}
            onChangeText={setShippingAddress}
            placeholder={t('enterYourAddress')}
            returnKeyType="done"
          />

          <TextField
            label={t('noteOptional')}
            value={note}
            onChangeText={setNote}
            placeholder={t('anyNoteForTheOrder')}
          />

          <View style={{ gap: 8 }}>
            <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>{t('items')}</Text>
            <FlatList
              data={cartItems}
              keyExtractor={(l) => l.product.id}
              scrollEnabled={false}
              contentContainerStyle={{ gap: Spacing.sm }}
              renderItem={({ item }) => (
                <Card
                  title={item.product.name}
                  subtitle={`${item.quantity} × ${(item.product.price ?? 0).toLocaleString('vi-VN')}₫`}
                  imageUrl={item.product.imageUrl}
                />
              )}
            />
          </View>
          {error?.message ? (
            <Text style={{ color: palette.danger } as TextStyle}>{error.message}</Text>
          ) : null}
          {!shippingAddress.trim() ? (
            <Text style={{ color: palette.danger, ...Typography.body } as TextStyle}>
              {t('enterShippingAddress')}
            </Text>
          ) : null}
        </View>

        <View style={{ flex: 1 }} />

        <View style={{ gap: Spacing.sm }}>
          <Button
            title={t('confirmOrder')}
            onPress={onPlace}
            loading={createStatus === 'loading'}
            disabled={!shippingAddress.trim()}
          />
          <Button title={t('backToCart')} variant="secondary" onPress={() => router.back()} />
        </View>
      </View>
    </Screen>
  );
};
