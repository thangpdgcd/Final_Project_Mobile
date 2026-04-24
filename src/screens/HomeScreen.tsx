import React from 'react';
import { FlatList, Pressable, Text, TextStyle, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchProducts } from '@/redux/slices/productsSlice';
import { addToCart } from '@/redux/slices/cartSlice';

export const HomeScreen = () => {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const { items: products, status } = useAppSelector((s) => s.products);

  React.useEffect(() => {
    if (status === 'idle') dispatch(fetchProducts());
  }, [dispatch, status]);

  return (
    <Screen>
      <View style={{ flex: 1, gap: Spacing.lg }}>
        <View style={{ gap: Spacing.sm }}>
          <Text style={{ color: palette.text, fontSize: 34, ...Typography.display } as TextStyle}>
            Arabica
          </Text>
          <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>
            {user?.name ? `Welcome, ${user.name}.` : 'Welcome.'} Browse and book in seconds.
          </Text>
        </View>

        <View style={{ gap: Spacing.sm, flex: 1 }}>
          <Text style={{ color: palette.text, ...Typography.bodyBold } as TextStyle}>Featured products</Text>
          <FlatList
            data={products.slice(0, 8)}
            keyExtractor={(p) => p.id}
            contentContainerStyle={{ gap: Spacing.sm, paddingBottom: Spacing.xxl }}
            renderItem={({ item }) => (
              <Card
                title={item.name}
                subtitle={item.description ?? undefined}
                imageUrl={item.imageUrl}
                right={
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => dispatch(addToCart({ product: item }))}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: palette.tint,
                    }}>
                    <Text style={{ color: '#fff', ...Typography.bodyBold } as TextStyle}>Add</Text>
                  </Pressable>
                }
              />
            )}
          />
        </View>
      </View>
    </Screen>
  );
};

