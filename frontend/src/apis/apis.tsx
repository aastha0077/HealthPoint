
    // apiClient.js
import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/api', // Your API base URL
    timeout: 5000, // Request timeout in milliseconds
      headers: {
        'Content-Type': 'application/json',
        
      },
    });

export {apiClient}