
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

// Add some debugging
console.log('Starting React application...');
console.log('React version:', React.version);

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Could not find root element");
  throw new Error("Could not find root element to mount to");
}

console.log('Root element found, creating React root...');

const root = ReactDOM.createRoot(rootElement);

try {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log('React app rendered successfully');
} catch (error) {
  console.error('Error rendering React app:', error);
}
