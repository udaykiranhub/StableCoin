const express = require('express');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// ============ MIDDLEWARE ============
app.use(cors({
  origin: ['http://localhost:5173'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// ============ DATABASE SETUP ============
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/inrt';
    
    // Remove deprecated options
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB connected successfully');
    
    mongoose.connection.on('error', err => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });
    
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
};

// Call connect function
connectDB();

// Payment Schema
const PaymentSchema = new mongoose.Schema({
  // User Info
  userAddress: { 
    type: String, 
    required: true,
    lowercase: true 
  },
  userName: String,
  userEmail: String,
  
  // Payment Info
  amountINR: { type: Number, required: true },
  razorpayOrderId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  razorpayPaymentId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  razorpaySignature: String,
  
  // Status Tracking
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'verified', 'failed'],
    default: 'pending'
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  paymentTimestamp: Date,
  verifiedAt: Date,
  
  // Blockchain Info
  transactionHash: String,
  tokensMinted: { type: Number, default: 0 },
  mintedAt: Date,
  
  // Metadata
  notes: Object
});

const Payment = mongoose.model('Payment', PaymentSchema);

// ============ RAZORPAY SETUP ============
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_OxJmN5zjxxmLtj',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'PEkc47E2WCXLUDU5gzftYMsi',
});

// ============ UTILITY FUNCTIONS ============
function validateAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// ============ ROUTES ============

// 1. Create Razorpay Order
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, userAddress, userName, userEmail } = req.body;
    
    // Validate inputs
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid amount' 
      });
    }
    
    if (!userAddress || !validateAddress(userAddress)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid Ethereum address' 
      });
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `inrt_${Date.now()}_${userAddress.substring(2, 10)}`,
      notes: {
        userAddress: userAddress,
        amountINR: amount,
        timestamp: Date.now()
      }
    };

    const order = await razorpay.orders.create(options);
    console.log('✅ Order created:', order.id, 'for:', userAddress);

    // Save to database
    const payment = new Payment({
      userAddress: userAddress.toLowerCase(),
      userName: userName,
      userEmail: userEmail,
      amountINR: amount,
      razorpayOrderId: order.id,
      status: 'pending',
      notes: {
        description: `Purchase of ${amount} INRT tokens`
      }
    });

    await payment.save();

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        createdAt: order.created_at
      },
      userAddress: userAddress,
      amountINR: amount
    });

  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create payment order'
    });
  }
});

// 2. Verify Payment
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      userAddress 
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing payment details' 
      });
    }

    // Find payment
    const payment = await Payment.findOne({ 
      razorpayOrderId: razorpay_order_id 
    });
    
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Payment not found' 
      });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'PEkc47E2WCXLUDU5gzftYMsi')
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      payment.status = 'failed';
      await payment.save();
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid payment signature' 
      });
    }

    // Update payment
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = 'completed';
    payment.paymentTimestamp = new Date();
    await payment.save();

    console.log('✅ Payment verified:', razorpay_payment_id);

    res.json({
      success: true,
      message: 'Payment verified successfully',
      payment: {
        id: payment._id,
        userAddress: payment.userAddress,
        amountINR: payment.amountINR,
        razorpayPaymentId: razorpay_payment_id,
        status: payment.status
      },
      mintingData: {
        userAddress: payment.userAddress,
        amount: payment.amountINR,
        paymentId: razorpay_payment_id
      }
    });

  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to verify payment'
    });
  }
});

// 3. Update with Transaction Hash
app.post('/api/update-transaction', async (req, res) => {
  try {
    const { 
      razorpayPaymentId, 
      transactionHash 
    } = req.body;

    if (!razorpayPaymentId || !transactionHash) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing details' 
      });
    }

    const payment = await Payment.findOne({ 
      razorpayPaymentId: razorpayPaymentId 
    });
    
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Payment not found' 
      });
    }

    payment.transactionHash = transactionHash;
    payment.tokensMinted = payment.amountINR;
    payment.mintedAt = new Date();
    payment.status = 'verified';
    
    await payment.save();

    console.log('✅ Transaction updated:', transactionHash);

    res.json({
      success: true,
      message: 'Transaction updated',
      payment: {
        id: payment._id,
        transactionHash: payment.transactionHash,
        tokensMinted: payment.tokensMinted
      }
    });

  } catch (error) {
    console.error('❌ Error updating transaction:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update transaction' 
    });
  }
});

// 4. Get User Payments
app.get('/api/payments/user/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!validateAddress(address)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid address' 
      });
    }

    const payments = await Payment.find({ 
      userAddress: address.toLowerCase() 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      payments: payments
    });

  } catch (error) {
    console.error('❌ Error fetching payments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch payments' 
    });
  }
});

// 5. Get All Payments (Admin)
app.get('/api/payments', async (req, res) => {
  try {
    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      count: payments.length,
      payments: payments
    });

  } catch (error) {
    console.error('❌ Error fetching payments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch payments' 
    });
  }
});

// 6. Get Pending Payments
app.get('/api/payments/pending', async (req, res) => {
  try {
    const pendingPayments = await Payment.find({ 
      status: 'completed',
      transactionHash: { $exists: false }
    }).sort({ paymentTimestamp: 1 });

    res.json({
      success: true,
      pendingCount: pendingPayments.length,
      payments: pendingPayments
    });

  } catch (error) {
    console.error('❌ Error fetching pending payments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch pending payments' 
    });
  }
});

// 7. Health Check
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.json({
      status: 'healthy',
      service: 'INRT Payment Backend',
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// 8. Test Endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend is working!',
    endpoints: [
      'POST /api/create-order',
      'POST /api/verify-payment',
      'POST /api/update-transaction',
      'GET  /api/payments/user/:address',
      'GET  /api/payments',
      'GET  /api/payments/pending',
      'GET  /api/health'
    ]
  });
});

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  💰 INRT Payment Backend Server
  ================================
  ✅ Server running on port ${PORT}
  ✅ Razorpay: Test mode
  ✅ Ready to accept payments!
  ================================
  📍 Test the API:
  curl http://localhost:${PORT}/api/test
  ================================
  `);
});