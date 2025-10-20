import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { SwapRequest, SwapMessage, SwapChat, SwapStats, CreateSwapRequestData, UpdateSwapRequestData } from '../types/swap';
import { UserBook } from '../types/book';
import { useAuth } from '../hooks/useAuth';
import { useUserBooks } from './UserBooksContext';

export interface BookSwapContextValue {
  // Swap Requests
  swapRequests: SwapRequest[];
  isLoading: boolean;
  error: string | null;
  
  // Create and manage swap requests
  createSwapRequest: (data: CreateSwapRequestData) => Promise<SwapRequest>;
  updateSwapRequest: (requestId: string, data: UpdateSwapRequestData) => Promise<void>;
  cancelSwapRequest: (requestId: string) => Promise<void>;
  acceptSwapRequest: (requestId: string) => Promise<void>;
  rejectSwapRequest: (requestId: string, reason?: string) => Promise<void>;
  completeSwapRequest: (requestId: string) => Promise<void>;
  
  // Get swap requests
  getSwapRequestById: (requestId: string) => SwapRequest | undefined;
  getSentRequests: () => SwapRequest[];
  getReceivedRequests: () => SwapRequest[];
  getSwapRequestsByStatus: (status: SwapRequest['status']) => SwapRequest[];
  getSwapStats: () => SwapStats;
  
  // Messages and Chat
  swapChats: SwapChat[];
  sendMessage: (swapRequestId: string, content: string) => Promise<void>;
  markMessagesAsRead: (swapRequestId: string) => Promise<void>;
  getSwapChat: (swapRequestId: string) => SwapChat | undefined;
  
  // Helper functions
  canRequestSwap: (bookId: string, ownerId: string) => boolean;
  getUserOfferedBooks: (userId: string) => UserBook[];
}

const BookSwapContext = createContext<BookSwapContextValue | undefined>(undefined);

interface BookSwapProviderProps {
  children: ReactNode;
}

export const BookSwapProvider: React.FC<BookSwapProviderProps> = ({ children }) => {
  const { state } = useAuth();
  const { userBooks, getUserBookByBookId } = useUserBooks();
  
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [swapChats, setSwapChats] = useState<SwapChat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSwapRequest = useCallback(async (data: CreateSwapRequestData): Promise<SwapRequest> => {
    if (!state.user) {
      throw new Error('Takas isteği göndermek için giriş yapmalısınız.');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check if there's already a pending request for this book
      const existingRequest = swapRequests.find(
        req => req.requestedBookId === data.requestedBookId && 
               req.requesterId === state.user!.id && 
               req.status === 'pending'
      );

      if (existingRequest) {
        throw new Error('Bu kitap için zaten bekleyen bir takas isteğiniz var.');
      }

      // Get book details - requestedBookId'yi direkt kullan çünkü bu başka kullanıcının kitabı
      // getUserBookByBookId sadece kendi kitaplarımızda arar, burada mock data kullanacağız
      let requestedBook;
      
      // Mock data - gerçek uygulamada API'den gelecek
      const allMockBooks = [
        { bookId: 'book-ali-1', title: 'Suç ve Ceza', authors: ['Fyodor Dostoyevski'], imageUrl: 'https://example.com/crime-punishment.jpg' },
        { bookId: 'book-ali-2', title: 'Dune', authors: ['Frank Herbert'], imageUrl: 'https://example.com/dune.jpg' },
        { bookId: 'book-zehra-1', title: 'Madame Bovary', authors: ['Gustave Flaubert'], imageUrl: 'https://example.com/madame-bovary.jpg' },
        { bookId: 'book-zehra-2', title: 'Osmanlı Tarihi', authors: ['Halil İnalcık'], imageUrl: 'https://example.com/ottoman-history.jpg' }
      ];
      
      const mockBook = allMockBooks.find(book => book.bookId === data.requestedBookId);
      if (!mockBook) {
        throw new Error('İstenen kitap bulunamadı.');
      }
      
        // eslint-disable-next-line prefer-const
      requestedBook = {
        id: mockBook.bookId,
        title: mockBook.title,
        authors: mockBook.authors,
        imageUrl: mockBook.imageUrl
      };

      let offeredBook;
      if (data.offeredBookId) {
        console.log('🔍 DEBUG - Teklif edilen kitap aranıyor:');
        console.log('- Aranan ID:', data.offeredBookId);
        console.log('- Mevcut userBooks:', userBooks.map(ub => ({ id: ub.id, bookId: ub.bookId, userId: ub.userId, title: ub.title })));
        console.log('- Current user ID:', state.user.id);
        
        // Hem UserBook id'si hem de bookId ile arama yap
        let offeredUserBook = getUserBookByBookId(data.offeredBookId);
        console.log('- getUserBookByBookId sonucu:', offeredUserBook);
        
        if (!offeredUserBook) {
          // UserBook id'si ile arama yap
          offeredUserBook = userBooks.find(ub => ub.id === data.offeredBookId);
          console.log('- userBooks.find sonucu:', offeredUserBook);
        }
        
        console.log('- Final offeredUserBook:', offeredUserBook);
        console.log('- Owner check:', offeredUserBook ? `${offeredUserBook.userId} === ${state.user.id}` : 'null');
        
        if (!offeredUserBook || offeredUserBook.userId !== state.user.id) {
          throw new Error('Teklif edilen kitap geçersiz.');
        }
        offeredBook = {
          id: offeredUserBook.bookId,
          title: offeredUserBook.title,
          authors: offeredUserBook.authors,
          imageUrl: offeredUserBook.imageUrl
        };
      }

      const newSwapRequest: SwapRequest = {
        id: `swap-${Date.now()}-${Math.random()}`,
        requesterId: state.user.id,
        requesterName: state.user.displayName,
        requesterAvatar: state.user.avatar,
        ownerId: data.ownerId,
        ownerName: 'Kitap Sahibi', // This would be fetched from user service in real app
        requestedBookId: data.requestedBookId,
        requestedBook: requestedBook,
        offeredBookId: data.offeredBookId,
        offeredBook,
        message: data.message,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: data.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days default
      };

      setSwapRequests(prev => [...prev, newSwapRequest]);
      return newSwapRequest;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Takas isteği gönderilirken bir hata oluştu.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state.user, swapRequests, getUserBookByBookId]);

  const updateSwapRequest = useCallback(async (requestId: string, data: UpdateSwapRequestData) => {
    try {
      setIsLoading(true);
      setError(null);

      setSwapRequests(prev => prev.map(req => {
        if (req.id === requestId) {
          const updates: Partial<SwapRequest> = {
            ...data,
            updatedAt: new Date()
          };

          return { ...req, ...updates };
        }
        return req;
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Takas isteği güncellenirken bir hata oluştu.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const acceptSwapRequest = useCallback(async (requestId: string) => {
    if (!state.user) {
      throw new Error('Bu işlemi yapmak için giriş yapmalısınız.');
    }

      // eslint-disable-next-line no-useless-catch
    try {
      await updateSwapRequest(requestId, { status: 'accepted' });
      
      // Create a chat for this swap
      const request = getSwapRequestById(requestId);
      if (request) {
        const newChat: SwapChat = {
          id: `chat-${requestId}`,
          swapRequestId: requestId,
          participantIds: [request.requesterId, request.ownerId],
          participants: [
            {
              id: request.requesterId,
              name: request.requesterName,
              avatar: request.requesterAvatar
            },
            {
              id: request.ownerId,
              name: request.ownerName
            }
          ],
          messages: [{
            id: `msg-${Date.now()}`,
            swapRequestId: requestId,
            senderId: 'system',
            senderName: 'Sistem',
            recipientId: '',
            content: 'Takas isteği kabul edildi! Artık mesajlaşabilirsiniz.',
            type: 'system',
            createdAt: new Date(),
            isRead: false
          }],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        setSwapChats(prev => [...prev, newChat]);
      }
    } catch (err) {
      throw err;
    }
  }, [state.user, updateSwapRequest]);

  const rejectSwapRequest = useCallback(async (requestId: string, reason?: string) => {
      // eslint-disable-next-line no-useless-catch
    try {
      await updateSwapRequest(requestId, { 
        status: 'rejected',
        message: reason 
      });
    } catch (err) {
      throw err;
    }
  }, [updateSwapRequest]);

  const cancelSwapRequest = useCallback(async (requestId: string) => {
      // eslint-disable-next-line no-useless-catch
    try {
      await updateSwapRequest(requestId, { status: 'cancelled' });
    } catch (err) {
      throw err;
    }
  }, [updateSwapRequest]);

  const completeSwapRequest = useCallback(async (requestId: string) => {
      // eslint-disable-next-line no-useless-catch
    try {
      await updateSwapRequest(requestId, { status: 'completed' });
      
      // Mark chat as inactive
      setSwapChats(prev => prev.map(chat => 
        chat.swapRequestId === requestId 
          ? { ...chat, isActive: false, updatedAt: new Date() }
          : chat
      ));
    } catch (err) {
      throw err;
    }
  }, [updateSwapRequest]);

  const sendMessage = useCallback(async (swapRequestId: string, content: string) => {
    if (!state.user) {
      throw new Error('Mesaj göndermek için giriş yapmalısınız.');
    }

    try {
      const chat = getSwapChat(swapRequestId);
      if (!chat) {
        throw new Error('Sohbet bulunamadı.');
      }

      const otherParticipant = chat.participants.find(p => p.id !== state.user!.id);
      if (!otherParticipant) {
        throw new Error('Alıcı bulunamadı.');
      }

      const newMessage: SwapMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        swapRequestId,
        senderId: state.user.id,
        senderName: state.user.displayName,
        senderAvatar: state.user.avatar,
        recipientId: otherParticipant.id,
        content,
        type: 'text',
        createdAt: new Date(),
        isRead: false
      };

      setSwapChats(prev => prev.map(chat => 
        chat.swapRequestId === swapRequestId
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              updatedAt: new Date()
            }
          : chat
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Mesaj gönderilirken bir hata oluştu.';
      setError(errorMessage);
      throw err;
    }
  }, [state.user]);

  const markMessagesAsRead = useCallback(async (swapRequestId: string) => {
    if (!state.user) return;

    setSwapChats(prev => prev.map(chat => 
      chat.swapRequestId === swapRequestId
        ? {
            ...chat,
            messages: chat.messages.map(msg => 
              msg.recipientId === state.user!.id ? { ...msg, isRead: true } : msg
            ),
            updatedAt: new Date()
          }
        : chat
    ));
  }, [state.user]);

  // Helper functions
  const getSwapRequestById = useCallback((requestId: string) => {
    return swapRequests.find(req => req.id === requestId);
  }, [swapRequests]);

  const getSentRequests = useCallback(() => {
    return state.user ? swapRequests.filter(req => req.requesterId === state.user!.id) : [];
  }, [swapRequests, state.user]);

  const getReceivedRequests = useCallback(() => {
    return state.user ? swapRequests.filter(req => req.ownerId === state.user!.id) : [];
  }, [swapRequests, state.user]);

  const getSwapRequestsByStatus = useCallback((status: SwapRequest['status']) => {
    return swapRequests.filter(req => req.status === status);
  }, [swapRequests]);

  const getSwapStats = useCallback((): SwapStats => {
    if (!state.user) {
      return {
        totalRequests: 0,
        pendingRequests: 0,
        acceptedRequests: 0,
        completedSwaps: 0,
        rejectedRequests: 0,
        sentRequests: 0,
        receivedRequests: 0
      };
    }

    const userRequests = swapRequests.filter(
      req => req.requesterId === state.user!.id || req.ownerId === state.user!.id
    );

    return {
      totalRequests: userRequests.length,
      pendingRequests: userRequests.filter(req => req.status === 'pending').length,
      acceptedRequests: userRequests.filter(req => req.status === 'accepted').length,
      completedSwaps: userRequests.filter(req => req.status === 'completed').length,
      rejectedRequests: userRequests.filter(req => req.status === 'rejected').length,
      sentRequests: getSentRequests().length,
      receivedRequests: getReceivedRequests().length
    };
  }, [swapRequests, state.user, getSentRequests, getReceivedRequests]);

  const getSwapChat = useCallback((swapRequestId: string) => {
    return swapChats.find(chat => chat.swapRequestId === swapRequestId);
  }, [swapChats]);

  const canRequestSwap = useCallback((bookId: string, ownerId: string) => {
    if (!state.user || state.user.id === ownerId) return false;
    
    // Check if there's already a pending request
    const existingRequest = swapRequests.find(
      req => req.requestedBookId === bookId && 
             req.requesterId === state.user!.id && 
             req.status === 'pending'
    );
    
    return !existingRequest;
  }, [state.user, swapRequests]);

  const getUserOfferedBooks = useCallback((userId: string) => {
    return userBooks.filter(ub => ub.userId === userId && ub.status === 'read');
  }, [userBooks]);

  const value: BookSwapContextValue = {
    swapRequests,
    isLoading,
    error,
    createSwapRequest,
    updateSwapRequest,
    cancelSwapRequest,
    acceptSwapRequest,
    rejectSwapRequest,
    completeSwapRequest,
    getSwapRequestById,
    getSentRequests,
    getReceivedRequests,
    getSwapRequestsByStatus,
    getSwapStats,
    swapChats,
    sendMessage,
    markMessagesAsRead,
    getSwapChat,
    canRequestSwap,
    getUserOfferedBooks
  };

  return (
    <BookSwapContext.Provider value={value}>
      {children}
    </BookSwapContext.Provider>
  );
};

export const useBookSwap = (): BookSwapContextValue => {
  const context = useContext(BookSwapContext);
  if (context === undefined) {
    throw new Error('useBookSwap must be used within a BookSwapProvider');
  }
  return context;
};