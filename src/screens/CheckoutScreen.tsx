import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, Text, TextStyle, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { createOrder, resetCreateOrderStatus } from '@/redux/slices/ordersSlice';
import { clearCart } from '@/redux/slices/cartSlice';
import { useToast } from '@/components/ToastProvider';
import { fetchNotifications } from '@/redux/slices/notificationsSlice';

export const CheckoutScreen = () => {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const router = useRouter();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { createStatus, error } = useAppSelector((s) => s.orders);
  const cartItems = useAppSelector((s) => s.cart.items);

  const [shippingAddress, setShippingAddress] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState<'cod' | 'paypal'>('cod');
  const [note, setNote] = React.useState('');

  React.useEffect(() => {
    if (createStatus === 'succeeded') {
      dispatch(resetCreateOrderStatus());
      dispatch(clearCart());
      dispatch(fetchNotifications());
      toast.show('Order placed successfully');
      router.replace('/(tabs)/orders');
    }
  }, [createStatus, dispatch, router]);

  const onPlace = () => {
    if (cartItems.length === 0) return;
    if (!shippingAddress.trim()) return;
    dispatch(
      createOrder({
        items: cartItems.map((l) => ({
          productId: l.product.id,
          quantity: l.quantity,
          price: l.product.price ?? null,
        })),
        paymentMethod,
        shippingAddress: shippingAddress.trim(),
        note: note.trim() ? note.trim() : undefined,
      })
    );
  };

  return (
    <Screen>
      <View style={{ flex: 1, gap: Spacing.md }}>
        <View style={{ gap: 6 }}>
          <Text style={{ color: palette.text, fontSize: 26, fontWeight: '900' } as TextStyle}>Checkout</Text>
          <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>
            Choose payment method and enter shipping address.
          </Text>
        </View>

        <View style={{ gap: Spacing.md }}>
          <View style={{ gap: 8 }}>
            <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>Payment method</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setPaymentMethod('cod')}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: paymentMethod === 'cod' ? palette.tint : palette.border,
                  backgroundColor: paymentMethod === 'cod' ? palette.muted : 'transparent',
                }}>
                <Text style={{ color: palette.text, ...Typography.bodyBold } as TextStyle}>Cash (COD)</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setPaymentMethod('paypal')}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: paymentMethod === 'paypal' ? palette.tint : palette.border,
                  backgroundColor: paymentMethod === 'paypal' ? palette.muted : 'transparent',
                }}>
                <Text style={{ color: palette.text, ...Typography.bodyBold } as TextStyle}>PayPal</Text>
              </Pressable>
            </View>
          </View>

          <TextField
            label="Shipping address"
            value={shippingAddress}
            onChangeText={setShippingAddress}
            placeholder="Enter your address"
            returnKeyType="done"
          />

          <TextField label="Note (optional)" value={note} onChangeText={setNote} placeholder="Any note for the order" />

          <View style={{ gap: 8 }}>
            <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>Items</Text>
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
          {error?.message ? <Text style={{ color: palette.danger } as TextStyle}>{error.message}</Text> : null}
          {!shippingAddress.trim() ? (
            <Text style={{ color: palette.danger, ...Typography.body } as TextStyle}>Please enter shipping address.</Text>
          ) : null}
        </View>

        <View style={{ flex: 1 }} />

        <View style={{ gap: Spacing.sm }}>
          <Button title="Confirm order" onPress={onPlace} loading={createStatus === 'loading'} disabled={!shippingAddress.trim()} />
          <Button title="Back to cart" variant="secondary" onPress={() => router.back()} />
        </View>
      </View>
    </Screen>
  );
};

