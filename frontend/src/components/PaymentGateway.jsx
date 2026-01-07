import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Spinner, Modal } from 'react-bootstrap';
import { createPaymentOrder, verifyPayment } from '../services/apiService';
import { getContract, getCurrentAccount, convertToTokenUnits, parseContractError } from '../services/web3Service';

const PaymentGateway = ({ userAddress, onPaymentSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = () => {
    if (window.Razorpay) return;
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const handlePayment = async () => {
    if (!userAddress) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount (minimum ₹1)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create payment order
      const orderData = await createPaymentOrder(amount, userAddress);
      
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Initialize Razorpay - FIXED: Use your Razorpay key directly
      const options = {
        key: 'rzp_test_OxJmN5zjxxmLtj', // Your test key directly
        amount: orderData.order.amount,
        currency: 'INR',
        name: 'INRT Token System',
        description: `Purchase ${amount} INRT tokens`,
        order_id: orderData.order.id,
        handler: async (response) => {
          await handlePaymentSuccess(response, orderData.order.id);
        },
        prefill: {
          name: 'INRT User',
          email: 'user@inrt.com'
        },
        theme: { color: '#3399cc' },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment initiation failed');
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (response, orderId) => {
    try {
      // Verify payment
      const verification = await verifyPayment({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: orderId,
        razorpay_signature: response.razorpay_signature,
        userAddress: userAddress
      });

      if (verification.success) {
        setPaymentInfo({
          paymentId: verification.payment.razorpayPaymentId,
          amount: verification.payment.amountINR,
          userAddress: verification.payment.userAddress
        });
        setShowModal(true);
        
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      } else {
        setError('Payment verification failed');
      }
    } catch (err) {
      setError('Error verifying payment');
    } finally {
      setLoading(false);
    }
  };

  const handleMintTokens = async () => {
    if (!paymentInfo) return;
    
    setLoading(true);
    try {
      const contract = getContract();
      const account = getCurrentAccount();
      
      // Convert amount to token units
      const amountInUnits = await convertToTokenUnits(paymentInfo.amount);
      
      // Call mintTokens function - only whitelisted addresses can call this
      const tx = await contract.methods.mintTokens(
        paymentInfo.userAddress,
        amountInUnits,
        paymentInfo.paymentId
      ).send({ from: account });
      
      console.log('Mint successful:', tx.transactionHash);
      
      // Close modal
      setShowModal(false);
      setAmount('');
      
      alert(`✅ Tokens minted successfully!\nTransaction: ${tx.transactionHash}`);
      
    } catch (error) {
      console.error('Mint error:', error);
      setError(parseContractError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="h-100">
        <Card.Header>
          <h5 className="mb-0">💰 Purchase INRT Tokens</h5>
        </Card.Header>
        <Card.Body>
          <Alert variant="info" className="small">
            <strong>1 INRT = 1 Indian Rupee</strong><br/>
            After payment, tokens must be minted by a whitelisted minter.
          </Alert>
          
          {error && (
            <Alert variant="danger" className="small">
              {error}
            </Alert>
          )}
          
          <Form.Group className="mb-4">
            <Form.Label>Amount in INR</Form.Label>
            <div className="input-group">
              <span className="input-group-text">₹</span>
              <Form.Control
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="1"
                placeholder="Enter amount"
                disabled={loading}
              />
              <span className="input-group-text">INRT</span>
            </div>
            <Form.Text className="text-muted">
              Minimum purchase: ₹1 (1 INRT)
            </Form.Text>
          </Form.Group>
          
          <Button
            variant="primary"
            onClick={handlePayment}
            disabled={loading || !userAddress}
            className="w-100"
          >
            {loading ? (
              <>
                <Spinner as="span" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              'Buy INRT Tokens'
            )}
          </Button>
          
          {!userAddress && (
            <Alert variant="warning" className="mt-3 small text-center">
              Connect your wallet to make a purchase
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Mint Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Payment Verified</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {paymentInfo && (
            <>
              <Alert variant="success">
                ✅ Payment verified successfully!
              </Alert>
              
              <div className="mb-3">
                <p><strong>User Address:</strong> {paymentInfo.userAddress}</p>
                <p><strong>Amount Paid:</strong> ₹{paymentInfo.amount}</p>
                <p><strong>Tokens to Mint:</strong> {paymentInfo.amount} INRT</p>
                <p><strong>Payment ID:</strong> {paymentInfo.paymentId}</p>
              </div>
              
              <Alert variant="info" className="small">
                Payment verified. A whitelisted minter can now mint tokens for this payment.
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PaymentGateway;