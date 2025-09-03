import React from 'react';
import { Grid, Paper } from '@mui/material';
import ChatInterface from '../ChatInterface/ChatInterface';
import TrussVisualization from '../Visualization/TrussVisualization';

const TrussDesigner = () => {
  return (
    <div className="truss-designer">
      <Grid container spacing={2} sx={{ padding: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} className="panel">
            <ChatInterface />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} className="panel">
            <TrussVisualization />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default TrussDesigner;