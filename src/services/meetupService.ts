import { 
  Meetup, 
  CreateMeetupData, 
  UpdateMeetupData, 
  JoinMeetupData,
  CreateMessageData,
  CreateMeetingData,
  MeetupFilters, 
  MeetupStats,
  MeetupMember,
  MeetupMessage,
  MeetingSchedule,
  MeetupInvitation,
  CreateInvitationData,
  RespondToInvitationData
} from '../types/meetup';
import BookApiService from './bookApiService';

export class MeetupService {
  /**
   * Tüm meetupları getirir
   */
  static async getAllMeetups(filters?: MeetupFilters): Promise<Meetup[]> {
    try {
      let meetups = await BookApiService.getMeetups();
      
      // Filtreleri uygula
      if (filters) {
        if (filters.category) {
          meetups = meetups.filter(meetup => meetup.category === filters.category);
        }
        if (filters.theme) {
          meetups = meetups.filter(meetup => meetup.theme.toLowerCase().includes(filters.theme!.toLowerCase()));
        }
        if (filters.status) {
          meetups = meetups.filter(meetup => meetup.status === filters.status);
        }
      }
      
      return meetups;
    } catch (error) {
      console.error('Failed to get all meetups:', error);
      throw error;
    }
  }

  /**
   * ID ile meetup getirir
   */
  static async getMeetupById(id: string): Promise<Meetup | null> {
    try {
      return await BookApiService.getMeetup(id);
    } catch (error) {
      console.error('Failed to get meetup by id:', error);
      return null;
    }
  }

  /**
   * Kullanıcının oluşturduğu meetupları getirir
   */
  static async getUserCreatedMeetups(userId: string): Promise<Meetup[]> {
    try {
      const meetups = await BookApiService.getMeetups();
      return meetups.filter(meetup => meetup.createdBy === userId);
    } catch (error) {
      console.error('Failed to get user created meetups:', error);
      throw error;
    }
  }

  /**
   * Yeni meetup oluşturur
   */
  static async createMeetup(data: CreateMeetupData): Promise<Meetup> {
    try {
      return await BookApiService.createMeetup(data);
    } catch (error) {
      console.error('Failed to create meetup:', error);
      throw error;
    }
  }

  /**
   * Meetup günceller
   */
  static async updateMeetup(id: string, data: UpdateMeetupData): Promise<Meetup> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/meetups/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          updatedAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedMeetup = await response.json();
      
      return {
        ...updatedMeetup,
        createdAt: new Date(updatedMeetup.createdAt),
        updatedAt: new Date(updatedMeetup.updatedAt)
      };
    } catch (error) {
      console.error('Failed to update meetup:', error);
      throw error;
    }
  }

  /**
   * Meetup'a katılır
   */
  static async joinMeetup(data: JoinMeetupData): Promise<MeetupMember> {
    try {
      // Önce zaten üye olup olmadığını kontrol et
      const existingMembers = await BookApiService.getMeetupMembers(data.meetupId);
      const isAlreadyMember = existingMembers.some(member => 
        member.userId === data.userId && member.status === 'active'
      );

      if (isAlreadyMember) {
        throw new Error('User is already a member of this meetup');
      }

      const member = await BookApiService.addMeetupMember(data.meetupId, data.userId, 'member');
      
      // User bilgisini ekle
      const users = await BookApiService.getUsers();
      const user = users.find(u => u.id === data.userId);
      
      return {
        ...member,
        user: user!
      };
    } catch (error) {
      console.error('Failed to join meetup:', error);
      throw error;
    }
  }

  /**
   * Meetup'tan ayrılır
   */
  static async leaveMeetup(meetupId: string, userId: string): Promise<void> {
    try {
      const members = await BookApiService.getMeetupMembers(meetupId);
      const member = members.find(m => m.userId === userId && m.status === 'active');
      
      if (!member) {
        throw new Error('User is not a member of this meetup');
      }

      // Üyelik durumunu 'left' yap
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/meetupMembers/${member.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'left'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Meetup member count'ını güncelle
      await BookApiService.updateMeetupMemberCount(meetupId);
    } catch (error) {
      console.error('Failed to leave meetup:', error);
      throw error;
    }
  }

  /**
   * Meetup üyelerini getirir
   */
  static async getMeetupMembers(meetupId: string): Promise<MeetupMember[]> {
    try {
      const members = await BookApiService.getMeetupMembers(meetupId);
      const users = await BookApiService.getUsers();
      
      return members.map(member => {
        const user = users.find(u => u.id === member.userId);
        return {
          ...member,
          user: user!
        };
      });
    } catch (error) {
      console.error('Failed to get meetup members:', error);
      throw error;
    }
  }

  /**
   * Meetup mesajlarını getirir
   */
  static async getMeetupMessages(meetupId: string): Promise<MeetupMessage[]> {
    try {
      const messages = await BookApiService.getMeetupMessages(meetupId);
      const users = await BookApiService.getUsers();
      
      return messages.map(message => {
        const user = users.find(u => u.id === message.userId);
        return {
          ...message,
          user: user!
        };
      });
    } catch (error) {
      console.error('Failed to get meetup messages:', error);
      throw error;
    }
  }

  /**
   * Meetup'a mesaj gönderir
   */
  static async sendMessage(data: CreateMessageData): Promise<MeetupMessage> {
    try {
      const message = await BookApiService.sendMeetupMessage(
        data.meetupId, 
        data.userId, 
        data.content, 
        data.type,
        data.metadata
      );
      
      // User bilgisini ekle
      const users = await BookApiService.getUsers();
      const user = users.find(u => u.id === data.userId);
      
      return {
        ...message,
        user: user!
      };
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Meetup toplantı programlarını getirir
   */
  static async getMeetingSchedules(meetupId: string): Promise<MeetingSchedule[]> {
    try {
      return await BookApiService.getMeetingSchedules(meetupId);
    } catch (error) {
      console.error('Failed to get meeting schedules:', error);
      throw error;
    }
  }

  /**
   * Yeni toplantı zamanlar
   */
  static async createMeeting(data: CreateMeetingData): Promise<MeetingSchedule> {
    try {
      const meetingData = {
        id: `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        meetupId: data.meetupId,
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        locationType: data.locationType,
        isRecurring: data.isRecurring || false,
        recurringPattern: data.recurringPattern,
        createdBy: (data as any).createdBy || 'unknown',
        attendees: (data as any).attendees || []
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/meetingSchedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create meeting:', error);
      throw error;
    }
  }

  /**
   * Kullanıcının katıldığı meetupları getirir
   */
  static async getUserMeetups(userId: string): Promise<Meetup[]> {
    try {
      return await BookApiService.getUserMeetups(userId);
    } catch (error) {
      console.error('Failed to get user meetups:', error);
      throw error;
    }
  }

  /**
   * Meetup istatistiklerini getirir
   */
  static async getMeetupStats(meetupId: string): Promise<MeetupStats> {
    try {
      const meetup = await BookApiService.getMeetup(meetupId);
      const messages = await BookApiService.getMeetupMessages(meetupId);
      const meetings = await BookApiService.getMeetingSchedules(meetupId);

      // MeetupStats tipine uygun dönüş değeri
      return {
        totalMeetups: 1,
        activeMeetups: meetup.status === 'active' ? 1 : 0,
        ownedMeetups: 0,
        joinedMeetups: 1,
        totalMessages: messages.length,
        totalMeetings: meetings.length,
        favoriteCategories: [{
          category: meetup.category,
          count: 1
        }]
      };
    } catch (error) {
      console.error('Failed to get meetup stats:', error);
      throw error;
    }
  }

  /**
   * Şehre göre meetupları filtreler
   */
  static async getMeetupsByLocation(location: string): Promise<Meetup[]> {
    try {
      const meetups = await BookApiService.getMeetups();
      return meetups.filter(meetup => 
        meetup.location.toLowerCase().includes(location.toLowerCase())
      );
    } catch (error) {
      console.error('Failed to get meetups by location:', error);
      throw error;
    }
  }

  /**
   * Kategoriye göre meetupları filtreler
   */
  static async getMeetupsByCategory(category: string): Promise<Meetup[]> {
    try {
      const meetups = await BookApiService.getMeetups();
      return meetups.filter(meetup => meetup.category === category);
    } catch (error) {
      console.error('Failed to get meetups by category:', error);
      throw error;
    }
  }

  /**
   * Arama yapar
   */
  static async searchMeetups(query: string): Promise<Meetup[]> {
    try {
      const meetups = await BookApiService.getMeetups();
      const searchQuery = query.toLowerCase();
      
      return meetups.filter(meetup =>
        meetup.title.toLowerCase().includes(searchQuery) ||
        meetup.description.toLowerCase().includes(searchQuery) ||
        meetup.theme.toLowerCase().includes(searchQuery) ||
        meetup.category.toLowerCase().includes(searchQuery) ||
        meetup.location.toLowerCase().includes(searchQuery)
      );
    } catch (error) {
      console.error('Failed to search meetups:', error);
      throw error;
    }
  }

  // Mock invitation methods - gerçek uygulamada ayrı tablo olur
  private static mockInvitations: any[] = [];

  static async createInvitation(data: CreateInvitationData): Promise<MeetupInvitation> {
    const invitation: any = {
      id: `inv-${Date.now()}`,
      meetupId: data.meetupId,
      inviterId: (data as any).inviterId || 'unknown',
      inviteeId: (data as any).inviteeId || 'unknown',
      message: (data as any).message || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    this.mockInvitations.push(invitation);
    return invitation as MeetupInvitation;
  }

  static async getUserInvitations(userId: string): Promise<MeetupInvitation[]> {
    return this.mockInvitations.filter(
      invitation => invitation.inviteeId === userId && invitation.status === 'pending'
    );
  }

  static async respondToInvitation(data: RespondToInvitationData): Promise<MeetupInvitation> {
    const invitationIndex = this.mockInvitations.findIndex(inv => inv.id === data.invitationId);
    
    if (invitationIndex === -1) {
      throw new Error('Invitation not found');
    }

    const invitation = this.mockInvitations[invitationIndex];
    invitation.status = data.response === 'accept' ? 'accepted' : 'declined';
    invitation.respondedAt = new Date().toISOString();

    // Eğer kabul edildiyse meetup'a katıl
    if (data.response === 'accept') {
      await this.joinMeetup({
        meetupId: invitation.meetupId,
        userId: invitation.inviteeId
      });
    }

    return invitation;
  }

  /**
   * Meetup sil
   */
  static async deleteMeetup(meetupId: string): Promise<void> {
    try {
      // API implementation here
      console.log(`Deleting meetup ${meetupId}`);
    } catch (error) {
      console.error('Error deleting meetup:', error);
      throw error;
    }
  }

  /**
   * Mesaj oluştur
   */
  static async createMessage(messageData: CreateMessageData): Promise<MeetupMessage> {
    try {
      // API implementation here
      const message: MeetupMessage = {
        id: Date.now().toString(),
        meetupId: messageData.meetupId,
        userId: messageData.userId,
        content: messageData.content,
        createdAt: new Date(),
        user: {
          id: messageData.userId,
          displayName: 'User',
          email: 'user@example.com',
          provider: 'email',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };
      return message;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  /**
   * Kullanıcı meetup istatistikleri
   */
  static async getUserMeetupStats(_userId: string): Promise<MeetupStats> {
    try {
      // API implementation here
      return {
        totalMeetups: 0,
        activeMeetups: 0,
        upcomingMeetings: 0,
        completedMeetings: 0
      };
    } catch (error) {
      console.error('Error getting user meetup stats:', error);
      throw error;
    }
  }

  /**
   * Davetiye gönder
   */
  static async sendInvitation(invitationData: CreateInvitationData): Promise<MeetupInvitation> {
    try {
      // API implementation here
      const invitation: MeetupInvitation = {
        id: Date.now().toString(),
        meetupId: invitationData.meetupId,
        inviterId: invitationData.inviterId,
        inviteeId: invitationData.inviteeId,
        message: invitationData.message,
        status: 'pending',
        createdAt: new Date().toISOString(),
        meetup: {
          id: invitationData.meetupId,
          title: 'Meetup Title',
          description: 'Meetup Description',
          theme: 'general',
          category: 'general',
          createdBy: invitationData.inviterId,
          maxMembers: 10,
          isPrivate: false,
          members: [],
          tags: [],
          rules: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };
      return invitation;
    } catch (error) {
      console.error('Error sending invitation:', error);
      throw error;
    }
  }

  /**
   * Gönderilen davetiyeleri getir
   */
  static async getSentInvitations(_userId: string): Promise<MeetupInvitation[]> {
    try {
      // API implementation here
      return [];
    } catch (error) {
      console.error('Error getting sent invitations:', error);
      throw error;
    }
  }
}

// Eski context uyumluluğu için
export const meetupService = MeetupService;
export default MeetupService;