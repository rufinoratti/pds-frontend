/**
 * Configuration service to handle environment variables
 */

// Get the API URL from environment variables
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Validate required environment variables
if (!API_URL) {
  console.error('VITE_API_URL is not defined in environment variables');
} 