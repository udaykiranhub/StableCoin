import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Tab, Nav, Spinner, Alert, Button } from 'react-bootstrap';
import { getNetworkInfo, testContractConnection } from '../services/web3Service';
import UserDashboard from './UserDashboard';
import WhitelistedDashboard from './WhitelistedDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = ({ account, userRole, onRefresh }) => {
  const [loading, setLoading] = useState(true);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [contractConnected, setContractConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('user');
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (account) {
      fetchDashboardData();
    }
  }, [account]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Get network info
      const network = await getNetworkInfo();
      setNetworkInfo(network);
      
      // Test contract connection
      const result = await testContractConnection();
      setTestResult(result);
      setContractConnected(result.success);
      
      console.log('📊 Dashboard Data:', {
        account,
        network,
        contractConnected: result.success,
        userRole
      });
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestContract = async () => {
    const result = await testContractConnection();
    setTestResult(result);
    setContractConnected(result.success);
    
    if (result.success) {
      alert(`✅ Contract connection successful!\n\nContract: ${result.contract.name}\nNetwork: ${result.network?.name}\nYour Role: ${userRole.isAdmin ? 'Admin' : userRole.isWhitelisted ? 'Whitelisted' : 'User'}`);
    } else {
      alert(`❌ Contract connection failed:\n${result.error}`);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading dashboard...</p>
      </div>
    );
  }

  // Determine which dashboards to show
  const showWhitelistedDashboard = userRole.canMint || userRole.canBurn;
  const showAdminDashboard = userRole.isAdmin;

  return (
    <div className="dashboard">
      {/* Connection Status Card */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={8}>
              <h5>Wallet Connection Status</h5>
              <div className="mb-2">
                <strong>Connected Wallet:</strong> <code>{account}</code>
              </div>
              <div className="mb-2">
                <strong>Network:</strong> 
                {networkInfo ? (
                  <span className={`ms-2 badge ${networkInfo.isCorrectNetwork ? 'bg-success' : 'bg-warning'}`}>
                    {networkInfo.name} (Chain ID: {networkInfo.chainId})
                  </span>
                ) : (
                  <span className="ms-2 badge bg-secondary">Unknown</span>
                )}
              </div>
              <div className="mb-2">
                <strong>Contract:</strong> 
                {contractConnected ? (
                  <span className="ms-2 badge bg-success">Connected</span>
                ) : (
                  <span className="ms-2 badge bg-danger">Not Connected</span>
                )}
              </div>
              <div>
                <strong>User Type:</strong>
                <div className="mt-1">
                  {userRole.isAdmin && <span className="badge bg-danger me-2">Admin</span>}
                  {userRole.canMint && <span className="badge bg-success me-2">Minter</span>}
                  {userRole.canBurn && <span className="badge bg-warning me-2">Burner</span>}
                  {!userRole.isAdmin && !userRole.isWhitelisted && (
                    <span className="badge bg-secondary">Regular User</span>
                  )}
                </div>
              </div>
            </Col>
            <Col md={4} className="text-end">
              <div className="d-flex flex-column gap-2">
                <Button 
                  variant="outline-info" 
                  size="sm" 
                  onClick={handleTestContract}
                >
                  Test Contract Connection
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={fetchDashboardData}
                >
                  Refresh Dashboard
                </Button>
              </div>
            </Col>
          </Row>
          
          {/* Contract Test Results */}
          {testResult && (
            <div className="mt-3">
              {testResult.success ? (
                <Alert variant="success" className="p-2 mb-0 small">
                  <strong>✅ Contract Verified:</strong> {testResult.contract.name} ({testResult.contract.symbol}) - Total Supply: {testResult.contract.totalSupply} INRT
                </Alert>
              ) : (
                <Alert variant="danger" className="p-2 mb-0 small">
                  <strong>❌ Contract Error:</strong> {testResult.error}
                </Alert>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Show appropriate dashboard based on user role */}
      {contractConnected ? (
        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Card className="shadow-sm">
            <Card.Header>
              <Nav variant="tabs">
                <Nav.Item>
                  <Nav.Link eventKey="user">User Dashboard</Nav.Link>
                </Nav.Item>
                {showWhitelistedDashboard && (
                  <Nav.Item>
                    <Nav.Link eventKey="whitelisted">Whitelisted Actions</Nav.Link>
                  </Nav.Item>
                )}
                {showAdminDashboard && (
                  <Nav.Item>
                    <Nav.Link eventKey="admin">Admin Panel</Nav.Link>
                  </Nav.Item>
                )}
              </Nav>
            </Card.Header>
            <Card.Body>
              <Tab.Content>
                <Tab.Pane eventKey="user">
                  <UserDashboard 
                    userAddress={account}
                    userRole={userRole}
                    onRefresh={() => {
                      fetchDashboardData();
                      if (onRefresh) onRefresh();
                    }}
                  />
                </Tab.Pane>
                
                {showWhitelistedDashboard && (
                  <Tab.Pane eventKey="whitelisted">
                    <WhitelistedDashboard 
                      userAddress={account}
                      userRoles={userRole}
                      onRefresh={() => {
                        fetchDashboardData();
                        if (onRefresh) onRefresh();
                      }}
                    />
                  </Tab.Pane>
                )}
                
                {showAdminDashboard && (
                  <Tab.Pane eventKey="admin">
                    <AdminDashboard 
                      userAddress={account}
                      onRefresh={() => {
                        fetchDashboardData();
                        if (onRefresh) onRefresh();
                      }}
                    />
                  </Tab.Pane>
                )}
              </Tab.Content>
            </Card.Body>
          </Card>
        </Tab.Container>
      ) : (
        <Alert variant="warning" className="text-center">
          <h4>⚠️ Smart Contract Not Connected</h4>
          <p>Unable to connect to the INRT smart contract. Please ensure:</p>
          <ul className="text-start">
            <li>The contract is deployed at the correct address</li>
            <li>You're on the correct network (Hardhat Local or Polygon Mumbai)</li>
            <li>The contract ABI is properly configured</li>
          </ul>
          <Button variant="primary" onClick={handleTestContract}>
            Test Connection
          </Button>
        </Alert>
      )}

      {/* Dashboard Info */}
      <div className="text-center mt-4 small text-muted">
        <p>
          <strong>Current Network:</strong> {networkInfo?.name || 'Unknown'} | 
          <strong className="ms-3">Status:</strong> {contractConnected ? 'Connected' : 'Not Connected'}
        </p>
        <p className="mb-0">
          <small>
            Connected as: {account} | 
            Role: {userRole.isAdmin ? 'Admin' : userRole.isWhitelisted ? 'Whitelisted' : 'Regular User'}
          </small>
        </p>
      </div>
    </div>
  );
};

export default Dashboard;