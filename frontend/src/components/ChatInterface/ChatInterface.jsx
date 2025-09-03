import React, { useState } from 'react';
import {TextField,Button,List,ListItem,ListItemText,Typography,Divider,Box
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useChatHistory } from '../../hooks/useChatHistory';
import { sendMessage } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { conversations, addConversation, userId } = useChatHistory();

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;
    
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="chat-interface" sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        桁架设计助手
      </Typography>
      <Divider />
      
      <Box className="chat-messages" sx={{ height: '60vh', overflow: 'auto' }}>
        <List>
          {conversations.map((conv, index) => (
            <React.Fragment key={index}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary="您"
                  secondary={conv.message}
                  className="user-message"
                />
              </ListItem>
              <ListItem alignItems="flexstart">
                <ListItemText
                  primary="AI助手"
                  secondary={conv.response}
                  className="ai-response"
                />
              </ListItem>
              {index < conversations.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Box>
      
      <Box className="chat-input" sx={{ mt: 2 }}>
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
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          disabled={isLoading || !message.trim()}
          endIcon={<SendIcon />}
          sx={{ mt: 1 }}
        >
          {isLoading ? <LoadingSpinner size={20} /> : '发送'}
        </Button>
      </Box>
    </Box>
  );
};

export default ChatInterface;