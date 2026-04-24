import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Text, TextStyle, View } from 'react-native';
import { Image } from 'expo-image';

import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import { Screen } from '@/components/Screen';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addToCart } from '@/redux/slices/cartSlice';
import { fetchProductById } from '@/redux/slices/productsSlice';

export const ProductDetailScreen = () => {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const { items, status, error } = useAppSelector((s) => s.products);
  const product = items.find((p) => p.id === id);

  const priceText =
    product?.price != null ? `${product.price.toLocaleString('vi-VN')}₫` : undefined;

  React.useEffect(() => {
    if (id && !product) {
      dispatch(fetchProductById({ id }));
    }
  }, [dispatch, id, product]);

  if (status === 'failed') {
    return <ErrorState error={error} onRetry={() => dispatch(fetchProductById({ id }))} />;
  }

  return (
    <Screen>
      <View style={{ flex: 1, gap: Spacing.lg }}>
        <View
          style={{
            height: 240,
            borderRadius: 22,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: palette.border,
            backgroundColor: palette.muted,
          }}>
          {product?.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: palette.icon, ...Typography.bodyBold } as TextStyle}>No image</Text>
            </View>
          )}
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ color: palette.text, fontSize: 34, ...Typography.display } as TextStyle}>
            {product?.name ?? 'Detail'}
          </Text>
          {product?.category ? (
            <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>{product.category}</Text>
          ) : null}
          {priceText ? (
            <Text style={{ color: palette.text, fontSize: 18, ...Typography.bodyBold } as TextStyle}>{priceText}</Text>
          ) : null}
          <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>
            {product?.description ?? 'Loading product details…'}
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        <View style={{ gap: Spacing.sm }}>
          <Button
            title="Add to cart"
            onPress={() => {
              if (!product) return;
              dispatch(addToCart({ product }));
              router.push('/(tabs)/cart');
            }}
            disabled={!product || status === 'loading'}
          />
          <Button title="Back" variant="secondary" onPress={() => router.back()} />
        </View>
      </View>
    </Screen>
  );
};

