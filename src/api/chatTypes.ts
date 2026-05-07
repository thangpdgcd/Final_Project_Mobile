export type ChatMessageType = 'text' | 'action';

export type ChatMessage = {
  id: number;
  conversationId: number;
  senderUserId: number;
  senderRoleId?: string | null;
  type: ChatMessageType;
  content?: string | null;
  action?: string | null;
  meta?: unknown;
  createdAt: string;
};

export type ConversationPreview = {
  id: number;
  conversationId: number;
  type: string;
  status: string;
  createdByUserId: number;
  createdAt: string;
  updatedAt: string;
  participants: {
    userId: number;
    roleAtJoin?: string | null;
    createdAt?: string;
  }[];
  lastMessageAt?: string | null;
  lastMessagePreview?: string | null;
  lastMessage?: unknown;
};

export type ConversationListResponse = {
  items: ConversationPreview[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
    nextOffset: number | null;
  };
};
