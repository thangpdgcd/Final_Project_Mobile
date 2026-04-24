import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, RefreshControl, Text, TextStyle, View } from 'react-native';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchProducts, searchProducts, setQuery } from '@/redux/slices/productsSlice';

export const BrowseScreen = () => {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, status, error, query } = useAppSelector((s) => s.products);

  React.useEffect(() => {
    if (status === 'idle') dispatch(fetchProducts());
  }, [dispatch, status]);

  React.useEffect(() => {
    const q = query.trim();
    const t = setTimeout(() => {
      if (!q) dispatch(fetchProducts());
      else dispatch(searchProducts({ query: q }));
    }, 350);
    return () => clearTimeout(t);
  }, [dispatch, query]);

  const onRefresh = () => {
    const q = query.trim();
    if (!q) dispatch(fetchProducts());
    else dispatch(searchProducts({ query: q }));
  };

  if (status === 'failed') {
    return <ErrorState error={error} onRetry={onRefresh} />;
  }

  if (status !== 'loading' && items.length === 0) {
    return (
      <Screen>
        <EmptyState
          title="No products yet"
          description="When products are available, they’ll show up here."
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
            Search
          </Text>
          <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>
            Find products by name.
          </Text>
        </View>

        <TextField
          label="Search"
          value={query}
          onChangeText={(t) => dispatch(setQuery(t))}
          autoCapitalize="none"
          returnKeyType="search"
        />

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: Spacing.sm, paddingBottom: Spacing.xxl }}
          refreshControl={<RefreshControl refreshing={status === 'loading'} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <Card
              title={item.name}
              subtitle={item.description ?? undefined}
              imageUrl={item.imageUrl}
              onPress={() => {
                router.push(`/product/${item.id}`);
              }}
            />
          )}
        />
      </View>
    </Screen>
  );
};

