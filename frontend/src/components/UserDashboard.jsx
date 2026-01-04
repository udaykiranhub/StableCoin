import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Alert, Badge, Spinner, Form } from 'react-bootstrap';
import { getContract, getCurrentAccount } from '../services/web3Service';
import { getUserPayments } from '../services/apiService';
import PaymentGateway from './PaymentGateway';

const UserDashboard = ({ userAddress }) => {
  const [tokenBalance, setTokenBalance] = useState('0');
  const [userReserve, setUserReserve] = useState('0');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [burnAmount, setBurnAmount] = useState('');
  const [burnLoading, setBurnLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (userAddress) {
      fetchUserData();
    }
  }, [userAddress, refreshKey]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const contract = getContract();
      const account = await getCurrentAccount();
      
      // Fetch token balance
      const balance = await contract.methods.balanceOf(account).call();
      const decimals = await contract.methods.decimals().call();
      const balanceInTokens = balance / (10 ** decimals);
      
      // Fetch user reserve
      const reserve = await contract.methods.userReserves(account).call();
      const reserveInTokens = reserve / (10 ** decimals);
      
      // Fetch user payments
      const paymentData = await getUserPayments(account);
      
      setTokenBalance(balanceInTokens.toLocaleString('en-IN', { maximumFractionDigits: 2 }));
      setUserReserve(reserveInTokens.toLocaleString('en-IN', { maximumFractionDigits: 2 }));
      setPayments(paymentData.payments || []);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Find the handleBurnTokens function and replace it with:

const handleBurnTokens = async () => {
  if (!burnAmount || isNaN(burnAmount) || burnAmount <= 0) {
    alert('Please enter a valid amount');
    return;
  }
  
  const currentBalance = parseFloat(tokenBalance.replace(/,/g, ''));
  if (parseFloat(burnAmount) > currentBalance) {
    alert('Insufficient token balance');
    return;
  }
  
  setBurnLoading(true);
  try {
    const contract = getContract();
    const account = await getCurrentAccount();
    const web3 = getWeb3();
    
    // Get decimals from contract
    const decimals = await contract.methods.decimals().call();
    
    // Convert amount to the correct units
    const amountInBaseUnits = Math.floor(parseFloat(burnAmount) * Math.pow(10, decimals));
    
    // Call burnMyTokens function
    const tx = await contract.methods.burnMyTokens(
      amountInBaseUnits.toString()
    ).send({ from: account });
    
    alert(`✅ Tokens burned successfully!\nTransaction Hash: ${tx.transactionHash}`);
    setBurnAmount('');
    fetchUserData(); // Refresh data
    
  } catch (error) {
    console.error('Error burning tokens:', error);
    alert(`❌ Failed to burn tokens: ${error.message}`);
  } finally {
    setBurnLoading(false);
  }
};
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container fluid>
      <h2 className="mb-4">👤 User Dashboard</h2>
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading user data...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <Row className="mb-4">
            <Col md={4}>
              <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
                <Card.Body className="text-center">
                  <Card.Title className="text-muted">Token Balance</Card.Title>
                  <Card.Text className="display-6 fw-bold text-primary">
                    ₹{tokenBalance}
                  </Card.Text>
                  <small className="text-muted">Available INRT Tokens</small>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
                <Card.Body className="text-center">
                  <Card.Title className="text-muted">Your Reserve</Card.Title>
                  <Card.Text className="display-6 fw-bold text-success">
                    ₹{userReserve}
                  </Card.Text>
                  <small className="text-muted">Backing your tokens</small>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
                <Card.Body className="text-center">
                  <Card.Title className="text-muted">Total Transactions</Card.Title>
                  <Card.Text className="display-6 fw-bold text-info">
                    {payments.length}
                  </Card.Text>
                  <small className="text-muted">Payment history</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Purchase and Burn Section */}
          <Row className="mb-4">
            <Col lg={6} className="mb-4">
              <PaymentGateway userAddress={userAddress} onSuccess={() => setRefreshKey(prev => prev + 1)} />
            </Col>
            
            <Col lg={6}>
              <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
                <Card.Header className="bg-white border-0">
                  <h5 className="mb-0">🔥 Burn Tokens</h5>
                </Card.Header>
                <Card.Body>
                  <Alert variant="warning" className="border-0" style={{ backgroundColor: '#fff3cd' }}>
                    <small>
                      <strong>Note:</strong> Burning tokens will permanently remove them from circulation 
                      and reduce your reserve balance. This action is irreversible.
                    </small>
                  </Alert>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Amount to Burn (INRT)</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type="number"
                        placeholder="Enter amount"
                        value={burnAmount}
                        onChange={(e) => setBurnAmount(e.target.value)}
                        min="1"
                        step="1"
                      />
                      <span className="input-group-text">INRT</span>
                    </div>
                    <Form.Text className="text-muted">
                      Available: {tokenBalance} INRT
                    </Form.Text>
                  </Form.Group>
                  
                  <Button
                    variant="danger"
                    onClick={handleBurnTokens}
                    disabled={burnLoading || !burnAmount}
                    className="w-100"
                    size="lg"
                  >
                    {burnLoading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Burning...
                      </>
                    ) : (
                      'Burn My Tokens'
                    )}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Payment History */}
          <Row>
            <Col>
              <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
                <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">📋 Payment History</h5>
                  <Badge bg="light" text="dark">
                    {payments.length} records
                  </Badge>
                </Card.Header>
                <Card.Body>
                  {payments.length === 0 ? (
                    <Alert variant="info" className="text-center border-0">
                      <span style={{ fontSize: '3rem' }}>📭</span>
                      <h5 className="mt-3">No payment history found</h5>
                      <p className="text-muted">Make your first purchase to see transaction history</p>
                    </Alert>
                  ) : (
                    <div className="table-responsive">
                      <Table hover className="mb-0">
                        <thead>
                          <tr>
                            <th>Date & Time</th>
                            <th>Amount (₹)</th>
                            <th>Tokens</th>
                            <th>Status</th>
                            <th>Payment ID</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((payment) => (
                            <tr key={payment._id}>
                              <td>
                                <small>{formatDate(payment.createdAt)}</small>
                              </td>
                              <td className="fw-bold">₹{payment.amountINR}</td>
                              <td>{payment.tokensMinted || 0} INRT</td>
                              <td>
                                <Badge bg={
                                  payment.status === 'verified' ? 'success' :
                                  payment.status === 'completed' ? 'primary' :
                                  payment.status === 'pending' ? 'warning' : 'danger'
                                }>
                                  {payment.status}
                                </Badge>
                              </td>
                              <td>
                                <small className="text-muted">
                                  {payment.razorpayPaymentId?.substring(0, 12)}...
                                </small>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default UserDashboard;