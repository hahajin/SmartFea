import { useState, useEffect } from 'react';
import { getChatHistory } from '../services/api';

export const useChatHistory = () => {
  const [conversations, setConversations] = useState([]);
  const [userId] = useState(() => {
    // Generate a new user ID for each session (since localStorage isn't available)
    return 'user_' + Math.random().toString(36).substr(2, 9);
  });

  useEffect(() => {
    // Load chat history
    const loadHistory = async () => {
      try {
        const history = await getChatHistory(userId);
        setConversations(history);
      } catch (error) {
        console.error('Error loading chat history:', error);
        // Set empty array if API fails
        setConversations([]);
      }
    };
    
    loadHistory();
  }, [userId]);

  const addConversation = (conversation) => {
    setConversations(prev => [conversation, ...prev]);
  };

  return {
    conversations,
    addConversation,
    userId
  };
};