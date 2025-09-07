
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// 简单的测试组件
function TestApp() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-4">✅ React is Working!</h1>
        <p className="text-xl text-slate-300 mb-8">The application is loading correctly.</p>
        
        <div className="grid gap-4">
          <div className="p-4 bg-green-900/30 border border-green-500 rounded-lg">
            <h2 className="text-lg font-semibold text-green-400 mb-2">✅ JavaScript</h2>
            <p className="text-green-300">ES6 modules are working</p>
          </div>
          
          <div className="p-4 bg-blue-900/30 border border-blue-500 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-400 mb-2">✅ React</h2>
            <p className="text-blue-300">React {React.version} is rendering</p>
          </div>
          
          <div className="p-4 bg-purple-900/30 border border-purple-500 rounded-lg">
            <h2 className="text-lg font-semibold text-purple-400 mb-2">✅ Tailwind CSS</h2>
            <p className="text-purple-300">Styles are loading correctly</p>
          </div>
        </div>
        
        <button 
          onClick={() => {
            // 动态加载完整应用
            import('./App').then(({ default: App }) => {
              import('./components/ErrorBoundary').then(({ default: ErrorBoundary }) => {
                const root = ReactDOM.createRoot(document.getElementById('root')!);
                root.render(
                  <React.StrictMode>
                    <ErrorBoundary>
                      <App />
                    </ErrorBoundary>
                  </React.StrictMode>
                );
              });
            }).catch(error => {
              console.error('Failed to load full app:', error);
              alert('Failed to load full app. Check console for details.');
            });
          }}
          className="mt-8 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition-colors"
        >
          Load Full Application
        </button>
      </div>
    </div>
  );
}

// Add comprehensive debugging
console.log('🚀 Starting React application...');
console.log('📦 React version:', React.version);
console.log('🌍 Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  location: window.location.href,
  userAgent: navigator.userAgent
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("❌ Could not find root element");
  document.body.innerHTML = `
    <div style="min-height: 100vh; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; font-family: system-ui;">
      <div style="text-align: center; background: #1e293b; padding: 2rem; border-radius: 8px; border: 2px solid #ef4444;">
        <h1 style="color: #ef4444; font-size: 2rem; margin-bottom: 1rem;">❌ Root Element Missing</h1>
        <p>The element with id="root" was not found in the DOM.</p>
      </div>
    </div>
  `;
  throw new Error("Could not find root element to mount to");
}

console.log('✅ Root element found, creating React root...');

try {
  const root = ReactDOM.createRoot(rootElement);
  console.log('✅ React root created');
  
  root.render(<TestApp />);
  console.log('✅ React app rendered successfully');
} catch (error) {
  console.error('❌ Error rendering React app:', error);
  
  // 如果React完全失败，显示原生HTML
  rootElement.innerHTML = `
    <div style="min-height: 100vh; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; font-family: system-ui;">
      <div style="text-align: center; background: #1e293b; padding: 2rem; border-radius: 8px; border: 2px solid #ef4444;">
        <h1 style="color: #ef4444; font-size: 2rem; margin-bottom: 1rem;">❌ React Failed</h1>
        <p style="margin-bottom: 1rem;">Error: ${error.message}</p>
        <p style="color: #94a3b8;">Check browser console for details</p>
        <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    </div>
  `;
}
