export const API_BASE_URL =
  (typeof process !== 'undefined' &&
    process.env &&
    typeof process.env.EXPO_PUBLIC_API_URL === 'string' &&
    process.env.EXPO_PUBLIC_API_URL.trim().length > 0
    ? process.env.EXPO_PUBLIC_API_URL.trim()
    : 'http://192.168.1.10:8080'
  ).replace(/\/+$/, '');

console.log('API_BASE_URL =', API_BASE_URL);

