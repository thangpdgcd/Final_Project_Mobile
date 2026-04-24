import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { STORAGE_KEYS } from "@/constants/storage";

const isWeb = Platform.OS === "web";

const toSecureStoreKey = (key: string) => key.replace(/[^a-zA-Z0-9._-]/g, "_");

const getItem = async (key: string): Promise<string | null> => {
  if (isWeb) {
    try {
      const v = globalThis?.localStorage?.getItem(key);
      return typeof v === "string" ? v : null;
    } catch {
      return null;
    }
  }
  const secureKey = toSecureStoreKey(key);
  const v = await SecureStore.getItemAsync(secureKey);
  if (v != null) return v;
  // Best-effort: in case legacy key was ever stored directly.
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
};

const setItem = async (key: string, value: string): Promise<void> => {
  if (isWeb) {
    try {
      globalThis?.localStorage?.setItem(key, value);
    } catch {
      // ignore
    }
    return;
  }
  await SecureStore.setItemAsync(toSecureStoreKey(key), value);
};

const removeItem = async (key: string): Promise<void> => {
  if (isWeb) {
    try {
      globalThis?.localStorage?.removeItem(key);
    } catch {
      // ignore
    }
    return;
  }
  const secureKey = toSecureStoreKey(key);
  await SecureStore.deleteItemAsync(secureKey);
  // Best-effort cleanup legacy key.
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // ignore
  }
};

export const getStoredAuthToken = async (): Promise<string | null> => {
  return await getItem(STORAGE_KEYS.authToken);
};

export const setStoredAuthToken = async (token: string): Promise<void> => {
  await setItem(STORAGE_KEYS.authToken, token);
};

export const clearStoredAuthToken = async (): Promise<void> => {
  await removeItem(STORAGE_KEYS.authToken);
};

export const getStoredAuthUser = async (): Promise<string | null> => {
  return await getItem(STORAGE_KEYS.authUser);
};

export const setStoredAuthUser = async (rawJson: string): Promise<void> => {
  await setItem(STORAGE_KEYS.authUser, rawJson);
};

export const clearStoredAuthUser = async (): Promise<void> => {
  await removeItem(STORAGE_KEYS.authUser);
};

export const clearStoredAuth = async (): Promise<void> => {
  await Promise.all([
    removeItem(STORAGE_KEYS.authToken),
    removeItem(STORAGE_KEYS.authUser),
  ]);
};
