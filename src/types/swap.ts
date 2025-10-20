export interface SwapRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar?: string;
  ownerId: string;
  ownerName: string;
  requestedBookId: string;
  requestedBook: {
    id: string;
    title: string;
    authors: string[];
    imageUrl?: string;
  };
  offeredBookId?: string;
  offeredBook?: {
    id: string;
    title: string;
    authors: string[];
    imageUrl?: string;
  };
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface SwapMessage {
  id: string;
  swapRequestId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  content: string;
  type: 'text' | 'image' | 'system';
  createdAt: Date;
  isRead: boolean;
}

export interface SwapChat {
  id: string;
  swapRequestId: string;
  participantIds: string[];
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  messages: SwapMessage[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SwapFilters {
  status?: SwapRequest['status'][];
  userId?: string;
  type?: 'sent' | 'received' | 'all';
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface SwapStats {
  totalRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  completedSwaps: number;
  rejectedRequests: number;
  sentRequests: number;
  receivedRequests: number;
}

export interface CreateSwapRequestData {
  requestedBookId: string;
  ownerId: string;
  offeredBookId?: string;
  message?: string;
  expiresAt?: Date;
}

export interface UpdateSwapRequestData {
  status?: SwapRequest['status'];
  message?: string;
  offeredBookId?: string;
}