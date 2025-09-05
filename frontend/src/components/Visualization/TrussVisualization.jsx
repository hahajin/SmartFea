import React, { useEffect, useRef, useState } from 'react';
import { Typography, Box } from '@mui/material';
import Plotly from 'plotly.js-dist';
import { useChatHistory } from '../../hooks/useChatHistory';
import { plotlyConfig } from '../../utils/plotlyConfig';

const TrussVisualization = () => {
  const plotRef = useRef(null);
  const { conversations } = useChatHistory();
  const [isPlotReady, setIsPlotReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize empty plot
    if (plotRef.current && !isPlotReady) {
      initializePlot();
      setIsPlotReady(true);
    }
  }, []);

  useEffect(() => {
    // Update plot when new truss data is available
    if (isPlotReady && conversations.length > 0) {
      const latestConversation = conversations[0];
      if (latestConversation && latestConversation.truss_data) {
        drawTruss(latestConversation.truss_data);
      }
    }
  }, [conversations, isPlotReady]);

  const initializePlot = () => {
    if (!plotRef.current) return;
    
    const layout = {
      ...plotlyConfig.layout,
      title: '等待桁架数据...',
      showlegend: false,
    };
    
    Plotly.newPlot(plotRef.current, [], layout, { responsive: true });
  };

  const drawTruss = (trussData) => {
    if (!plotRef.current || !trussData) return;
    
    const { nodes, elements, span, height } = trussData;
    
    if (!nodes || !elements) {
      console.warn('Invalid truss data: missing nodes or elements');
      return;
    }
    
    try {
      // Prepare node data
      const nodeX = nodes.map(node => node[0]);
      const nodeY = nodes.map(node => node[1]);
      const nodeZ = nodes.map(node => node[2] || 0); // Default Z to 0 if not provided
      
      // Prepare element data
      const elementX = [];
      const elementY = [];
      const elementZ = [];
      
      elements.forEach(element => {
        const [start, end] = element;
        if (nodes[start] && nodes[end]) {
          elementX.push(nodes[start][0], nodes[end][0], null);
          elementY.push(nodes[start][1], nodes[end][1], null);
          elementZ.push(nodes[start][2] || 0, nodes[end][2] || 0, null);
        }
      });
      
      const elementTrace = {
        x: elementX,
        y: elementY,
        z: elementZ,
        mode: 'lines',
        line: {
          color: 'red',
          width: 4
        },
        type: 'scatter3d',
        name: '构件',
        hoverinfo: 'none'
      };
      
      const nodeTrace = {
        x: nodeX,
        y: nodeY,
        z: nodeZ,
        mode: 'markers+text',
        marker: {
          size: 6,
          color: 'blue',
        },
        text: nodes.map((_, i) => `N${i+1}`),
        textposition: 'top center',
        type: 'scatter3d',
        name: '节点'
      };
      
      const layout = {
        ...plotlyConfig.layout,
        title: `桁架结构 (跨度: ${span}m, 高度: ${height}m)`,
        scene: {
          ...plotlyConfig.layout.scene,
          xaxis: { 
            ...plotlyConfig.layout.scene.xaxis, 
            title: '长度 (m)',
            range: [Math.min(...nodeX) - 1, Math.max(...nodeX) + 1]
          },
          yaxis: { 
            ...plotlyConfig.layout.scene.yaxis, 
            title: '高度 (m)',
            range: [Math.min(...nodeY) - 1, Math.max(...nodeY) + 1]
          },
          zaxis: { 
            ...plotlyConfig.layout.scene.zaxis, 
            title: '宽度 (m)',
            range: [Math.min(...nodeZ) - 1, Math.max(...nodeZ) + 1]
          },
        }
      };
      
      Plotly.react(plotRef.current, [elementTrace, nodeTrace], layout, { responsive: true });
      
    } catch (error) {
      console.error('Error drawing truss:', error);
    }
  };

  return (
    <Box className="truss-visualization" sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        3D桁架可视化
      </Typography>
      <Box 
        ref={plotRef} 
        className="truss-plot"
        sx={{ 
          width: '100%', 
          height: 'calc(100% - 60px)',
          minHeight: '400px',
          border: '1px solid #ddd',
          borderRadius: 1
        }}
      />
    </Box>
  );
};

export default TrussVisualization;