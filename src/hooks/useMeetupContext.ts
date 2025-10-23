import { useContext } from 'react';
import MeetupContext from '../contexts/MeetupContext';

export const useMeetupContext = () => {
  const context = useContext(MeetupContext);
  if (!context) {
    throw new Error('useMeetupContext must be used within a MeetupProvider');
  }
  return context;
};