import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.aanyasolutions.com/api/v1',
  withCredentials: true, //    Crucial for sending/receiving HttpOnly cookies
});

export default api;