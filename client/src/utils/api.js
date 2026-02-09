import axios from 'axios';

// Automatically detects if you are on localhost or production
// const BASE_URL = import.meta.env.MODE === 'production' 
//   ? 'https://vesto-server.onrender.com/api' // <--- REPLACE THIS later with your actual Render URL
//   : 'http://localhost:5000/api';

// ⚠️ FORCE THE LIVE URL (We will make this smart again later)
const BASE_URL = 'https://vesto-server.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a console log so we can see it in the browser F12 tools
console.log('🔗 API Connected to:', BASE_URL);

export default api;