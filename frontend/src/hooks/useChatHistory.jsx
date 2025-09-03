import { useState, useEffect } from 'react';
import { getChatHistory } from '../services/api';

export const useChatHistory = () => {
  const [conversations, setConversations] = useState([]);
  const [userId] = useState(() => {
    // 从localStorage获取或生成新用户ID
    const storedId = localStorage.getItem('trussUserId');
    if (storedId) return storedId;
    
    const newId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('trussUserId', newId);
    return newId;
  });

  useEffect(() => {
    // 加载对话历史
    const loadHistory = async () => {
      try {
        const history = await getChatHistory(userId);
        setConversations(history);
      } catch (error) {
        console.error('Error loading chat history:', error);
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