import React, { useState,useEffect  } from 'react';
import {TextField,Button,List,ListItem,ListItemText,Typography,Divider,Box,Alert
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useChatHistory } from '../../hooks/useChatHistory';
import { sendMessage,checkHealth } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { conversations, addConversation, userId } = useChatHistory();
  // 设置Ollama服务状态
  const [isOllamaReady, setIsOllamaReady] = useState(false);

  // 检查Ollama服务状态
  useEffect(() => {
    const checkOllama = async () => {
      try {
        const health = await checkHealth();
        setIsOllamaReady(health.ollama);
        console.log('Health check:', health);
        
        if (!health.ollama) {
          setError('Ollama服务未就绪,请确保本地已运行Ollama');
        }
      } catch (error) {
        console.error('Health check failed:', error);
        setError('无法连接到后端服务');
      }
    };
    
    checkOllama();
  }, []);


  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    console.log('Sending message to Ollama:', message);

    try {
      // const response = await sendMessage(userId, message);
      const response = await sendMessage(message);

      addConversation({
        message,
        response: response.response,
        truss_data: response.truss_data
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('发送消息失败，请检查网络连接或稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="chat-interface" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        桁架设计助手
      </Typography>
      <Divider />

      {!isOllamaReady && (
        <Alert severity="warning" sx={{ mt: 1, mb: 1 }}>
          Ollama服务未就绪,请确保已运行: <code>ollama serve</code> 和 <code>ollama pull qwen2:0.5b-instruct</code>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 1, mb: 1 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Box 
        className="chat-messages" 
        sx={{ 
          flexGrow: 1,
          overflow: 'auto',
          mt: 1,
          mb: 2,
          maxHeight: 'calc(100% - 120px)'
        }}
      >
        {conversations.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
            <Typography variant="body2">
              欢迎使用桁架设计助手！
            </Typography>
            <Typography variant="body2">
              请输入您的需求开始设计...
            </Typography>
          </Box>
        ) : (
          <List>
            {conversations.map((conv, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary="您"
                    secondary={conv.message}
                    className="user-message"
                    sx={{
                      '& .MuiListItemText-primary': { fontWeight: 'bold', color: 'primary.main' }
                    }}
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary="AI助手"
                    secondary={conv.response}
                    className="ai-response"
                    sx={{
                      '& .MuiListItemText-primary': { fontWeight: 'bold', color: 'secondary.main' }
                    }}
                  />
                </ListItem>
                {index < conversations.length - 1 && <Divider sx={{ my: 1 }} />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
      
      <Box className="chat-input">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Please enter your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isLoading}
          multiline
          maxRows={3}
          size="small"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          disabled={isLoading || !message.trim()}
          endIcon={isLoading ? <LoadingSpinner size={16} /> : <SendIcon />}
          sx={{ mt: 1, minWidth: 80 }}
        >
          {isLoading ? '发送中...' : '发送'}
        </Button>
      </Box>
    </Box>
  );
};

export default ChatInterface;