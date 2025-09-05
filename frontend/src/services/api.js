const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// export const sendMessage = async (userId, message) => {
export const sendMessage = async (message) => {
  try {
    // Note: Change endpoint from /api/chat to /api/parse
    // const response = await fetch(`${API_BASE_URL}/api/chat`, {
    const response = await fetch(`${API_BASE_URL}/api/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // user_id: userId,
        message: message
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// export const getChatHistory = async (userId) => {
export const getChatHistory = async () => {
  const response = await fetch(`${API_BASE_URL}/api/history/`);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
};

// 添加API
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    return { ok: false, ollama: false, error: error.message };
  }
};