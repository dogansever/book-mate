import { User } from '../types/user';
import { UserBook } from '../types/book';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface BookApiResponse {
  users: User[];
  userBooks: UserBook[];
}

export class BookApiService {
  /**
   * Tüm kullanıcıları getirir
   */
  static async getUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const users = await response.json();
      
      // Date stringlerini Date objelerine çevir
      return users.map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt),
        lastLoginAt: new Date(user.lastLoginAt)
      }));
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  }

  /**
   * Belirli bir kullanıcının kitaplarını getirir
   */
  static async getUserBooks(userId: string): Promise<UserBook[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/userBooks?userId=${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const books = await response.json();
      
      // Date stringlerini Date objelerine çevir
      return books.map((book: any) => ({
        ...book,
        dateAdded: new Date(book.dateAdded),
        dateStarted: book.dateStarted ? new Date(book.dateStarted) : undefined,
        dateFinished: book.dateFinished ? new Date(book.dateFinished) : undefined
      }));
    } catch (error) {
      console.error('Failed to fetch user books:', error);
      throw error;
    }
  }

  /**
   * Tüm kitapları getirir (arama için)
   */
  static async getAllBooks(): Promise<UserBook[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/userBooks`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const books = await response.json();
      
      // Date stringlerini Date objelerine çevir
      return books.map((book: any) => ({
        ...book,
        dateAdded: new Date(book.dateAdded),
        dateStarted: book.dateStarted ? new Date(book.dateStarted) : undefined,
        dateFinished: book.dateFinished ? new Date(book.dateFinished) : undefined
      }));
    } catch (error) {
      console.error('Failed to fetch all books:', error);
      throw error;
    }
  }

  /**
   * Yeni bir kullanıcı kitabı ekler
   */
  static async addUserBook(book: Omit<UserBook, 'id'>): Promise<UserBook> {
    try {
      const bookData = {
        ...book,
        id: `ub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        dateAdded: book.dateAdded.toISOString(),
        dateStarted: book.dateStarted?.toISOString(),
        dateFinished: book.dateFinished?.toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/userBooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedBook = await response.json();
      
      // Date stringlerini Date objelerine çevir
      return {
        ...savedBook,
        dateAdded: new Date(savedBook.dateAdded),
        dateStarted: savedBook.dateStarted ? new Date(savedBook.dateStarted) : undefined,
        dateFinished: savedBook.dateFinished ? new Date(savedBook.dateFinished) : undefined
      };
    } catch (error) {
      console.error('Failed to add user book:', error);
      throw error;
    }
  }

  /**
   * Bir kullanıcı kitabını günceller
   */
  static async updateUserBook(bookId: string, updates: Partial<UserBook>): Promise<UserBook> {
    try {
      const updateData = {
        ...updates,
        dateAdded: updates.dateAdded?.toISOString(),
        dateStarted: updates.dateStarted?.toISOString(),
        dateFinished: updates.dateFinished?.toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/userBooks/${bookId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedBook = await response.json();
      
      // Date stringlerini Date objelerine çevir
      return {
        ...updatedBook,
        dateAdded: new Date(updatedBook.dateAdded),
        dateStarted: updatedBook.dateStarted ? new Date(updatedBook.dateStarted) : undefined,
        dateFinished: updatedBook.dateFinished ? new Date(updatedBook.dateFinished) : undefined
      };
    } catch (error) {
      console.error('Failed to update user book:', error);
      throw error;
    }
  }

  /**
   * Bir kullanıcı kitabını siler
   */
  static async deleteUserBook(bookId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/userBooks/${bookId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to delete user book:', error);
      throw error;
    }
  }

  /**
   * Şehre göre kullanıcıları getirir
   */
  static async getUsersByCity(city: string): Promise<User[]> {
    try {
      const users = await this.getUsers();
      return users.filter(user => user.profile?.city === city);
    } catch (error) {
      console.error('Failed to fetch users by city:', error);
      throw error;
    }
  }

  /**
   * Türe göre kitapları getirir
   */
  static async getBooksByGenre(genre: string): Promise<UserBook[]> {
    try {
      const books = await this.getAllBooks();
      
      // Mock implementation - gerçekte kitap türleri categorize edilmiş olur
      const genreKeywords: { [key: string]: string[] } = {
        'Roman': ['Madame Bovary', 'Aşk', 'Varolmanın Dayanılmaz Hafifliği', 'Benim Adım Kırmızı'],
        'Bilim Kurgu': ['Dune', 'Foundation', 'Neuromancer'],
        'Kişisel Gelişim': ['Atomik Alışkanlıklar', 'Cesaret Etmek', 'Sapiens'],
        'Sanat': ['Görme Biçimleri', 'Fotoğraf Üzerine'],
        'Klasik': ['Suç ve Ceza', 'Madame Bovary', 'Beyaz Diş'],
        'Tarih': ['İstanbul: Hatıralar ve Şehir', 'Sapiens']
      };
      
      const keywords = genreKeywords[genre] || [];
      return books.filter(book => 
        keywords.some(keyword => book.title.includes(keyword))
      );
    } catch (error) {
      console.error('Failed to fetch books by genre:', error);
      throw error;
    }
  }

  /**
   * Follow ilişkilerini getirir
   */
  static async getFollowRelationships(userId?: string): Promise<any[]> {
    try {
      let url = `${API_BASE_URL}/followRelationships`;
      if (userId) {
        url += `?followerId=${userId}&followingId=${userId}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch follow relationships:', error);
      throw error;
    }
  }

  /**
   * Bir kullanıcıyı takip eder
   */
  static async followUser(followerId: string, followingId: string): Promise<any> {
    try {
      const followData = {
        id: `fr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        followerId,
        followingId,
        createdAt: new Date().toISOString(),
        isActive: true
      };

      const response = await fetch(`${API_BASE_URL}/followRelationships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(followData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to follow user:', error);
      throw error;
    }
  }

  /**
   * Bir kullanıcıyı takipten çıkarır
   */
  static async unfollowUser(followerId: string, followingId: string): Promise<void> {
    try {
      // Önce ilişkiyi bul
      const relationships = await this.getFollowRelationships();
      const relationship = relationships.find(
        rel => rel.followerId === followerId && rel.followingId === followingId && rel.isActive
      );

      if (!relationship) {
        throw new Error('Follow relationship not found');
      }

      // İlişkiyi sil
      const response = await fetch(`${API_BASE_URL}/followRelationships/${relationship.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to unfollow user:', error);
      throw error;
    }
  }

  /**
   * Kullanıcı istatistiklerini getirir
   */
  static async getUserStats(userId?: string): Promise<any[]> {
    try {
      let url = `${API_BASE_URL}/userStats`;
      if (userId) {
        url += `?userId=${userId}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      throw error;
    }
  }

  /**
   * Önerilen kullanıcıları getirir (henüz takip edilmeyenler)
   */
  static async getSuggestedUsers(userId: string): Promise<User[]> {
    try {
      // Tüm kullanıcıları al
      const allUsers = await this.getUsers();
      
      // Bu kullanıcının takip ettiklerini al
      const relationships = await this.getFollowRelationships();
      const followingIds = relationships
        .filter(rel => rel.followerId === userId && rel.isActive)
        .map(rel => rel.followingId);

      // Kendisi ve takip ettiklerini çıkar
      return allUsers.filter(user => 
        user.id !== userId && !followingIds.includes(user.id)
      );
    } catch (error) {
      console.error('Failed to fetch suggested users:', error);
      throw error;
    }
  }

  // ===== MEETUP API METHODS =====

  /**
   * Tüm meetupları getirir (owner bilgileri ile birlikte)
   */
  static async getMeetups(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/meetups`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const meetups = await response.json();
      
      // Tüm kullanıcıları al (owner bilgileri için)
      const users = await this.getUsers();
      
      // Date stringlerini Date objelerine çevir ve owner bilgilerini ekle
      return meetups.map((meetup: any) => {
        const owner = users.find(user => user.id === meetup.createdBy);
        return {
          ...meetup,
          createdAt: new Date(meetup.createdAt),
          updatedAt: new Date(meetup.updatedAt),
          owner: owner || {
            id: meetup.createdBy,
            displayName: `Kullanıcı ${meetup.createdBy}`,
            avatar: '/default-avatar.png'
          }
        };
      });
    } catch (error) {
      console.error('Failed to fetch meetups:', error);
      throw error;
    }
  }

  /**
   * Belirli bir meetup'ı getirir
   */
  static async getMeetup(meetupId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/meetups/${meetupId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const meetup = await response.json();
      
      return {
        ...meetup,
        createdAt: new Date(meetup.createdAt),
        updatedAt: new Date(meetup.updatedAt)
      };
    } catch (error) {
      console.error('Failed to fetch meetup:', error);
      throw error;
    }
  }

  /**
   * Yeni bir meetup oluşturur
   */
  static async createMeetup(meetupData: any): Promise<any> {
    try {
      const newMeetup = {
        ...meetupData,
        id: `meetup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        memberCount: 1,
        members: [meetupData.createdBy],
        status: 'active',
        isActive: true
      };

      const response = await fetch(`${API_BASE_URL}/meetups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMeetup),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedMeetup = await response.json();
      
      // Meetup üyesi olarak da ekle
      await this.addMeetupMember(savedMeetup.id, meetupData.createdBy, 'owner');
      
      return {
        ...savedMeetup,
        createdAt: new Date(savedMeetup.createdAt),
        updatedAt: new Date(savedMeetup.updatedAt)
      };
    } catch (error) {
      console.error('Failed to create meetup:', error);
      throw error;
    }
  }

  /**
   * Meetup üyelerini getirir
   */
  static async getMeetupMembers(meetupId: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/meetupMembers?meetupId=${meetupId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const members = await response.json();
      
      return members.map((member: any) => ({
        ...member,
        joinedAt: new Date(member.joinedAt)
      }));
    } catch (error) {
      console.error('Failed to fetch meetup members:', error);
      throw error;
    }
  }

  /**
   * Meetup'a üye ekler
   */
  static async addMeetupMember(meetupId: string, userId: string, role: 'owner' | 'member' = 'member'): Promise<any> {
    try {
      const memberData = {
        id: `mm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        meetupId,
        userId,
        role,
        status: 'active',
        joinedAt: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/meetupMembers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedMember = await response.json();
      
      // Meetup member count'ını güncelle
      await this.updateMeetupMemberCount(meetupId);
      
      return {
        ...savedMember,
        joinedAt: new Date(savedMember.joinedAt)
      };
    } catch (error) {
      console.error('Failed to add meetup member:', error);
      throw error;
    }
  }

  /**
   * Meetup üye sayısını günceller
   */
  static async updateMeetupMemberCount(meetupId: string): Promise<void> {
    try {
      const members = await this.getMeetupMembers(meetupId);
      const activeMembers = members.filter(member => member.status === 'active');
      
      const response = await fetch(`${API_BASE_URL}/meetups/${meetupId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberCount: activeMembers.length,
          members: activeMembers.map(member => member.userId),
          updatedAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to update meetup member count:', error);
      throw error;
    }
  }

  /**
   * Meetup mesajlarını getirir
   */
  static async getMeetupMessages(meetupId: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/meetupMessages?meetupId=${meetupId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const messages = await response.json();
      
      return messages.map((message: any) => ({
        ...message,
        createdAt: new Date(message.createdAt),
        editedAt: message.editedAt ? new Date(message.editedAt) : undefined
      }));
    } catch (error) {
      console.error('Failed to fetch meetup messages:', error);
      throw error;
    }
  }

  /**
   * Meetup'a mesaj gönderir
   */
  static async sendMeetupMessage(meetupId: string, userId: string, content: string, type: string = 'text', metadata?: any): Promise<any> {
    try {
      const messageData = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        meetupId,
        userId,
        content,
        type,
        metadata,
        createdAt: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/meetupMessages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedMessage = await response.json();
      
      return {
        ...savedMessage,
        createdAt: new Date(savedMessage.createdAt)
      };
    } catch (error) {
      console.error('Failed to send meetup message:', error);
      throw error;
    }
  }

  /**
   * Meetup toplantı programlarını getirir
   */
  static async getMeetingSchedules(meetupId: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/meetingSchedules?meetupId=${meetupId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch meeting schedules:', error);
      throw error;
    }
  }

  /**
   * Kullanıcının katıldığı meetupları getirir
   */
  static async getUserMeetups(userId: string): Promise<any[]> {
    try {
      // Kullanıcının üye olduğu meetupları bul
      const members = await fetch(`${API_BASE_URL}/meetupMembers?userId=${userId}`);
      if (!members.ok) {
        throw new Error(`HTTP error! status: ${members.status}`);
      }
      const memberData = await members.json();
      const activeMemberships = memberData.filter((member: any) => member.status === 'active');
      
      // Her meetup için detay bilgileri al
      const meetups = [];
      for (const member of activeMemberships) {
        const meetup = await this.getMeetup(member.meetupId);
        meetups.push({
          ...meetup,
          userRole: member.role,
          joinedAt: new Date(member.joinedAt)
        });
      }
      
      return meetups;
    } catch (error) {
      console.error('Failed to fetch user meetups:', error);
      throw error;
    }
  }

  /**
   * Kullanıcı profilini getirir
   */
  static async getUserProfile(userId: string): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const user = await response.json();
      
      // Date stringlerini Date objelerine çevir
      return {
        ...user,
        createdAt: new Date(user.createdAt),
        updatedAt: user.updatedAt ? new Date(user.updatedAt) : undefined,
        lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined
      };
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  }

  /**
   * Kullanıcı profilini günceller
   */
  static async updateUserProfile(userId: string, profileData: Partial<User>): Promise<User> {
    try {
      const updateData = {
        ...profileData,
        updatedAt: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedUser = await response.json();
      
      // Date stringlerini Date objelerine çevir
      return {
        ...updatedUser,
        createdAt: new Date(updatedUser.createdAt),
        updatedAt: updatedUser.updatedAt ? new Date(updatedUser.updatedAt) : undefined,
        lastLoginAt: updatedUser.lastLoginAt ? new Date(updatedUser.lastLoginAt) : undefined
      };
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }

  /**
   * Yeni kullanıcı oluşturur
   */
  static async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt'>): Promise<User> {
    try {
      const newUserData = {
        ...userData,
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUserData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const createdUser = await response.json();
      
      // Date stringlerini Date objelerine çevir
      return {
        ...createdUser,
        createdAt: new Date(createdUser.createdAt),
        updatedAt: createdUser.updatedAt ? new Date(createdUser.updatedAt) : undefined,
        lastLoginAt: createdUser.lastLoginAt ? new Date(createdUser.lastLoginAt) : undefined
      };
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }
}

export default BookApiService;