import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Header from './components/common/Header';
import TrussDesigner from './components/TrussDesigner/TrussDesigner';
import ErrorBoundary from './components/common/ErrorBoundary';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="App">
          <Header />
          <TrussDesigner />
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;