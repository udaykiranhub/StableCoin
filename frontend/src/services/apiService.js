import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handler
const handleError = (error) => {
  if (error.response) {
    console.error('API Error:', error.response.data);
    throw new Error(error.response.data.error || 'API Error');
  } else if (error.request) {
    console.error('No response received:', error.request);
    throw new Error('No response from server');
  } else {
    console.error('Request error:', error.message);
    throw new Error('Request failed');
  }
};

export const createPaymentOrder = async (amount, userAddress, userName = '', userEmail = '') => {
  try {
    const response = await api.post('/create-order', {
      amount,
      userAddress,
      userName,
      userEmail
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const verifyPayment = async (paymentData) => {
  try {
    const response = await api.post('/verify-payment', paymentData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateTransaction = async (razorpayPaymentId, transactionHash) => {
  try {
    const response = await api.post('/update-transaction', {
      razorpayPaymentId,
      transactionHash
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getUserPayments = async (address) => {
  try {
    const response = await api.get(`/payments/user/${address}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getAllPayments = async () => {
  try {
    const response = await api.get('/payments');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getPendingPayments = async () => {
  try {
    const response = await api.get('/payments/pending');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};