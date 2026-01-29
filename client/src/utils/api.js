import axios from 'axios';

// Automatically detects if you are on localhost or production
const BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://vesto-server.onrender.com/api' // <--- REPLACE THIS later with your actual Render URL
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;