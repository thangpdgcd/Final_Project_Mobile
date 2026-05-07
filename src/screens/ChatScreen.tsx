import React from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import type { Socket } from 'socket.io-client';

import type { ChatMessage } from '@/api/chatTypes';
import { getMessagesApi } from '@/api/chat';
import { connectChatSocket, disconnectChatSocket } from '@/api/chatSocket';
import { getOnlineStaffApi } from '@/api/presence';
import { t } from '@/i18n/t';
import { Screen } from '@/components/Screen';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppSelector } from '@/redux/hooks';

type LegacyReceiveMessagePayload = {
  from?: { userId?: number | string; role?: string };
  to?: { room?: string; userId?: number | string };
  message?: { type?: string; content?: unknown } | string | null;
  ts?: number;
};

const normalizeMessage = (raw: unknown, fallbackConversationId?: number | null): ChatMessage | null => {
  if (!raw || typeof raw !== 'object') return null;

  // New payload shape (conversation-based): { id, conversationId, senderUserId, createdAt, ... }
  const msg = raw as Partial<ChatMessage>;
  if (
    typeof msg.id === 'number' &&
    typeof msg.conversationId === 'number' &&
    typeof msg.senderUserId === 'number' &&
    typeof msg.createdAt === 'string'
  ) {
    return {
      id: msg.id,
      conversationId: msg.conversationId,
      senderUserId: msg.senderUserId,
      senderRoleId: msg.senderRoleId ?? null,
      type: msg.type === 'action' ? 'action' : 'text',
      content: msg.content ?? null,
      action: msg.action ?? null,
      meta: msg.meta ?? null,
      createdAt: msg.createdAt,
    };
  }

  // Legacy payload shape (room-based): { from, to, message, ts }
  const legacy = raw as LegacyReceiveMessagePayload;
  const ts = typeof legacy.ts === 'number' && Number.isFinite(legacy.ts) ? legacy.ts : Date.now();
  const fromIdRaw = legacy.from?.userId;
  const senderUserId = typeof fromIdRaw === 'number' ? fromIdRaw : Number(fromIdRaw);
  if (!Number.isFinite(senderUserId)) return null;

  const body =
    typeof legacy.message === 'string'
      ? legacy.message
      : legacy.message && typeof legacy.message === 'object'
        ? (legacy.message as { content?: unknown }).content
        : null;
  const content = body == null ? '' : String(body);

  return {
    id: ts, // stable enough for UI (ms timestamp)
    conversationId: typeof fallbackConversationId === 'number' ? fallbackConversationId : 0,
    senderUserId,
    senderRoleId: null,
    type: 'text',
    content,
    action: null,
    meta: legacy,
    createdAt: new Date(ts).toISOString(),
  };
};

export const ChatScreen = () => {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const whiteText = scheme === 'dark' ? 'rgba(255,255,255,0.92)' : '#ffffff';
  const token = useAppSelector((s) => s.auth.token);
  const me = useAppSelector((s) => s.auth.user);

  const [socketStatus, setSocketStatus] = React.useState<'idle' | 'connecting' | 'connected' | 'error'>(
    'idle',
  );
  const [supportOnline, setSupportOnline] = React.useState<boolean | null>(null);
  const [conversationId, setConversationId] = React.useState<number | null>(null);
  const conversationIdRef = React.useRef<number | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [draft, setDraft] = React.useState('');
  const [errorText, setErrorText] = React.useState<string | null>(null);

  const myId = me?.id ? Number(me.id) : NaN;

  const appendMessage = React.useCallback((msg: ChatMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });
  }, []);

  React.useEffect(() => {
    if (!token) return;

    let socket: Socket | null = null;
    let cancelled = false;

    const start = async () => {
      setErrorText(null);
      setSocketStatus('connecting');

      socket = connectChatSocket({ token });

      const onConnect = () => !cancelled && setSocketStatus('connected');
      const onDisconnect = () => !cancelled && setSocketStatus('connecting');
      const onConnectError = (e: unknown) => {
        if (cancelled) return;
        setSocketStatus('error');
        setErrorText(e instanceof Error ? e.message : 'Socket connect error');
      };

      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('connect_error', onConnectError);

      // Join support conversation (auto-assign staff). Server returns { ok, conversationId } via ack.
      const join = () =>
        new Promise<number>((resolve, reject) => {
          socket?.emit('join_room', {}, (ack: unknown) => {
            const a = ack as
              | { ok?: boolean; conversationId?: number; message?: string; error?: string }
              | undefined;
            if (a?.ok && typeof a.conversationId === 'number') return resolve(a.conversationId);
            return reject(new Error(a?.message || a?.error || 'join_room failed'));
          });
        });

      try {
        const cid = await join();
        if (cancelled) return;
        setConversationId(cid);
        conversationIdRef.current = cid;

        const history = await getMessagesApi(cid, { limit: 50, offset: 0 });
        if (!cancelled) {
          const sorted = [...history].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
          setMessages(sorted);
        }
      } catch (e) {
        if (cancelled) return;
        setErrorText(e instanceof Error ? e.message : 'Unable to join conversation');
      }

      socket.on('receive_message', (payload: unknown) => {
        // Support both:
        // - conversation payload: { conversationId, message: {id, conversationId, senderUserId, createdAt, ... } }
        // - legacy payload: { from, to, message: {type, content}, ts }
        const p = payload as any;
        const isConversationPayload =
          p && typeof p === 'object' && typeof p.conversationId === 'number' && 'message' in p;

        const rawForNormalize = isConversationPayload ? p.message : payload;
        const msg = normalizeMessage(rawForNormalize, conversationIdRef.current);
        if (!msg) return;
        appendMessage(msg);
      });
    };

    start();

    return () => {
      cancelled = true;
      try {
        socket?.removeAllListeners('receive_message');
        socket?.removeAllListeners('connect');
        socket?.removeAllListeners('disconnect');
        socket?.removeAllListeners('connect_error');
      } finally {
        // Keep singleton connection simple: disconnect when leaving chat screen.
        disconnectChatSocket();
      }
    };
  }, [appendMessage, token]);

  React.useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const refresh = async () => {
      try {
        const staff = await getOnlineStaffApi();
        if (!cancelled) setSupportOnline(staff.length > 0);
      } catch {
        if (!cancelled) setSupportOnline(null);
      }
    };

    refresh();
    const t = setInterval(refresh, 7000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [token]);

  const onSend = React.useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    if (!token) return;

    const cid = conversationId;
    const socket = connectChatSocket({ token });

    setDraft('');
    setErrorText(null);

    socket.emit(
      'chat:message',
      { conversationId: cid ?? undefined, type: 'text', content: text },
      (ack: unknown) => {
        const a = ack as
          | {
              ok?: boolean;
              conversationId?: number;
              message?: ChatMessage;
              roomId?: string;
              error?: string;
              messageText?: string;
            }
          | undefined;
        if (!a?.ok) {
          setErrorText(a?.error || a?.messageText || 'Send failed');
          return;
        }
        if (typeof a.conversationId === 'number') setConversationId(a.conversationId);
        const saved = normalizeMessage(a.message);
        if (saved) appendMessage(saved);
      },
    );
  }, [appendMessage, conversationId, draft, token]);

  const Bubble = ({ item }: { item: ChatMessage }) => {
    const mine = Number.isFinite(myId) && item.senderUserId === myId;
    const bg = mine ? palette.tint : palette.surface;
    const fg = mine ? '#ffffff' : palette.text;
    const align: ViewStyle['alignSelf'] = mine ? 'flex-end' : 'flex-start';
    const mineTimeColor = mine ? 'rgba(255,255,255,0.8)' : palette.icon;

    const text =
      item.type === 'action' ? (item.action ? `[${item.action}]` : '[ACTION]') : (item.content ?? '');

    return (
      <View
        style={{
          alignSelf: align,
          maxWidth: '85%',
          backgroundColor: bg,
          borderRadius: Radius.lg,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          borderWidth: mine ? 0 : 1,
          borderColor: palette.border,
        }}
      >
        <Text style={{ color: fg, ...Typography.body } as TextStyle}>{text}</Text>
        <Text
          style={
            {
              marginTop: 6,
              color: mineTimeColor,
              fontSize: 11,
              ...Typography.body,
            } as TextStyle
          }
        >
          {new Date(item.createdAt).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={{ flex: 1, gap: Spacing.md }}>
          <View style={{ gap: 4 }}>
            <Text style={{ color: palette.text, fontSize: 22, ...Typography.bodyBold } as TextStyle}>
              {t('chat')}
            </Text>
            <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>
              {t('status')}: {socketStatus}
            </Text>
            <Text style={{ color: palette.icon, ...Typography.body } as TextStyle}>
              {t('support')}: {supportOnline == null ? '—' : supportOnline ? t('online') : t('offline')}
            </Text>
            {errorText ? <Text style={{ color: palette.danger } as TextStyle}>{errorText}</Text> : null}
          </View>

          <FlatList
            data={messages}
            keyExtractor={(m) => String(m.id)}
            contentContainerStyle={{ gap: Spacing.sm, paddingBottom: Spacing.lg }}
            renderItem={({ item }) => <Bubble item={item} />}
          />

          <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-end' }}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={t('typeMessage')}
              placeholderTextColor={scheme === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(47,31,24,0.35)'}
              multiline
              style={
                {
                  flex: 1,
                  minHeight: 44,
                  maxHeight: 120,
                  borderRadius: Radius.md,
                  borderWidth: 1,
                  borderColor: palette.border,
                  backgroundColor: palette.surface,
                  paddingHorizontal: Spacing.md,
                  paddingVertical: 10,
                  color: palette.text,
                  ...Typography.body,
                } as TextStyle
              }
            />
            <Pressable
              accessibilityRole="button"
              onPress={onSend}
              style={
                {
                  height: 44,
                  paddingHorizontal: 16,
                  borderRadius: Radius.md,
                  backgroundColor: palette.tint,
                  justifyContent: 'center',
                  opacity: draft.trim().length === 0 ? 0.6 : 1,
                } as ViewStyle
              }
            >
              <Text style={{ color: whiteText, ...Typography.bodyBold } as TextStyle}>{t('send')}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};
