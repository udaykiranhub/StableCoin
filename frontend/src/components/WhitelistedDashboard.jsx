import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Table, Alert, Badge, Modal, Spinner } from 'react-bootstrap';
import { getContract, getCurrentAccount } from '../services/web3Service';
import { getPendingPayments, updateTransaction } from '../services/apiService';

const WhitelistedDashboard = ({ userAddress, userRoles, onRefresh }) => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [burning, setBurning] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showMintModal, setShowMintModal] = useState(false);
  const [showBurnModal, setShowBurnModal] = useState(false);
  const [burnData, setBurnData] = useState({ address: '', amount: '' });
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (userRoles.canMint) {
      fetchPendingPayments();
    }
  }, [userRoles.canMint]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

  const fetchPendingPayments = async () => {
    setLoading(true);
    try {
      const data = await getPendingPayments();
      setPendingPayments(data.payments || []);
      addLog(`Fetched ${data.payments?.length || 0} pending payments`, 'info');
    } catch (error) {
      addLog(`Error fetching payments: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMintTokens = async () => {
    if (!selectedPayment) return;
    
    setMinting(true);
    addLog(`Starting mint for ${selectedPayment.userAddress}...`, 'info');
    
    try {
      const contract = getContract();
      const account = getCurrentAccount();
      
      if (!account) {
        throw new Error('No wallet connected');
      }
      
      // Convert amount properly - FIXED
      const decimals = await contract.methods.decimals().call();
      const decimalsNum = parseInt(decimals.toString());
      
      // Calculate amount in smallest units (wei equivalent)
      const amountNum = parseFloat(selectedPayment.amountINR);
      const amountInUnits = Math.floor(amountNum * 10**decimalsNum);
      
      addLog(`Calling mintTokens(${selectedPayment.userAddress}, ${amountInUnits}, ${selectedPayment.razorpayPaymentId})`, 'info');
      
      // Call contract - Convert amountInUnits to string to avoid BigInt issues
      const tx = await contract.methods.mintTokens(
        selectedPayment.userAddress,
        amountInUnits.toString(), // Convert to string
        selectedPayment.razorpayPaymentId
      ).send({ from: account });
      
      addLog(`✅ Mint successful! Tx: ${tx.transactionHash}`, 'success');
      
      // Update backend
      await updateTransaction(
        selectedPayment.razorpayPaymentId,
        tx.transactionHash
      );
      
      // Close modal and refresh
      setShowMintModal(false);
      fetchPendingPayments();
      if (onRefresh) onRefresh();
      
      alert(`✅ ${selectedPayment.amountINR} INRT minted to ${selectedPayment.userAddress}\nTransaction: ${tx.transactionHash}`);
      
    } catch (error) {
      addLog(`❌ Mint failed: ${error.message}`, 'error');
      alert(`Mint failed: ${error.message}`);
    } finally {
      setMinting(false);
    }
  };

  const handleBurnTokens = async () => {
    if (!burnData.address || !burnData.amount) {
      alert('Please fill all fields');
      return;
    }
    
    setBurning(true);
    addLog(`Starting burn from ${burnData.address}...`, 'info');
    
    try {
      const contract = getContract();
      const account = getCurrentAccount();
      
      if (!account) {
        throw new Error('No wallet connected');
      }
      
      // Convert amount properly
      const decimals = await contract.methods.decimals().call();
      const decimalsNum = parseInt(decimals.toString());
      const amountNum = parseFloat(burnData.amount);
      const amountInUnits = Math.floor(amountNum * 10**decimalsNum);
      
      addLog(`Calling burnTokens(${burnData.address}, ${amountInUnits})`, 'info');
      
      // Call contract - Convert to string
      const tx = await contract.methods.burnTokens(
        burnData.address,
        amountInUnits.toString() // Convert to string
      ).send({ from: account });
      
      addLog(`✅ Burn successful! Tx: ${tx.transactionHash}`, 'success');
      
      setShowBurnModal(false);
      setBurnData({ address: '', amount: '' });
      if (onRefresh) onRefresh();
      
      alert(`✅ ${burnData.amount} INRT burned from ${burnData.address}\nTransaction: ${tx.transactionHash}`);
      
    } catch (error) {
      addLog(`❌ Burn failed: ${error.message}`, 'error');
      alert(`Burn failed: ${error.message}`);
    } finally {
      setBurning(false);
    }
  };

  const formatAddress = (addr) => {
    return `${addr?.substring(0, 8)}...${addr?.substring(addr.length - 6)}`;
  };

  return (
    <div className="whitelisted-dashboard">
      {/* Role Badges */}
      <Alert variant="info" className="mb-4">
        <strong>Whitelist Permissions:</strong>
        <div className="mt-2">
          {userRoles.canMint && <Badge bg="success" className="me-2">Can Mint</Badge>}
          {userRoles.canBurn && <Badge bg="danger" className="me-2">Can Burn</Badge>}
        </div>
      </Alert>

      {/* Pending Mints */}
      {userRoles.canMint && (
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">🪙 Pending Mints</h5>
                <Badge bg="primary" pill>
                  {pendingPayments.length} pending
                </Badge>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : pendingPayments.length === 0 ? (
                  <Alert variant="success">No pending mints</Alert>
                ) : (
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Amount</th>
                          <th>Payment ID</th>
                          <th>Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingPayments.map(payment => (
                          <tr key={payment._id}>
                            <td>
                              <code>{formatAddress(payment.userAddress)}</code>
                            </td>
                            <td className="fw-bold">₹{payment.amountINR}</td>
                            <td>
                              <code className="small">
                                {payment.razorpayPaymentId?.substring(0, 12)}...
                              </code>
                            </td>
                            <td>
                              {payment.createdAt && new Date(payment.createdAt).toLocaleDateString()}
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

      {/* Burn Tokens */}
      {userRoles.canBurn && (
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm">
              <Card.Header>
                <h5 className="mb-0">🔥 Burn Tokens</h5>
              </Card.Header>
              <Card.Body>
                <Alert variant="warning" className="small">
                  <strong>Warning:</strong> You can burn tokens from any address
                </Alert>
                
                <Form>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>From Address</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="0x..."
                          value={burnData.address}
                          onChange={(e) => setBurnData({...burnData, address: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Amount (INRT)</Form.Label>
                        <div className="input-group">
                          <Form.Control
                            type="number"
                            placeholder="Amount"
                            value={burnData.amount}
                            onChange={(e) => setBurnData({...burnData, amount: e.target.value})}
                            min="0.01"
                            step="0.01"
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

      {/* Debug Logs */}
      <Card className="shadow-sm">
        <Card.Header>
          <h5 className="mb-0">📝 Contract Interaction Logs</h5>
        </Card.Header>
        <Card.Body style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {logs.length === 0 ? (
            <p className="text-muted">No logs yet</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={`small mb-1 ${log.type === 'error' ? 'text-danger' : log.type === 'success' ? 'text-success' : ''}`}>
                [{log.timestamp}] {log.message}
              </div>
            ))
          )}
        </Card.Body>
        <Card.Footer className="text-end">
          <Button size="sm" variant="outline-secondary" onClick={() => setLogs([])}>
            Clear Logs
          </Button>
        </Card.Footer>
      </Card>

      {/* Mint Modal */}
      <Modal show={showMintModal} onHide={() => setShowMintModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Mint</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment && (
            <>
              <p><strong>To Address:</strong> {selectedPayment.userAddress}</p>
              <p><strong>Amount:</strong> {selectedPayment.amountINR} INRT</p>
              <p><strong>Payment ID:</strong> {selectedPayment.razorpayPaymentId}</p>
              <p><strong>Date:</strong> {selectedPayment.createdAt && new Date(selectedPayment.createdAt).toLocaleString()}</p>
              <Alert variant="info">
                This will mint {selectedPayment.amountINR} INRT tokens to the user's address.
                Requires blockchain transaction.
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMintModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleMintTokens} 
            disabled={minting}
          >
            {minting ? (
              <>
                <Spinner as="span" size="sm" className="me-2" />
                Minting...
              </>
            ) : (
              'Confirm Mint'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Burn Modal */}
      <Modal show={showBurnModal} onHide={() => setShowBurnModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Burn</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <strong>⚠️ Warning:</strong> This will permanently burn {burnData.amount} INRT tokens
            from address {formatAddress(burnData.address)}.
          </Alert>
          <p>Are you sure you want to proceed?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBurnModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleBurnTokens} 
            disabled={burning}
          >
            {burning ? (
              <>
                <Spinner as="span" size="sm" className="me-2" />
                Burning...
              </>
            ) : (
              'Confirm Burn'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WhitelistedDashboard;