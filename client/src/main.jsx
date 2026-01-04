import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <--- Import Router
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'
import { offlineDB } from './utils/offlineDB'

// Initialize offline database
offlineDB.init().then(() => {
  console.log('✅ Offline database initialized');
}).catch((error) => {
  console.error('❌ Failed to initialize offline database:', error);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* <--- WRAP EVERYTHING HERE */}
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>,
)

// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import ErrorBoundary from './components/ErrorBoundary.jsx'
// import './index.css'
// import { offlineDB } from './utils/offlineDB'

// // Initialize offline database
// offlineDB.init().then(() => {
//   console.log('✅ Offline database initialized');
// }).catch((error) => {
//   console.error('❌ Failed to initialize offline database:', error);
// });

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <ErrorBoundary>
//       <App />
//     </ErrorBoundary>
//   </React.StrictMode>,
// )

