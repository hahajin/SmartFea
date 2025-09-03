import React from 'react';
import { CircularProgress } from '@mui/material';

const LoadingSpinner = ({ size = 24 }) => {
  return <CircularProgress size={size} />;
};

export default LoadingSpinner;