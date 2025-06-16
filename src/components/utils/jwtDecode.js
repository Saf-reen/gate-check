// utils/jwtDecode.js - Fixed import for jwt-decode package
import { jwtDecode } from 'jwt-decode'; // Named import, not default

// Function to decode JWT
const decodeJwtToken = (token) => {
  try {
    // Check if token exists
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token format');
    }

    // Decode the JWT token and return the decoded payload
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null; // Return null in case of an error
  }
};

// Helper function to check if token is expired
export const isTokenExpired = (token) => {
  const decoded = decodeJwtToken(token);
  if (!decoded || !decoded.exp) {
    return true; // Consider invalid tokens as expired
  }
  
  // exp is in seconds, Date.now() is in milliseconds
  return Date.now() >= decoded.exp * 1000;
};

// Helper function to get token expiration time
export const getTokenExpirationTime = (token) => {
  const decoded = decodeJwtToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }
  
  return new Date(decoded.exp * 1000);
};

// Helper function to get remaining time in seconds
export const getTokenRemainingTime = (token) => {
  const decoded = decodeJwtToken(token);
  if (!decoded || !decoded.exp) {
    return 0;
  }
  
  const remainingSeconds = decoded.exp - Math.floor(Date.now() / 1000);
  return Math.max(0, remainingSeconds);
};

export default decodeJwtToken;