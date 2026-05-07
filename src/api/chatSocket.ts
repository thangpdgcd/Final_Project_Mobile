import { io, type Socket } from 'socket.io-client';

import { APP_CONFIG } from '@/constants/config';

let socketSingleton: Socket | null = null;
let socketToken: string | null = null;

export type ChatSocketClient = Socket;

export function getChatSocket(): ChatSocketClient | null {
  return socketSingleton;
}

export function disconnectChatSocket() {
  try {
    socketSingleton?.removeAllListeners();
    socketSingleton?.disconnect();
  } finally {
    socketSingleton = null;
    socketToken = null;
  }
}

export function connectChatSocket({ token }: { token: string }): ChatSocketClient {
  if (socketSingleton && socketToken === token && socketSingleton.connected) {
    return socketSingleton;
  }

  // Token changed or socket is stale.
  if (socketSingleton && socketToken !== token) {
    disconnectChatSocket();
  }

  const socket = io(APP_CONFIG.apiBaseUrl, {
    path: '/socket.io/',
    // Prefer websocket, fallback to polling (better on some networks).
    transports: ['websocket', 'polling'],
    autoConnect: true,
    auth: { token },
  });

  socketSingleton = socket;
  socketToken = token;
  return socket;
}
