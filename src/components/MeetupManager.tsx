import React, { useState, useEffect } from 'react';
import { useMeetupContext } from '../hooks/useMeetupContext';
import { useAuth } from '../hooks/useAuth';
import CreateMeetup from './CreateMeetup';
import MeetupList from './MeetupList';
import MeetupDetails from './MeetupDetails';
import { Meetup, CreateMeetupData } from '../types/meetup';
import './MeetupManager.css';

const MeetupManager: React.FC = () => {
  const { state: authState } = useAuth();
  const {
    state,
    loadMeetups,
    createMeetup,
    joinMeetup,
    leaveMeetup,
    sendMessage,
    createMeeting,
    setFilters,
    setSortOptions,
    setCurrentMeetup,
    clearError
  } = useMeetupContext();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMeetup, setSelectedMeetup] = useState<Meetup | null>(null);

  useEffect(() => {
    if (authState.user) {
      loadMeetups(authState.user.id);
    }
  }, [loadMeetups, authState.user]);

  const handleCreateMeetup = async (meetupData: CreateMeetupData) => {
    if (!authState.user) return;
    
    try {
      await createMeetup(meetupData, authState.user.id);
      setShowCreateModal(false);
    } catch {
      // Error is handled in context
    }
  };

  const handleMeetupSelect = (meetup: Meetup) => {
    setSelectedMeetup(meetup);
    setCurrentMeetup(meetup);
  };

  const handleJoinMeetup = async (meetupId: string, inviteCode?: string) => {
    if (!authState.user) return;
    
    try {
      await joinMeetup({
        meetupId,
        userId: authState.user.id,
        inviteCode,
        message: 'Merhaba! Gruba katılmak için sabırsızlanıyorum. 📚'
      });
    } catch {
      // Error is handled in context
    }
  };

  // Wrapper for MeetupList component (only takes meetupId)
  const handleJoinMeetupFromList = async (meetupId: string) => {
    await handleJoinMeetup(meetupId);
  };

  const handleLeaveMeetup = async (meetupId: string) => {
    if (!authState.user) return;
    
    try {
      await leaveMeetup(meetupId, authState.user.id);
      setSelectedMeetup(null);
    } catch {
      // Error is handled in context
    }
  };

  const handleSendMessage = async (messageData: Parameters<typeof sendMessage>[0]) => {
    try {
      await sendMessage(messageData);
    } catch {
      // Error is handled in context
    }
  };

  const handleCreateMeeting = async (meetingData: Parameters<typeof createMeeting>[0]) => {
    try {
      await createMeeting(meetingData);
    } catch {
      // Error is handled in context
    }
  };

  if (!authState.user) {
    return <div>Lütfen giriş yapınız.</div>;
  }

  if (selectedMeetup) {
    return (
      <MeetupDetails
        meetup={selectedMeetup}
        currentUserId={authState.user.id}
        isLoading={state.isLoading}
        onSendMessage={handleSendMessage}
        onCreateMeeting={handleCreateMeeting}
        onJoinMeetup={handleJoinMeetup}
        onLeaveMeetup={handleLeaveMeetup}
        onClose={() => {
          setSelectedMeetup(null);
          setCurrentMeetup(null);
        }}
      />
    );
  }

  return (
    <div className="meetup-manager">
      <div className="meetup-header">
        <div className="header-content">
          <h1>🤝 Buluşma Grupları</h1>
          <p>Kitap severlerle bir araya gel, okuma grupları oluştur ve keyifli tartışmalar yap!</p>
        </div>
        <button 
          className="create-meetup-btn"
          onClick={() => setShowCreateModal(true)}
        >
          + Yeni Grup Oluştur
        </button>
      </div>

      {state.error && (
        <div className="error-banner">
          <span>{state.error}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      <MeetupList
        meetups={state.meetups}
        isLoading={state.isLoading}
        onMeetupSelect={handleMeetupSelect}
        onJoinMeetup={handleJoinMeetupFromList}
        onFilterChange={setFilters}
        onSortChange={setSortOptions}
        currentUserId={authState.user.id}
      />

      {showCreateModal && (
        <CreateMeetup
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateMeetup}
          isLoading={state.isLoading}
        />
      )}
    </div>
  );
};

export default MeetupManager;