import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Alert, Badge, Modal, Spinner } from 'react-bootstrap';
import { getContract, getCurrentAccount } from '../services/web3Service';
import { getAllPayments } from '../services/apiService';

const AdminDashboard = ({ userAddress }) => {
  const [contractData, setContractData] = useState(null);
  const [allPayments, setAllPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [whitelistAddress, setWhitelistAddress] = useState('');
  const [whitelistData, setWhitelistData] = useState({ canMint: true, canBurn: false });
  const [adminAddress, setAdminAddress] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(true);
  const [taxConfig, setTaxConfig] = useState({
    rate: '',
    wallet: '',
    enabled: true,
    threshold: ''
  });
  const [transferLimits, setTransferLimits] = useState({ min: '', max: '' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, [userAddress]);

  // Update fetchAdminData function for proper number conversion:
const fetchAdminData = async () => {
  setLoading(true);
  try {
    const contract = getContract();
    const web3 = getWeb3();
    
    // Fetch contract data
    const [
      totalSupply,
      totalReserve,
      taxConfigData,
      maxTransfer,
      minTransfer,
      decimals
    ] = await Promise.all([
      contract.methods.totalSupply().call(),
      contract.methods.totalReserve().call(),
      contract.methods.taxConfig().call(),
      contract.methods.maxTransferAmount().call(),
      contract.methods.minTransferAmount().call(),
      contract.methods.decimals().call()
    ]);
    
    // Fetch all payments
    const paymentsData = await getAllPayments();
    
    // Convert from base units to token units
    const divisor = Math.pow(10, decimals);
    const supplyInTokens = Number(totalSupply) / divisor;
    const reserveInTokens = Number(totalReserve) / divisor;
    
    setContractData({
      totalSupply: supplyInTokens.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
      totalReserve: reserveInTokens.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
      pegStatus: Math.abs(supplyInTokens - reserveInTokens) < 0.01 // Check if approximately equal
    });
    
    // Tax config is already in correct units (basis points for rate, tokens for threshold)
    setTaxConfig({
      rate: taxConfigData.taxRate.toString(),
      wallet: taxConfigData.taxWallet,
      enabled: taxConfigData.taxEnabled,
      threshold: (Number(taxConfigData.taxThreshold) / divisor).toString()
    });
    
    // Transfer limits are in token units
    setTransferLimits({
      min: (Number(minTransfer) / divisor).toString(),
      max: (Number(maxTransfer) / divisor).toString()
    });
    
    setAllPayments(paymentsData.payments || []);
    
  } catch (error) {
    console.error('Error fetching admin data:', error);
  } finally {
    setLoading(false);
  }
};
  const handleUpdateWhitelist = async () => {
    if (!whitelistAddress || !/^0x[a-fA-F0-9]{40}$/.test(whitelistAddress)) {
      alert('Please enter a valid Ethereum address');
      return;
    }
    
    setActionLoading(true);
    try {
      const contract = getContract();
      const account = await getCurrentAccount();
      
      const tx = await contract.methods.updateWhitelist(
        whitelistAddress,
        whitelistData.canMint,
        whitelistData.canBurn
      ).send({ from: account });
      
      alert(`✅ Whitelist updated!\nTransaction: ${tx.transactionHash.substring(0, 20)}...`);
      setWhitelistAddress('');
      fetchAdminData();
      
    } catch (error) {
      alert(`❌ Failed to update whitelist: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateAdmin = async () => {
    if (!adminAddress || !/^0x[a-fA-F0-9]{40}$/.test(adminAddress)) {
      alert('Please enter a valid Ethereum address');
      return;
    }
    
    setActionLoading(true);
    try {
      const contract = getContract();
      const account = await getCurrentAccount();
      
      const tx = await contract.methods.updateAdmin(
        adminAddress,
        isAddingAdmin
      ).send({ from: account });
      
      alert(`✅ Admin ${isAddingAdmin ? 'added' : 'removed'}!\nTransaction: ${tx.transactionHash.substring(0, 20)}...`);
      setAdminAddress('');
      
    } catch (error) {
      alert(`❌ Failed to update admin: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

 // Update handleUpdateTaxConfig function:
const handleUpdateTaxConfig = async () => {
  if (!taxConfig.rate || !taxConfig.wallet || !taxConfig.threshold) {
    alert('Please fill all tax configuration fields');
    return;
  }
  
  setActionLoading(true);
  try {
    const contract = getContract();
    const account = await getCurrentAccount();
    const web3 = getWeb3();
    
    // Convert to proper types
    const rate = parseInt(taxConfig.rate);
    const threshold = parseInt(taxConfig.threshold);
    
    const tx = await contract.methods.updateTaxConfig(
      rate.toString(), // Convert to string
      taxConfig.wallet,
      taxConfig.enabled,
      threshold.toString() // Convert to string
    ).send({ from: account });
    
    alert(`✅ Tax config updated!\nTransaction: ${tx.transactionHash.substring(0, 20)}...`);
    fetchAdminData();
    
  } catch (error) {
    alert(`❌ Failed to update tax config: ${error.message}`);
  } finally {
    setActionLoading(false);
  }
};

// Update handleUpdateTransferLimits function:
const handleUpdateTransferLimits = async () => {
  if (!transferLimits.min || !transferLimits.max) {
    alert('Please enter both limits');
    return;
  }
  
  if (parseInt(transferLimits.min) >= parseInt(transferLimits.max)) {
    alert('Minimum must be less than maximum');
    return;
  }
  
  setActionLoading(true);
  try {
    const contract = getContract();
    const account = await getCurrentAccount();
    const web3 = getWeb3();
    
    const tx = await contract.methods.updateTransferLimits(
      transferLimits.min.toString(), // Convert to string
      transferLimits.max.toString()  // Convert to string
    ).send({ from: account });
    
    alert(`✅ Transfer limits updated!\nTransaction: ${tx.transactionHash.substring(0, 20)}...`);
    fetchAdminData();
    
  } catch (error) {
    alert(`❌ Failed to update transfer limits: ${error.message}`);
  } finally {
    setActionLoading(false);
  }
};


  const handlePauseContract = async (pause) => {
    setActionLoading(true);
    try {
      const contract = getContract();
      const account = await getCurrentAccount();
      
      const tx = pause 
        ? await contract.methods.emergencyPause().send({ from: account })
        : await contract.methods.emergencyUnpause().send({ from: account });
      
      alert(`✅ Contract ${pause ? 'paused' : 'unpaused'}!\nTransaction: ${tx.transactionHash.substring(0, 20)}...`);
      fetchAdminData();
      
    } catch (error) {
      alert(`❌ Failed to ${pause ? 'pause' : 'unpause'}: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading admin dashboard...</p>
      </Container>
    );
  }

  return (
    <Container fluid>
      <h2 className="mb-4">🔐 Admin Dashboard</h2>
      
      {/* Contract Overview */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
            <Card.Body className="text-center">
              <Card.Title className="text-muted">Total Supply</Card.Title>
              <Card.Text className="display-6 fw-bold text-primary">
                ₹{contractData?.totalSupply}
              </Card.Text>
              <small className="text-muted">INRT Tokens in Circulation</small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
            <Card.Body className="text-center">
              <Card.Title className="text-muted">Total Reserve</Card.Title>
              <Card.Text className="display-6 fw-bold text-success">
                ₹{contractData?.totalReserve}
              </Card.Text>
              <small className="text-muted">INR in Reserve</small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className={`shadow-sm border-0 ${contractData?.pegStatus ? 'border-success' : 'border-danger'}`} 
                style={{ borderRadius: '15px' }}>
            <Card.Body className="text-center">
              <Card.Title className="text-muted">Peg Status</Card.Title>
              <Card.Text className="display-6 fw-bold">
                {contractData?.pegStatus ? (
                  <span className="text-success">1:1 ✓</span>
                ) : (
                  <span className="text-danger">⚠️</span>
                )}
              </Card.Text>
              <small className="text-muted">
                {contractData?.pegStatus ? 'Peg Maintained' : 'Peg Broken'}
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Admin Actions */}
      <Row className="mb-4">
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">👥 Manage Whitelist</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="0x..."
                  value={whitelistAddress}
                  onChange={(e) => setWhitelistAddress(e.target.value)}
                  style={{ fontFamily: 'monospace' }}
                />
              </Form.Group>
              
              <Row className="mb-3">
                <Col>
                  <Form.Check
                    type="checkbox"
                    label="Can Mint"
                    checked={whitelistData.canMint}
                    onChange={(e) => setWhitelistData({...whitelistData, canMint: e.target.checked})}
                  />
                </Col>
                <Col>
                  <Form.Check
                    type="checkbox"
                    label="Can Burn"
                    checked={whitelistData.canBurn}
                    onChange={(e) => setWhitelistData({...whitelistData, canBurn: e.target.checked})}
                  />
                </Col>
              </Row>
              
              <Button
                variant="primary"
                onClick={handleUpdateWhitelist}
                className="w-100"
                disabled={actionLoading || !whitelistAddress}
              >
                {actionLoading ? 'Updating...' : 'Update Whitelist'}
              </Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">🔧 Manage Admins</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="0x..."
                  value={adminAddress}
                  onChange={(e) => setAdminAddress(e.target.value)}
                  style={{ fontFamily: 'monospace' }}
                />
              </Form.Group>
              
              <div className="mb-3">
                <Form.Check
                  inline
                  type="radio"
                  label="Add Admin"
                  name="adminAction"
                  checked={isAddingAdmin}
                  onChange={() => setIsAddingAdmin(true)}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="Remove Admin"
                  name="adminAction"
                  checked={!isAddingAdmin}
                  onChange={() => setIsAddingAdmin(false)}
                />
              </div>
              
              <Button
                variant={isAddingAdmin ? "success" : "danger"}
                onClick={handleUpdateAdmin}
                className="w-100"
                disabled={actionLoading || !adminAddress}
              >
                {actionLoading ? 'Processing...' : (isAddingAdmin ? 'Add Admin' : 'Remove Admin')}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">⚙️ Tax Configuration</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Tax Rate (basis points, 100 = 1%)</Form.Label>
                  <Form.Control
                    type="number"
                    value={taxConfig.rate}
                    onChange={(e) => setTaxConfig({...taxConfig, rate: e.target.value})}
                    min="0"
                    max="500"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Tax Wallet Address</Form.Label>
                  <Form.Control
                    type="text"
                    value={taxConfig.wallet}
                    onChange={(e) => setTaxConfig({...taxConfig, wallet: e.target.value})}
                    style={{ fontFamily: 'monospace' }}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Tax Threshold (INRT)</Form.Label>
                  <Form.Control
                    type="number"
                    value={taxConfig.threshold}
                    onChange={(e) => setTaxConfig({...taxConfig, threshold: e.target.value})}
                    min="0"
                  />
                </Form.Group>
                
                <Form.Check
                  type="switch"
                  label="Tax Enabled"
                  checked={taxConfig.enabled}
                  onChange={(e) => setTaxConfig({...taxConfig, enabled: e.target.checked})}
                  className="mb-3"
                />
                
                <Button
                  variant="primary"
                  onClick={handleUpdateTaxConfig}
                  className="w-100"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Updating...' : 'Update Tax Config'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6}>
          <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">📊 Transfer Limits</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Minimum (INRT)</Form.Label>
                      <Form.Control
                        type="number"
                        value={transferLimits.min}
                        onChange={(e) => setTransferLimits({...transferLimits, min: e.target.value})}
                        min="1"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Maximum (INRT)</Form.Label>
                      <Form.Control
                        type="number"
                        value={transferLimits.max}
                        onChange={(e) => setTransferLimits({...transferLimits, max: e.target.value})}
                        min="100"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Button
                  variant="primary"
                  onClick={handleUpdateTransferLimits}
                  className="w-100 mb-3"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Updating...' : 'Update Transfer Limits'}
                </Button>
              </Form>
              
              <hr />
              
              <h6 className="mb-3">⚠️ Emergency Controls</h6>
              <Row>
                <Col>
                  <Button
                    variant="danger"
                    className="w-100 mb-2"
                    onClick={() => handlePauseContract(true)}
                    disabled={actionLoading}
                  >
                    ⛔ Pause All Transfers
                  </Button>
                </Col>
                <Col>
                  <Button
                    variant="success"
                    className="w-100 mb-2"
                    onClick={() => handlePauseContract(false)}
                    disabled={actionLoading}
                  >
                    ✅ Resume All Transfers
                  </Button>
                </Col>
              </Row>
              <small className="text-muted d-block mt-2">
                Use these only in emergency situations
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* All Payments */}
      <Row>
        <Col>
          <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
            <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📋 All Payments</h5>
              <Badge bg="light" text="dark">
                {allPayments.length} total
              </Badge>
            </Card.Header>
            <Card.Body>
              {allPayments.length === 0 ? (
                <Alert variant="info" className="text-center border-0">
                  No payments found
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>User</th>
                        <th>Amount (₹)</th>
                        <th>Tokens</th>
                        <th>Status</th>
                        <th>Transaction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allPayments.slice(0, 10).map((payment) => (
                        <tr key={payment._id}>
                          <td>
                            <small>{new Date(payment.createdAt).toLocaleDateString()}</small>
                          </td>
                          <td>
                            <code>{payment.userAddress?.substring(0, 10)}...</code>
                          </td>
                          <td className="fw-bold">₹{payment.amountINR}</td>
                          <td>{payment.tokensMinted || 0}</td>
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
                              {payment.transactionHash?.substring(0, 15) || 'Pending'}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
              <div className="text-center mt-3">
                <small className="text-muted">
                  Showing {Math.min(10, allPayments.length)} of {allPayments.length} payments
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;