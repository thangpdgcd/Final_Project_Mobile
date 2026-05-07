import { http } from '@/api/http';
import type { ChatMessage, ConversationListResponse, ConversationPreview } from '@/api/chatTypes';

export async function listConversationsApi(params?: { limit?: number; offset?: number; mineOnly?: boolean }) {
  const res = await http.get<ConversationListResponse>('/conversations', { params });
  return res.data;
}

export async function findOrCreateDirectConversationApi(payload: { recipientUserId: number }) {
  const res = await http.post<ConversationPreview>('/conversations/direct', payload);
  return res.data;
}

export async function getConversationApi(conversationId: number) {
  const res = await http.get<ConversationPreview>(`/conversations/${conversationId}`);
  return res.data;
}

export async function getMessagesApi(conversationId: number, params?: { limit?: number; offset?: number }) {
  const res = await http.get<ChatMessage[]>(`/messages/${conversationId}`, { params });
  return res.data;
}

export async function sendMessageApi(payload: {
  conversationId?: number | null;
  recipientUserId?: number | null;
  type?: 'text' | 'action';
  content?: string;
  action?: string;
  meta?: unknown;
}) {
  const res = await http.post<{ conversationId: number; message: ChatMessage }>('/messages', payload);
  return res.data;
}
