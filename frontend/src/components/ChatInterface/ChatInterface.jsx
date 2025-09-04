import React, { useState } from 'react';
import {TextField,Button,List,ListItem,ListItemText,Typography,Divider,Box,Alert
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useChatHistory } from '../../hooks/useChatHistory';
import { sendMessage } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { conversations, addConversation, userId } = useChatHistory();

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await sendMessage(userId, message);
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
          placeholder="输入您的请求，例如：请帮我建立一个18m跨度，3m高度的平面桁架模型"
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