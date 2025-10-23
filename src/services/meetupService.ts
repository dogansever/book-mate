import { 
  Meetup, 
  CreateMeetupData, 
  UpdateMeetupData, 
  JoinMeetupData,
  CreateMessageData,
  CreateMeetingData,
  MeetupFilters, 
  MeetupSortOptions,
  MeetupStats,
  MeetupMember,
  MeetupMessage,
  MeetingSchedule
} from '../types/meetup';
import { User } from '../types/user';
import { Book } from '../types/book';

// Mock users data (extend from existing users)
const mockUsers: User[] = [
  {
    id: '1',
    email: 'ahmet@example.com',
    displayName: 'Ahmet Okur',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    createdAt: new Date('2024-01-15'),
    profile: {
      location: 'İstanbul',
      favoriteGenres: ['Klasik', 'Roman'],
      favoriteAuthors: ['Dostoyevski', 'Tolstoy'],
      interests: ['klasik edebiyat', 'felsefe'],
      bio: 'Klasik edebiyat sevdalısı',
      readingGoal: 50,
      isProfileComplete: true
    }
  },
  {
    id: '2',
    email: 'elif@example.com',
    displayName: 'Elif Yazar',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
    createdAt: new Date('2024-02-20'),
    profile: {
      location: 'Ankara',
      favoriteGenres: ['Felsefe', 'Modern Roman'],
      favoriteAuthors: ['Sartre', 'Camus'],
      interests: ['modern edebiyat', 'felsefe'],
      bio: 'Modern edebiyat ve felsefe',
      readingGoal: 36,
      isProfileComplete: true
    }
  },
  {
    id: '3',
    email: 'mehmet@example.com',
    displayName: 'Mehmet Düşünür',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    createdAt: new Date('2024-03-10'),
    profile: {
      location: 'İzmir',
      favoriteGenres: ['Felsefe', 'Sosyoloji'],
      favoriteAuthors: ['Nietzsche', 'Weber'],
      interests: ['felsefe', 'sosyoloji'],
      bio: 'Felsefe ve sosyoloji meraklısı',
      readingGoal: 40,
      isProfileComplete: true
    }
  },
  {
    id: '4',
    email: 'ayse@example.com',
    displayName: 'Ayşe Tarihçi',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    createdAt: new Date('2024-01-25'),
    profile: {
      location: 'Bursa',
      favoriteGenres: ['Tarih', 'Biyografi'],
      favoriteAuthors: ['Halil İnalcık', 'İlber Ortaylı'],
      interests: ['tarih', 'biyografi'],
      bio: 'Tarih kitapları ve biyografi sevdalısı',
      readingGoal: 30,
      isProfileComplete: true
    }
  }
];

// Mock books data
const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Suç ve Ceza',
    authors: ['Fyodor Dostoyevski'],
    isbn: '9780140449136',
    publishedDate: '1866',
    categories: ['Klasik Roman', 'Psikoloji'],
    description: 'Dostoyevski\'nin psikolojik analiz açısından en güçlü eserlerinden biri.',
    imageLinks: {
      thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=300&fit=crop'
    },
    pageCount: 671,
    language: 'tr',
    publisher: 'İletişim Yayınları'
  },
  {
    id: '2',
    title: 'Bir İdam Mahkûmunun Son Günü',
    authors: ['Victor Hugo'],
    isbn: '9786053607457',
    publishedDate: '1829',
    categories: ['Klasik Roman', 'Eleştiri'],
    description: 'Hugo\'nun adalet sistemi eleştirisi.',
    imageLinks: {
      thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=300&fit=crop'
    },
    pageCount: 96,
    language: 'tr',
    publisher: 'Türkiye İş Bankası Yayınları'
  }
];

// Mock meetups data
const mockMeetups: Meetup[] = [
  {
    id: '1',
    title: 'Dostoyevski Okuma Grubu',
    description: 'Dostoyevski\'nin başyapıtlarını birlikte okuyup tartışıyoruz. Şu anda Suç ve Ceza okuyoruz.',
    theme: 'Rus Klasikleri',
    bookId: '1',
    book: mockBooks[0],
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop',
    maxMembers: 4,
    isPrivate: false,
    createdBy: '1',
    owner: mockUsers[0],
    createdAt: '2024-10-01T10:00:00Z',
    lastActivity: '2024-10-22T15:30:00Z',
    status: 'active',
    category: 'author-focused',
    tags: ['dostoyevski', 'rus edebiyatı', 'klasik', 'felsefe'],
    members: [
      {
        id: '1',
        userId: '1',
        user: mockUsers[0],
        joinedAt: '2024-10-01T10:00:00Z',
        role: 'owner',
        status: 'active'
      },
      {
        id: '2',
        userId: '2',
        user: mockUsers[1],
        joinedAt: '2024-10-02T14:20:00Z',
        role: 'member',
        status: 'active'
      },
      {
        id: '3',
        userId: '3',
        user: mockUsers[2],
        joinedAt: '2024-10-05T09:15:00Z',
        role: 'member',
        status: 'active'
      }
    ],
    messages: [
      {
        id: '1',
        meetupId: '1',
        userId: '1',
        user: mockUsers[0],
        content: 'Herkesi gruba hoş geldiniz! Suç ve Ceza\'yı okumaya başladık. İlk 100 sayfayı bu hafta bitirelim.',
        createdAt: '2024-10-01T10:30:00Z',
        type: 'text'
      },
      {
        id: '2',
        meetupId: '1',
        userId: '2',
        user: mockUsers[1],
        content: 'Merhaba! Kitabı çok heyecanla okuyorum. Raskolnikov\'un psikolojisi gerçekten etkileyici.',
        createdAt: '2024-10-03T16:45:00Z',
        type: 'text'
      }
    ],
    meetings: [
      {
        id: '1',
        title: 'İlk Bölüm Tartışması',
        description: 'Suç ve Ceza\'nın ilk bölümünü tartışacağız',
        date: '2024-10-25',
        time: '19:00',
        location: 'Online - Zoom',
        locationType: 'online',
        isRecurring: false,
        createdBy: '1',
        attendees: ['1', '2', '3']
      }
    ],
    currentBook: mockBooks[0],
    readingGoal: {
      targetPages: 671,
      currentPages: 150,
      deadline: '2024-11-15'
    },
    stats: {
      totalBooks: 1,
      completedBooks: 0,
      totalMeetings: 1,
      activeMembers: 3
    }
  },
  {
    id: '2',
    title: 'Modern Felsefe Söyleşileri',
    description: 'Çağdaş felsefe kitaplarını okuyup derin tartışmalar yapıyoruz.',
    theme: 'Modern Felsefe',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    maxMembers: 3,
    isPrivate: true,
    inviteCode: 'FEL2024',
    createdBy: '3',
    owner: mockUsers[2],
    createdAt: '2024-09-15T12:00:00Z',
    lastActivity: '2024-10-20T11:20:00Z',
    status: 'active',
    category: 'theme-based',
    tags: ['felsefe', 'modern', 'tartışma', 'düşünce'],
    members: [
      {
        id: '4',
        userId: '3',
        user: mockUsers[2],
        joinedAt: '2024-09-15T12:00:00Z',
        role: 'owner',
        status: 'active'
      },
      {
        id: '5',
        userId: '4',
        user: mockUsers[3],
        joinedAt: '2024-09-18T10:30:00Z',
        role: 'member',
        status: 'active'
      }
    ],
    messages: [
      {
        id: '3',
        meetupId: '2',
        userId: '3',
        user: mockUsers[2],
        content: 'Bu hafta Hannah Arendt\'in İnsanlık Durumu kitabını tartışalım mı?',
        createdAt: '2024-10-20T11:20:00Z',
        type: 'text'
      }
    ],
    meetings: [],
    stats: {
      totalBooks: 3,
      completedBooks: 1,
      totalMeetings: 4,
      activeMembers: 2
    }
  }
];

class MeetupService {
  private static instance: MeetupService;
  
  public static getInstance(): MeetupService {
    if (!MeetupService.instance) {
      MeetupService.instance = new MeetupService();
    }
    return MeetupService.instance;
  }

  // Simulate API delay
  private async delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get all meetups with filtering and sorting
  async getAllMeetups(
    filters?: MeetupFilters,
    sortOptions?: MeetupSortOptions,
    userId?: string
  ): Promise<Meetup[]> {
    await this.delay();

    let filteredMeetups = [...mockMeetups];

    if (filters) {
      if (filters.category) {
        filteredMeetups = filteredMeetups.filter(meetup => meetup.category === filters.category);
      }
      
      if (filters.hasSpace) {
        filteredMeetups = filteredMeetups.filter(meetup => meetup.members.length < meetup.maxMembers);
      }
      
      if (filters.tags && filters.tags.length > 0) {
        filteredMeetups = filteredMeetups.filter(meetup =>
          filters.tags!.some(tag => meetup.tags.includes(tag))
        );
      }
      
      if (filters.theme) {
        filteredMeetups = filteredMeetups.filter(meetup =>
          meetup.theme.toLowerCase().includes(filters.theme!.toLowerCase())
        );
      }
      
      if (filters.bookId) {
        filteredMeetups = filteredMeetups.filter(meetup => meetup.bookId === filters.bookId);
      }
      
      if (filters.status) {
        filteredMeetups = filteredMeetups.filter(meetup => meetup.status === filters.status);
      }
      
      if (userId) {
        if (filters.isOwner) {
          filteredMeetups = filteredMeetups.filter(meetup => meetup.createdBy === userId);
        }
        
        if (filters.isMember) {
          filteredMeetups = filteredMeetups.filter(meetup =>
            meetup.members.some(member => member.userId === userId)
          );
        }
      }
    }

    // Sorting
    if (sortOptions) {
      filteredMeetups.sort((a, b) => {
        let aValue: string | number | Date;
        let bValue: string | number | Date;
        
        if (sortOptions.field === 'memberCount') {
          aValue = a.members.length;
          bValue = b.members.length;
        } else {
          aValue = a[sortOptions.field as keyof Meetup] as string | number | Date;
          bValue = b[sortOptions.field as keyof Meetup] as string | number | Date;
        }
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (sortOptions.direction === 'desc') {
          return aValue < bValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }

    return filteredMeetups;
  }

  // Get meetup by ID
  async getMeetupById(id: string): Promise<Meetup | null> {
    await this.delay();
    return mockMeetups.find(meetup => meetup.id === id) || null;
  }

  // Create new meetup
  async createMeetup(data: CreateMeetupData, userId: string): Promise<Meetup> {
    await this.delay();

    let user = mockUsers.find(u => u.id === userId);
    
    // If user not found in mockUsers, create a fallback user
    if (!user) {
      user = {
        id: userId,
        email: 'user@example.com',
        displayName: 'Kullanıcı',
        avatar: '👤',
        createdAt: new Date(),
        profile: {
          location: 'Türkiye',
          favoriteGenres: [],
          favoriteAuthors: [],
          interests: [],
          bio: '',
          readingGoal: 20,
          isProfileComplete: false
        }
      };
    }

    const book = data.bookId ? mockBooks.find(b => b.id === data.bookId) : undefined;

    const newMeetup: Meetup = {
      id: this.generateId(),
      title: data.title,
      description: data.description,
      theme: data.theme,
      bookId: data.bookId,
      book,
      coverImage: data.coverImage,
      maxMembers: Math.min(Math.max(data.maxMembers, 2), 4), // Ensure 2-4 range
      isPrivate: data.isPrivate,
      inviteCode: data.isPrivate ? this.generateId().substring(0, 8).toUpperCase() : undefined,
      createdBy: userId,
      owner: user,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      status: 'active',
      category: data.category,
      tags: data.tags,
      members: [{
        id: this.generateId(),
        userId,
        user,
        joinedAt: new Date().toISOString(),
        role: 'owner',
        status: 'active'
      }],
      messages: data.initialMessage ? [{
        id: this.generateId(),
        meetupId: '', // Will be set after creation
        userId,
        user,
        content: data.initialMessage,
        createdAt: new Date().toISOString(),
        type: 'text'
      }] : [],
      meetings: [],
      currentBook: book,
      stats: {
        totalBooks: book ? 1 : 0,
        completedBooks: 0,
        totalMeetings: 0,
        activeMembers: 1
      }
    };

    // Set meetupId for initial message
    if (newMeetup.messages.length > 0) {
      newMeetup.messages[0].meetupId = newMeetup.id;
    }

    mockMeetups.unshift(newMeetup);
    return newMeetup;
  }

  // Update meetup
  async updateMeetup(id: string, data: UpdateMeetupData, userId: string): Promise<Meetup> {
    await this.delay();

    const meetupIndex = mockMeetups.findIndex(m => m.id === id);
    if (meetupIndex === -1) {
      throw new Error('Meetup not found');
    }

    const meetup = mockMeetups[meetupIndex];
    if (meetup.createdBy !== userId) {
      throw new Error('Not authorized to update this meetup');
    }

    const updatedMeetup = {
      ...meetup,
      ...data,
      lastActivity: new Date().toISOString()
    };

    mockMeetups[meetupIndex] = updatedMeetup;
    return updatedMeetup;
  }

  // Join meetup
  async joinMeetup(data: JoinMeetupData): Promise<Meetup> {
    await this.delay();

    const meetupIndex = mockMeetups.findIndex(m => m.id === data.meetupId);
    if (meetupIndex === -1) {
      throw new Error('Meetup not found');
    }

    const meetup = mockMeetups[meetupIndex];
    
    // Check if already a member
    if (meetup.members.some(m => m.userId === data.userId)) {
      throw new Error('Already a member of this meetup');
    }

    // Check if meetup is full
    if (meetup.members.length >= meetup.maxMembers) {
      throw new Error('Meetup is full');
    }

    // Check invite code for private meetups (skip check if no invite code provided for testing)
    if (meetup.isPrivate && data.inviteCode && meetup.inviteCode !== data.inviteCode) {
      throw new Error('Invalid invite code');
    }
    
    // For private meetups without invite code, allow join (for testing purposes)
    // In production, you would want to require invite codes for all private meetups

    let user = mockUsers.find(u => u.id === data.userId);
    
    // If user not found in mockUsers, create a fallback user
    if (!user) {

      user = {
        id: data.userId,
        email: 'user@example.com',
        displayName: 'Kullanıcı',
        avatar: '👤',
        createdAt: new Date(),
        profile: {
          location: 'Türkiye',
          favoriteGenres: [],
          favoriteAuthors: [],
          interests: [],
          bio: '',
          readingGoal: 20,
          isProfileComplete: false
        }
      };
    }

    const newMember: MeetupMember = {
      id: this.generateId(),
      userId: data.userId,
      user,
      joinedAt: new Date().toISOString(),
      role: 'member',
      status: 'active'
    };

    meetup.members.push(newMember);
    meetup.stats.activeMembers = meetup.members.filter(m => m.status === 'active').length;
    meetup.lastActivity = new Date().toISOString();

    // Add join message if provided
    if (data.message) {
      const joinMessage: MeetupMessage = {
        id: this.generateId(),
        meetupId: data.meetupId,
        userId: data.userId,
        user,
        content: data.message,
        createdAt: new Date().toISOString(),
        type: 'text'
      };
      meetup.messages.push(joinMessage);
    }

    mockMeetups[meetupIndex] = meetup;
    return meetup;
  }

  // Leave meetup
  async leaveMeetup(meetupId: string, userId: string): Promise<void> {
    await this.delay();

    const meetupIndex = mockMeetups.findIndex(m => m.id === meetupId);
    if (meetupIndex === -1) {
      throw new Error('Meetup not found');
    }

    const meetup = mockMeetups[meetupIndex];
    
    // Cannot leave if owner (must transfer ownership first)
    if (meetup.createdBy === userId) {
      throw new Error('Owner cannot leave meetup. Transfer ownership first.');
    }

    const memberIndex = meetup.members.findIndex(m => m.userId === userId);
    if (memberIndex === -1) {
      throw new Error('Not a member of this meetup');
    }

    meetup.members[memberIndex].status = 'left';
    meetup.stats.activeMembers = meetup.members.filter(m => m.status === 'active').length;
    meetup.lastActivity = new Date().toISOString();

    mockMeetups[meetupIndex] = meetup;
  }

  // Create message
  async createMessage(data: CreateMessageData): Promise<MeetupMessage> {
    await this.delay();

    const meetupIndex = mockMeetups.findIndex(m => m.id === data.meetupId);
    if (meetupIndex === -1) {
      throw new Error('Meetup not found');
    }

    const meetup = mockMeetups[meetupIndex];
    
    // Check if user is a member
    if (!meetup.members.some(m => m.userId === data.userId && m.status === 'active')) {
      throw new Error('Not a member of this meetup');
    }

    let user = mockUsers.find(u => u.id === data.userId);
    
    // If user not found in mockUsers, create a fallback user
    if (!user) {

      user = {
        id: data.userId,
        email: 'user@example.com',
        displayName: 'Kullanıcı',
        avatar: '👤',
        createdAt: new Date(),
        profile: {
          location: 'Türkiye',
          favoriteGenres: [],
          favoriteAuthors: [],
          interests: [],
          bio: '',
          readingGoal: 20,
          isProfileComplete: false
        }
      };
    }

    const newMessage: MeetupMessage = {
      id: this.generateId(),
      meetupId: data.meetupId,
      userId: data.userId,
      user,
      content: data.content,
      createdAt: new Date().toISOString(),
      type: data.type,
      metadata: data.metadata
    };

    meetup.messages.push(newMessage);
    meetup.lastActivity = new Date().toISOString();
    
    mockMeetups[meetupIndex] = meetup;
    return newMessage;
  }

  // Create meeting
  async createMeeting(data: CreateMeetingData): Promise<MeetingSchedule> {
    await this.delay();

    const meetupIndex = mockMeetups.findIndex(m => m.id === data.meetupId);
    if (meetupIndex === -1) {
      throw new Error('Meetup not found');
    }

    const meetup = mockMeetups[meetupIndex];

    const newMeeting: MeetingSchedule = {
      id: this.generateId(),
      title: data.title,
      description: data.description,
      date: data.date,
      time: data.time,
      location: data.location,
      locationType: data.locationType,
      isRecurring: data.isRecurring,
      recurringPattern: data.recurringPattern,
      createdBy: data.userId || meetup.createdBy,
      attendees: meetup.members.filter(m => m.status === 'active').map(m => m.userId)
    };

    meetup.meetings.push(newMeeting);
    meetup.stats.totalMeetings = meetup.meetings.length;
    meetup.lastActivity = new Date().toISOString();

    // Set as next meeting if it's the closest future meeting
    const futureMeetings = meetup.meetings
      .filter(m => new Date(m.date + 'T' + m.time) > new Date())
      .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());
    
    if (futureMeetings.length > 0) {
      meetup.nextMeeting = futureMeetings[0];
    }

    mockMeetups[meetupIndex] = meetup;
    return newMeeting;
  }

  // Get user meetup stats
  async getUserMeetupStats(userId: string): Promise<MeetupStats> {
    await this.delay();

    const userMeetups = mockMeetups.filter(meetup =>
      meetup.members.some(member => member.userId === userId && member.status === 'active')
    );

    const ownedMeetups = userMeetups.filter(meetup => meetup.createdBy === userId);
    const joinedMeetups = userMeetups.filter(meetup => meetup.createdBy !== userId);

    const totalMessages = userMeetups.reduce((total, meetup) =>
      total + meetup.messages.filter(msg => msg.userId === userId).length, 0
    );

    const totalMeetings = userMeetups.reduce((total, meetup) => total + meetup.stats.totalMeetings, 0);

    const categoryCount: Record<string, number> = {};
    userMeetups.forEach(meetup => {
      categoryCount[meetup.category] = (categoryCount[meetup.category] || 0) + 1;
    });

    const favoriteCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalMeetups: userMeetups.length,
      activeMeetups: userMeetups.filter(m => m.status === 'active').length,
      ownedMeetups: ownedMeetups.length,
      joinedMeetups: joinedMeetups.length,
      totalMessages,
      totalMeetings,
      favoriteCategories
    };
  }

  // Delete meetup (owner only)
  async deleteMeetup(id: string, userId: string): Promise<void> {
    await this.delay();

    const meetupIndex = mockMeetups.findIndex(m => m.id === id);
    if (meetupIndex === -1) {
      throw new Error('Meetup not found');
    }

    const meetup = mockMeetups[meetupIndex];
    if (meetup.createdBy !== userId) {
      throw new Error('Not authorized to delete this meetup');
    }

    mockMeetups.splice(meetupIndex, 1);
  }
}

export const meetupService = MeetupService.getInstance();