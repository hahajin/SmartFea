export const plotlyConfig = {
  layout: {
    autosize: true,
    margin: { l: 0, r: 0, b: 0, t: 30 },
    scene: {
      aspectmode: 'data',
      camera: {
        eye: { x: 1.5, y: 1.5, z: 1.5 }
      },
      xaxis: { 
        title: 'X轴',
        gridcolor: 'rgb(255, 255, 255)',
        zerolinecolor: 'rgb(255, 255, 255)',
        showbackground: true,
        backgroundcolor: 'rgb(230, 230, 230)'
      },
      yaxis: { 
        title: 'Y轴',
        gridcolor: 'rgb(255, 255, 255)',
        zerolinecolor: 'rgb(255, 255, 255)',
        showbackground: true,
        backgroundcolor: 'rgb(230, 230, 230)'
      },
      zaxis: { 
        title: 'Z轴',
        gridcolor: 'rgb(255, 255, 255)',
        zerolinecolor: 'rgb(255, 255, 255)',
        showbackground: true,
        backgroundcolor: 'rgb(230, 230, 230)'
      }
    }
  }
};