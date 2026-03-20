import axios from 'axios';

axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: 'https://db24-49-36-144-43.ngrok-free.app/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// This line fixes the "does not provide an export named 'default'" error
export default api;