const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173';

export const sendMessage = async (userId, message) => {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      message: message
    }),
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
};

export const getChatHistory = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/api/history/${userId}`);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
};