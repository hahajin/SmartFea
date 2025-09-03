import React, { useEffect, useRef } from 'react';
import { Typography, Box } from '@mui/material';
import Plotly from 'plotly.js-dist';
import { useChatHistory } from '../../hooks/useChatHistory';
import { plotlyConfig } from '../../utils/plotlyConfig';

const TrussVisualization = () => {
  const plotRef = useRef(null);
  const { conversations } = useChatHistory();

  useEffect(() => {
    // 当有新的桁架数据时更新3D图
    if (conversations.length > 0 && conversations[0].truss_data) {
      drawTruss(conversations[0].truss_data);
    }
  }, [conversations]);

  const drawTruss = (trussData) => {
    if (!plotRef.current) return;
    
    const { nodes, elements, span, height } = trussData;
    
    // 准备节点数据
    const nodeX = nodes.map(node => node[0]);
    const nodeY = nodes.map(node => node[1]);
    const nodeZ = nodes.map(node => node[2]);
    
    // 准备构件数据
    const elementX = [];
    const elementY = [];
    const elementZ = [];
    
    elements.forEach(element => {
      const [start, end] = element;
      elementX.push(nodes[start][0], nodes[end][0], null);
      elementY.push(nodes[start][1], nodes[end][1], null);
      elementZ.push(nodes[start][2], nodes[end][2], null);
    });
    
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
      textposition: 'top',
      type: 'scatter3d',
      name: '节点'
    };
    
    const elementTrace = {
      x: elementX,
      y: elementY,
      z: elementZ,
      mode: 'lines',
      line: {
        color: 'red',
        width: 5
      },
      type: 'scatter3d',
      name: '构件',
      hoverinfo: 'none'
    };
    
    const layout = {
      ...plotlyConfig.layout,
      title: `桁架结构 (跨度: ${span}m, 高度: ${height}m)`,
      scene: {
        ...plotlyConfig.layout.scene,
        xaxis: { ...plotlyConfig.layout.scene.xaxis, title: '长度 (m)' },
        yaxis: { ...plotlyConfig.layout.scene.yaxis, title: '高度 (m)' },
        zaxis: { ...plotlyConfig.layout.scene.zaxis, title: '宽度 (m)' },
      }
    };
    
    Plotly.react(plotRef.current, [elementTrace, nodeTrace], layout);
  };

  return (
    <Box className="truss-visualization" sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        3D桁架可视化
      </Typography>
      <Box 
        ref={plotRef} 
        className="truss-plot"
        sx={{ width: '100%', height: '500px' }}
      />
    </Box>
  );
};

export default TrussVisualization;