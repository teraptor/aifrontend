import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8088',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient; 