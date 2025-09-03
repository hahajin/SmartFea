// import React from 'react';
// import { Typography, Box, Button } from '@mui/material';

// class ErrorBoundary extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { hasError: false, error: null };
//   }

//   static getDerivedStateFromError(error) {
//     return { hasError: true, error };
//   }

//   componentDidCatch(error, errorInfo) {
//     console.error('Error caught by boundary:', error, errorInfo);
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <Box sx={{ p: 3, textAlign: 'center' }}>
//           <Typography variant="h5" gutterBottom>
//             出了点问题
//           </Typography>
//           <Typography variant="body1" gutterBottom>
//             应用程序遇到了意外错误。
//           </Typography>
//           <Button 
//             variant="contained" 
//             onClick={() => window.location.reload()}
//           >
//             重新加载页面
//           </Button>
//         </Box>
//       );
//     }

//     return this.props.children;
//   }
// }

// export default ErrorBoundary;


import React from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            出了点问题
          </Typography>
          <Typography variant="body1" gutterBottom>
            应用程序遇到了意外错误。
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5' }}>
            {this.state.error && this.state.error.toString()}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            重新加载页面
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;