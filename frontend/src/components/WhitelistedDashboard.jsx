import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Alert, Badge, Modal } from 'react-bootstrap';
import { getContract, getCurrentAccount } from '../services/web3Service';
import { getPendingPayments } from '../services/apiService';

const WhitelistedDashboard = ({ userAddress, whitelistStatus }) => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showMintModal, setShowMintModal] = useState(false);
  const [showBurnModal, setShowBurnModal] = useState(false);
  const [burnData, setBurnData] = useState({ address: '', amount: '' });

  useEffect(() => {
    if (whitelistStatus.canMint) {
      fetchPendingPayments();
    }
  }, [whitelistStatus.canMint]);

  const fetchPendingPayments = async () => {
    try {
      const data = await getPendingPayments();
      setPendingPayments(data.payments || []);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
    }
  };

  // FIXED: Properly handle BigInt decimals
  const handleMintTokens = async () => {
    if (!selectedPayment) return;
    
    setLoading(true);
    try {
      const contract = getContract();
      const account = await getCurrentAccount();
      
      // Get decimals from contract - it's returned as BigInt
      const decimalsBigInt = await contract.methods.decimals().call();
      
      // Convert BigInt to number
      const decimals = Number(decimalsBigInt);
      
      // Convert amount to the correct units
      const amountInBaseUnits = Math.floor(selectedPayment.amountINR * Math.pow(10, decimals));
      
      // Call mintTokens function
      const tx = await contract.methods.mintTokens(
        selectedPayment.userAddress,
        amountInBaseUnits.toString(),
        selectedPayment.razorpayPaymentId
      ).send({ from: account });
      
      alert(`✅ Tokens minted successfully!\nTransaction: ${tx.transactionHash.substring(0, 20)}...`);
      setShowMintModal(false);
      fetchPendingPayments(); // Refresh list
      
    } catch (error) {
      console.error('Error minting tokens:', error);
      alert(`❌ Failed to mint tokens: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Properly handle BigInt decimals
  const handleBurnTokens = async () => {
    if (!burnData.address || !burnData.amount) {
      alert('Please fill all fields');
      return;
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(burnData.address)) {
      alert('Please enter a valid Ethereum address');
      return;
    }
    
    if (isNaN(burnData.amount) || burnData.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    setLoading(true);
    try {
      const contract = getContract();
      const account = await getCurrentAccount();
      
      // Get decimals from contract - it's returned as BigInt
      const decimalsBigInt = await contract.methods.decimals().call();
      
      // Convert BigInt to number
      const decimals = Number(decimalsBigInt);
      
      // Convert amount to the correct units
      const amountInBaseUnits = Math.floor(parseFloat(burnData.amount) * Math.pow(10, decimals));
      
      // Call burnTokens function
      const tx = await contract.methods.burnTokens(
        burnData.address,
        amountInBaseUnits.toString()
      ).send({ from: account });
      
      alert(`✅ Tokens burned successfully!\nTransaction: ${tx.transactionHash.substring(0, 20)}...`);
      setShowBurnModal(false);
      setBurnData({ address: '', amount: '' });
      
    } catch (error) {
      console.error('Error burning tokens:', error);
      alert(`❌ Failed to burn tokens: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <Container fluid className="mt-4">
      <h2 className="mb-4">⚡ Whitelisted Dashboard</h2>
      
      <Row className="mb-4">
        <Col>
          <Alert variant="info" className="border-0" style={{ backgroundColor: '#e7f3ff' }}>
            <div className="d-flex align-items-center">
              <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>🎯</span>
              <div>
                <strong>Whitelist Privileges:</strong>
                <div className="d-flex gap-3 mt-2">
                  {whitelistStatus.canMint && <Badge bg="success">Can Mint Tokens</Badge>}
                  {whitelistStatus.canBurn && <Badge bg="danger">Can Burn Tokens</Badge>}
                </div>
              </div>
            </div>
          </Alert>
        </Col>
      </Row>
      
      {/* Minting Section */}
      {whitelistStatus.canMint && (
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
              <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">🪙 Pending Token Mints</h5>
                <Badge bg="primary" pill>{pendingPayments.length} pending</Badge>
              </Card.Header>
              <Card.Body>
                {pendingPayments.length === 0 ? (
                  <Alert variant="success" className="text-center border-0">
                    <span style={{ fontSize: '3rem' }}>🎉</span>
                    <h5 className="mt-3">No pending mints</h5>
                    <p className="text-muted">All payments have been processed</p>
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead>
                        <tr>
                          <th>User Address</th>
                          <th>Amount (₹)</th>
                          <th>Payment ID</th>
                          <th>Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingPayments.map((payment) => (
                          <tr key={payment._id}>
                            <td>
                              <code>{formatAddress(payment.userAddress)}</code>
                            </td>
                            <td className="fw-bold">₹{payment.amountINR}</td>
                            <td>
                              <small className="text-muted">
                                {payment.razorpayPaymentId?.substring(0, 10)}...
                              </small>
                            </td>
                            <td>
                              <small>{new Date(payment.paymentTimestamp).toLocaleDateString()}</small>
                            </td>
                            <td>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setShowMintModal(true);
                                }}
                              >
                                Mint Tokens
                              </Button>
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
      )}
      
      {/* Burning Section */}
      {whitelistStatus.canBurn && (
        <Row>
          <Col>
            <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
              <Card.Header className="bg-white border-0">
                <h5 className="mb-0">🔥 Burn Tokens (Whitelisted)</h5>
              </Card.Header>
              <Card.Body>
                <Alert variant="warning" className="border-0" style={{ backgroundColor: '#fff3cd' }}>
                  <small>
                    <strong>Warning:</strong> As a whitelisted burner, you can burn tokens from any address.
                    This action is irreversible. Use this privilege responsibly.
                  </small>
                </Alert>
                
                <Form>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Recipient Address</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="0x..."
                          value={burnData.address}
                          onChange={(e) => setBurnData({...burnData, address: e.target.value})}
                          style={{ fontFamily: 'monospace' }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Amount to Burn</Form.Label>
                        <div className="input-group">
                          <Form.Control
                            type="number"
                            placeholder="Amount"
                            value={burnData.amount}
                            onChange={(e) => setBurnData({...burnData, amount: e.target.value})}
                            min="1"
                            step="1"
                          />
                          <span className="input-group-text">INRT</span>
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={2} className="d-flex align-items-end">
                      <Button
                        variant="danger"
                        onClick={() => setShowBurnModal(true)}
                        disabled={!burnData.address || !burnData.amount}
                        className="w-100"
                      >
                        Burn
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      
      {/* Mint Confirmation Modal */}
      <Modal show={showMintModal} onHide={() => setShowMintModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>Confirm Token Minting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment && (
            <>
              <div className="text-center mb-4">
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#007bff',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem'
                }}>
                  🪙
                </div>
              </div>
              
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Recipient:</span>
                  <code>{formatAddress(selectedPayment.userAddress)}</code>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Amount:</span>
                  <span className="fw-bold">₹{selectedPayment.amountINR}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Tokens:</span>
                  <span className="fw-bold">{selectedPayment.amountINR} INRT</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Payment ID:</span>
                  <small className="fw-bold">{selectedPayment.razorpayPaymentId?.substring(0, 12)}...</small>
                </div>
              </div>
              
              <Alert variant="info" className="border-0">
                <small>
                  This will mint {selectedPayment.amountINR} INRT tokens to the user's address.
                  Gas fee will be charged for this transaction.
                </small>
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShowMintModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleMintTokens}
            disabled={loading}
          >
            {loading ? 'Minting...' : 'Confirm Mint'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Burn Confirmation Modal */}
      <Modal show={showBurnModal} onHide={() => setShowBurnModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>Confirm Token Burning</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#dc3545',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.5rem'
            }}>
              🔥
            </div>
          </div>
          
          <Alert variant="danger" className="border-0" style={{ backgroundColor: '#f8d7da' }}>
            <small>
              <strong>⚠️ Warning:</strong> This will permanently burn {burnData.amount} INRT tokens from {formatAddress(burnData.address)}.
              This action cannot be undone. Are you sure you want to proceed?
            </small>
          </Alert>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShowBurnModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleBurnTokens}
            disabled={loading}
          >
            {loading ? 'Burning...' : 'Confirm Burn'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default WhitelistedDashboard;