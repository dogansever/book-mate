import React, { createContext, useReducer, useCallback, useEffect } from 'react';
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
  MeetupMessage,
  MeetingSchedule
} from '../types/meetup';
import { meetupService } from '../services/meetupService';

interface MeetupState {
  meetups: Meetup[];
  currentMeetup: Meetup | null;
  userStats: MeetupStats | null;
  filters: MeetupFilters;
  sortOptions: MeetupSortOptions;
  isLoading: boolean;
  error: string | null;
}

type MeetupAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MEETUPS'; payload: Meetup[] }
  | { type: 'SET_CURRENT_MEETUP'; payload: Meetup | null }
  | { type: 'SET_USER_STATS'; payload: MeetupStats }
  | { type: 'SET_FILTERS'; payload: MeetupFilters }
  | { type: 'SET_SORT_OPTIONS'; payload: MeetupSortOptions }
  | { type: 'ADD_MEETUP'; payload: Meetup }
  | { type: 'UPDATE_MEETUP'; payload: Meetup }
  | { type: 'DELETE_MEETUP'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: { meetupId: string; message: MeetupMessage } }
  | { type: 'ADD_MEETING'; payload: { meetupId: string; meeting: MeetingSchedule } };

const initialState: MeetupState = {
  meetups: [],
  currentMeetup: null,
  userStats: null,
  filters: {},
  sortOptions: { field: 'lastActivity', direction: 'desc' },
  isLoading: false,
  error: null
};

const meetupReducer = (state: MeetupState, action: MeetupAction): MeetupState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_MEETUPS':
      return { ...state, meetups: action.payload };
    
    case 'SET_CURRENT_MEETUP':
      return { ...state, currentMeetup: action.payload };
    
    case 'SET_USER_STATS':
      return { ...state, userStats: action.payload };
    
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    
    case 'SET_SORT_OPTIONS':
      return { ...state, sortOptions: action.payload };
    
    case 'ADD_MEETUP':
      return { 
        ...state, 
        meetups: [action.payload, ...state.meetups]
      };
    
    case 'UPDATE_MEETUP':
      return {
        ...state,
        meetups: state.meetups.map(meetup =>
          meetup.id === action.payload.id ? action.payload : meetup
        ),
        currentMeetup: state.currentMeetup?.id === action.payload.id 
          ? action.payload 
          : state.currentMeetup
      };
    
    case 'DELETE_MEETUP':
      return {
        ...state,
        meetups: state.meetups.filter(meetup => meetup.id !== action.payload),
        currentMeetup: state.currentMeetup?.id === action.payload 
          ? null 
          : state.currentMeetup
      };
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        meetups: state.meetups.map(meetup =>
          meetup.id === action.payload.meetupId
            ? {
                ...meetup,
                messages: [...meetup.messages, action.payload.message],
                lastActivity: new Date().toISOString()
              }
            : meetup
        ),
        currentMeetup: state.currentMeetup?.id === action.payload.meetupId
          ? {
              ...state.currentMeetup,
              messages: [...state.currentMeetup.messages, action.payload.message],
              lastActivity: new Date().toISOString()
            }
          : state.currentMeetup
      };
    
    case 'ADD_MEETING':
      return {
        ...state,
        meetups: state.meetups.map(meetup =>
          meetup.id === action.payload.meetupId
            ? {
                ...meetup,
                meetings: [...meetup.meetings, action.payload.meeting],
                stats: {
                  ...meetup.stats,
                  totalMeetings: meetup.stats.totalMeetings + 1
                },
                lastActivity: new Date().toISOString()
              }
            : meetup
        ),
        currentMeetup: state.currentMeetup?.id === action.payload.meetupId
          ? {
              ...state.currentMeetup,
              meetings: [...state.currentMeetup.meetings, action.payload.meeting],
              stats: {
                ...state.currentMeetup.stats,
                totalMeetings: state.currentMeetup.stats.totalMeetings + 1
              },
              lastActivity: new Date().toISOString()
            }
          : state.currentMeetup
      };
    
    default:
      return state;
  }
};

interface MeetupContextValue {
  state: MeetupState;
  
  // Meetup CRUD operations
  loadMeetups: (userId?: string) => Promise<void>;
  createMeetup: (data: CreateMeetupData, userId: string) => Promise<Meetup>;
  updateMeetup: (id: string, data: UpdateMeetupData, userId: string) => Promise<void>;
  deleteMeetup: (id: string, userId: string) => Promise<void>;
  
  // Meetup details
  loadMeetupById: (id: string) => Promise<void>;
  
  // Member management
  joinMeetup: (data: JoinMeetupData) => Promise<void>;
  leaveMeetup: (meetupId: string, userId: string) => Promise<void>;
  
  // Communication
  sendMessage: (data: CreateMessageData) => Promise<void>;
  createMeeting: (data: CreateMeetingData) => Promise<void>;
  
  // Stats and filtering
  loadUserStats: (userId: string) => Promise<void>;
  setFilters: (filters: MeetupFilters) => void;
  setSortOptions: (sortOptions: MeetupSortOptions) => void;
  
  // UI state
  setCurrentMeetup: (meetup: Meetup | null) => void;
  clearError: () => void;
}

const MeetupContext = createContext<MeetupContextValue | null>(null);

interface MeetupProviderProps {
  children: React.ReactNode;
}

export const MeetupProvider: React.FC<MeetupProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(meetupReducer, initialState);

  // Load meetups with filters and sorting
  const loadMeetups = useCallback(async (userId?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const meetups = await meetupService.getAllMeetups(
        state.filters,
        state.sortOptions,
        userId
      );
      dispatch({ type: 'SET_MEETUPS', payload: meetups });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Meetuplar yüklenirken hata oluştu' });
      console.error('Load meetups error:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.filters, state.sortOptions]);

  // Create new meetup
  const createMeetup = useCallback(async (data: CreateMeetupData, userId: string): Promise<Meetup> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const newMeetup = await meetupService.createMeetup(data, userId);
      dispatch({ type: 'ADD_MEETUP', payload: newMeetup });
      dispatch({ type: 'SET_LOADING', payload: false });
      return newMeetup;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Meetup oluşturulurken hata oluştu' });
      console.error('Create meetup error:', error);
      throw error;
    }
  }, []);

  // Update meetup
  const updateMeetup = useCallback(async (id: string, data: UpdateMeetupData, userId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const updatedMeetup = await meetupService.updateMeetup(id, data, userId);
      dispatch({ type: 'UPDATE_MEETUP', payload: updatedMeetup });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Meetup güncellenirken hata oluştu' });
      console.error('Update meetup error:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Delete meetup
  const deleteMeetup = useCallback(async (id: string, userId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await meetupService.deleteMeetup(id, userId);
      dispatch({ type: 'DELETE_MEETUP', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Meetup silinirken hata oluştu' });
      console.error('Delete meetup error:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Load meetup by ID
  const loadMeetupById = useCallback(async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const meetup = await meetupService.getMeetupById(id);
      dispatch({ type: 'SET_CURRENT_MEETUP', payload: meetup });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Meetup detayları yüklenirken hata oluştu' });
      console.error('Load meetup error:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Join meetup
  const joinMeetup = useCallback(async (data: JoinMeetupData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const updatedMeetup = await meetupService.joinMeetup(data);
      dispatch({ type: 'UPDATE_MEETUP', payload: updatedMeetup });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Meetup\'a katılırken hata oluştu' });
      console.error('Join meetup error:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Leave meetup
  const leaveMeetup = useCallback(async (meetupId: string, userId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await meetupService.leaveMeetup(meetupId, userId);
      // Reload meetup to get updated member list
      const updatedMeetup = await meetupService.getMeetupById(meetupId);
      if (updatedMeetup) {
        dispatch({ type: 'UPDATE_MEETUP', payload: updatedMeetup });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Meetup\'tan ayrılırken hata oluştu' });
      console.error('Leave meetup error:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (data: CreateMessageData) => {
    try {
      const newMessage = await meetupService.createMessage(data);
      dispatch({ 
        type: 'ADD_MESSAGE', 
        payload: { meetupId: data.meetupId, message: newMessage } 
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Mesaj gönderilirken hata oluştu' });
      console.error('Send message error:', error);
      throw error;
    }
  }, []);

  // Create meeting
  const createMeeting = useCallback(async (data: CreateMeetingData) => {
    try {
      const newMeeting = await meetupService.createMeeting(data);
      dispatch({ 
        type: 'ADD_MEETING', 
        payload: { meetupId: data.meetupId, meeting: newMeeting } 
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Buluşma oluşturulurken hata oluştu' });
      console.error('Create meeting error:', error);
      throw error;
    }
  }, []);

  // Load user stats
  const loadUserStats = useCallback(async (userId: string) => {
    try {
      const stats = await meetupService.getUserMeetupStats(userId);
      dispatch({ type: 'SET_USER_STATS', payload: stats });
    } catch (error) {
      console.error('Load user stats error:', error);
    }
  }, []);

  // Set filters
  const setFilters = useCallback((filters: MeetupFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  // Set sort options
  const setSortOptions = useCallback((sortOptions: MeetupSortOptions) => {
    dispatch({ type: 'SET_SORT_OPTIONS', payload: sortOptions });
  }, []);

  // Set current meetup
  const setCurrentMeetup = useCallback((meetup: Meetup | null) => {
    dispatch({ type: 'SET_CURRENT_MEETUP', payload: meetup });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Auto-reload meetups when filters or sort options change
  useEffect(() => {
    if (state.meetups.length > 0) {
      loadMeetups();
    }
  }, [state.filters, state.sortOptions, state.meetups.length, loadMeetups]);

  const contextValue: MeetupContextValue = {
    state,
    loadMeetups,
    createMeetup,
    updateMeetup,
    deleteMeetup,
    loadMeetupById,
    joinMeetup,
    leaveMeetup,
    sendMessage,
    createMeeting,
    loadUserStats,
    setFilters,
    setSortOptions,
    setCurrentMeetup,
    clearError
  };

  return (
    <MeetupContext.Provider value={contextValue}>
      {children}
    </MeetupContext.Provider>
  );
};

export default MeetupContext;