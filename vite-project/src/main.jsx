import React from 'react'; // Imports React library
import ReactDOM from 'react-dom/client'; // Imports ReactDOM for browser rendering
import './index.css'; // Imports global CSS (often where Tailwind directives go)
import App from './App'; // Imports your main application component

// Creates a root for concurrent mode rendering (React 18+)
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renders the App component into the root DOM element
root.render(
  <React.StrictMode>
    <App /> {/* Your entire application starts here */}
  </React.StrictMode>
);

// Optional: For performance monitoring
// reportWebVitals();