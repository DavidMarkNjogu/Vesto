import api from '../utils/api';

// Automatically detects if you are on localhost or production
const API_URL = import.meta.env.MODE === 'production' 
  ? 'https://your-backend-name.onrender.com/api' // You will get this URL from Render later
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

export default api;