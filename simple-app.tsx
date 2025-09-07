import React from 'react';
import ReactDOM from 'react-dom/client';

// 最简单的React组件
function SimpleApp() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🎉 React is Working!</h1>
        <p className="text-xl text-slate-300">Simple test successful</p>
        <div className="mt-8 p-4 bg-green-900/30 border border-green-500 rounded-lg">
          <p className="text-green-400">✅ If you can see this, React is rendering correctly</p>
        </div>
      </div>
    </div>
  );
}

// 添加错误处理
try {
  console.log('🚀 Starting simple React app...');
  console.log('React version:', React.version);
  
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  console.log('✅ Root element found');
  
  const root = ReactDOM.createRoot(rootElement);
  console.log('✅ React root created');
  
  root.render(<SimpleApp />);
  console.log('✅ React app rendered');
  
} catch (error) {
  console.error('❌ Error in simple React app:', error);
  
  // 如果React失败，显示原生HTML错误信息
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="min-height: 100vh; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; font-family: system-ui;">
        <div style="text-align: center; background: #1e293b; padding: 2rem; border-radius: 8px; border: 2px solid #ef4444;">
          <h1 style="color: #ef4444; font-size: 2rem; margin-bottom: 1rem;">React Failed to Load</h1>
          <p style="margin-bottom: 1rem;">Error: ${error.message}</p>
          <p style="color: #94a3b8;">Check browser console for details</p>
        </div>
      </div>
    `;
  }
}

export default SimpleApp;
