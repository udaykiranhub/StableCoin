import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Payment functions
export const createPaymentOrder = async (amount, userAddress) => {
  try {
    const response = await api.post('/create-order', {
      amount,
      userAddress
    });
    return response.data;
  } catch (error) {
    console.error('Payment order error:', error);
    throw error;
  }
};

export const verifyPayment = async (paymentData) => {
  try {
    const response = await api.post('/verify-payment', paymentData);
    return response.data;
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
};

// ADD THIS FUNCTION for updating transaction
export const updateTransaction = async (razorpayPaymentId, transactionHash) => {
  try {
    const response = await api.post('/update-transaction', {
      razorpayPaymentId,
      transactionHash
    });
    return response.data;
  } catch (error) {
    console.error('Update transaction error:', error);
    throw error;
  }
};

export const getUserPayments = async (address) => {
  try {
    const response = await api.get(`/payments/user/${address}`);
    return response.data;
  } catch (error) {
    console.error('Get payments error:', error);
    return { payments: [] };
  }
};

export const getPendingPayments = async () => {
  try {
    const response = await api.get('/payments/pending');
    return response.data;
  } catch (error) {
    console.error('Get pending payments error:', error);
    return { payments: [] };
  }
};

export const getAllPayments = async () => {
  try {
    const response = await api.get('/payments');
    return response.data;
  } catch (error) {
    console.error('Get all payments error:', error);
    return { payments: [] };
  }
};

// Health check
export const checkBackendHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return { status: 'unhealthy' };
  }
};