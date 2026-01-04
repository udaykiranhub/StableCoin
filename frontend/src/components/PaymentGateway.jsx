import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Spinner, Modal } from 'react-bootstrap';
import { createPaymentOrder, verifyPayment } from '../services/apiService';
import { getContract, getCurrentAccount } from '../services/web3Service';

const PaymentGateway = ({ userAddress, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    script.onerror = () => {
      setError('Failed to load payment gateway. Please refresh the page.');
    };
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
    setSuccess('');

    try {
      // Create payment order
      const orderData = await createPaymentOrder(amount, userAddress);
      
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Initialize Razorpay
      const options = {
        key: 'rzp_test_OxJmN5zjxxmLtj',
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'INRT Token Purchase',
        description: `Purchase ${amount} INRT tokens`,
        order_id: orderData.order.id,
        handler: async (response) => {
          await handlePaymentSuccess(response, orderData.order.id);
        },
        prefill: {
          name: 'INRT User',
          email: 'user@inrt.com',
          contact: '9999999999'
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();

    } catch (err) {
      setError(err.message || 'Payment initiation failed');
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (response, orderId) => {
    try {
      // Verify payment with backend
      const verification = await verifyPayment({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: orderId,
        razorpay_signature: response.razorpay_signature,
        userAddress: userAddress
      });

      if (verification.success) {
        setPaymentInfo(verification.mintingData);
        setSuccess(`✅ Payment successful! Payment ID: ${response.razorpay_payment_id}`);
        setShowModal(true);
        if (onSuccess) onSuccess();
      } else {
        setError('Payment verification failed');
      }
    } catch (err) {
      setError('Error verifying payment: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Find the handleMintTokens function and replace it with:

const handleMintTokens = async () => {
  if (!paymentInfo) return;
  
  setLoading(true);
  try {
    const contract = getContract();
    const account = await getCurrentAccount();
    const web3 = getWeb3();
    
    // Get decimals from contract
    const decimals = await contract.methods.decimals().call();
    
    // Convert amount to the correct units (considering decimals)
    const amountInBaseUnits = Math.floor(paymentInfo.amount * Math.pow(10, decimals));
    
    // Call mintTokens function on contract
    const tx = await contract.methods.mintTokens(
      account,
      amountInBaseUnits.toString(), // Convert to string to avoid BigInt issues
      paymentInfo.paymentId
    ).send({ from: account });
    
    setSuccess(`✅ Tokens minted successfully!\nTransaction: ${tx.transactionHash.substring(0, 20)}...`);
    setShowModal(false);
    
    if (onSuccess) onSuccess();
    
  } catch (err) {
    console.error('Minting error:', err);
    setError('Failed to mint tokens: ' + err.message);
  } finally {
    setLoading(false);
  }
};

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <>
      <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
        <Card.Header className="bg-white border-0">
          <h5 className="mb-0">💰 Purchase INRT Tokens</h5>
        </Card.Header>
        <Card.Body>
          <Alert variant="info" className="border-0" style={{ backgroundColor: '#e7f3ff' }}>
            <div className="d-flex align-items-center">
              <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>💡</span>
              <div>
                <strong>1 INRT = 1 Indian Rupee</strong>
                <small className="d-block text-muted">Purchase tokens with secure Razorpay gateway</small>
              </div>
            </div>
          </Alert>
          
          {error && (
            <Alert variant="danger" className="border-0">
              <small>{error}</small>
            </Alert>
          )}
          
          {success && !showModal && (
            <Alert variant="success" className="border-0">
              <small>{success}</small>
            </Alert>
          )}
          
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Amount in INR</Form.Label>
            <div className="input-group input-group-lg">
              <span className="input-group-text bg-light border-end-0">₹</span>
              <Form.Control
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="1"
                placeholder="Enter amount"
                disabled={loading}
                className="border-start-0"
              />
            </div>
            <Form.Text className="text-muted">
              Minimum purchase: ₹1 (1 INRT)
            </Form.Text>
          </Form.Group>
          
          <Button
            variant="primary"
            onClick={handlePayment}
            disabled={loading || !userAddress}
            className="w-100 py-3"
            style={{ borderRadius: '10px' }}
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              <>
                <span style={{ fontSize: '1.2rem', marginRight: '10px' }}>💳</span>
                Buy INRT Tokens
              </>
            )}
          </Button>
          
          {!userAddress && (
            <Alert variant="warning" className="mt-3 border-0 text-center">
              <small>Please connect your wallet to make a purchase</small>
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Mint Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>🎉 Payment Verified!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#28a745',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '2rem',
              marginBottom: '1rem'
            }}>
              ✓
            </div>
            <h5>Ready to Mint Tokens</h5>
          </div>
          
          {paymentInfo && (
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Amount:</span>
                <span className="fw-bold">₹{paymentInfo.amount}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tokens:</span>
                <span className="fw-bold">{paymentInfo.amount} INRT</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Recipient:</span>
                <span className="fw-bold">{formatAddress(userAddress)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Payment ID:</span>
                <small className="fw-bold">{paymentInfo.paymentId.substring(0, 15)}...</small>
              </div>
            </div>
          )}
          
          <Alert variant="warning" className="border-0" style={{ backgroundColor: '#fff3cd' }}>
            <small>
              <strong>Note:</strong> You need to be whitelisted as a minter to mint tokens.
              This will require a blockchain transaction (gas fee applies).
            </small>
          </Alert>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleMintTokens}
            disabled={loading}
          >
            {loading ? 'Minting...' : 'Mint Tokens'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PaymentGateway;