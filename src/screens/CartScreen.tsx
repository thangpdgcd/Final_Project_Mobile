import React from 'react';
import { FlatList, Pressable, Text, TextStyle, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { clearCart, decrement, increment, removeFromCart } from '@/redux/slices/cartSlice';
import { useRouter } from 'expo-router';

const formatVnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

export const CartScreen = () => {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const dispatch = useAppDispatch();
  const router = useRouter();
  const items = useAppSelector((s) => s.cart.items);

  const total = items.reduce((sum, l) => sum + (l.product.price ?? 0) * l.quantity, 0);

  if (items.length === 0) {
    return (
      <Screen>
        <EmptyState
          title="Your cart is empty"
          description="Add a product to see it here."
          actionTitle="Reload products"
          onActionPress={() => {}}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ flex: 1, gap: Spacing.md }}>
        <View style={{ gap: Spacing.xs }}>
          <Text style={{ color: palette.text, fontSize: 34, ...Typography.display } as TextStyle}>Cart</Text>
          <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>
            Review items before checkout.
          </Text>
        </View>

        <FlatList
          data={items}
          keyExtractor={(l) => l.product.id}
          contentContainerStyle={{ gap: Spacing.sm, paddingBottom: Spacing.xxl }}
          renderItem={({ item }) => {
            const lineTotal = (item.product.price ?? 0) * item.quantity;
            return (
              <Card
                title={item.product.name}
                subtitle={`${item.quantity} × ${formatVnd(item.product.price ?? 0)}  •  ${formatVnd(lineTotal)}`}
                imageUrl={item.product.imageUrl}
                right={
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => dispatch(decrement({ productId: item.product.id }))}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: palette.border,
                        backgroundColor: palette.muted,
                      }}>
                      <Text style={{ color: palette.text, fontSize: 18 } as TextStyle}>-</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => dispatch(increment({ productId: item.product.id }))}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: palette.border,
                        backgroundColor: palette.muted,
                      }}>
                      <Text style={{ color: palette.text, fontSize: 18 } as TextStyle}>+</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => dispatch(removeFromCart({ productId: item.product.id }))}
                      style={{ paddingHorizontal: 6, paddingVertical: 6 }}>
                      <Text style={{ color: palette.danger, ...Typography.bodyBold } as TextStyle}>Remove</Text>
                    </Pressable>
                  </View>
                }
              />
            );
          }}
        />

        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: palette.border,
            paddingTop: Spacing.md,
            gap: Spacing.sm,
          }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>Total</Text>
            <Text style={{ color: palette.text, ...Typography.bodyBold } as TextStyle}>{formatVnd(total)}</Text>
          </View>
          <Button title="Clear cart" variant="secondary" onPress={() => dispatch(clearCart())} />
          <Button
            title="Checkout"
            onPress={() => {
              router.push('/checkout');
            }}
          />
        </View>
      </View>
    </Screen>
  );
};

