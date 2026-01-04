import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Alert } from 'react-bootstrap';
import UserDashboard from './UserDashboard';
import WhitelistedDashboard from './WhitelistedDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = ({ account, userRole }) => {
  const [activeTab, setActiveTab] = useState('user');
  const [totalSupply, setTotalSupply] = useState('0');
  const [loading, setLoading] = useState(true);

  // Format address
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="dashboard">
      <Container>
        {/* Dashboard Header */}
        <div className="dashboard-header mb-4">
          <Row className="align-items-center">
            <Col md={8}>
              <h1 className="dashboard-title">Dashboard</h1>
              <p className="dashboard-subtitle">
                Manage your INRT tokens and access platform features
              </p>
            </Col>
            <Col md={4} className="text-md-end">
              <div className="wallet-info-card">
                <div className="wallet-address">
                  <span className="wallet-label">Wallet:</span>
                  <code className="wallet-code">{formatAddress(account)}</code>
                </div>
                <div className="role-tags">
                  {userRole.isAdmin && <span className="role-tag admin">Admin</span>}
                  {userRole.canMint && <span className="role-tag minter">Minter</span>}
                  {userRole.canBurn && <span className="role-tag burner">Burner</span>}
                  <span className="role-tag user">User</span>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Dashboard Tabs */}
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="dashboard-tabs mb-4"
        >
          <Tab eventKey="user" title={
            <div className="tab-title">
              <span className="tab-icon">👤</span>
              User Dashboard
            </div>
          }>
            <UserDashboard userAddress={account} />
          </Tab>
          
          {(userRole.canMint || userRole.canBurn) && (
            <Tab eventKey="whitelisted" title={
              <div className="tab-title">
                <span className="tab-icon">⚡</span>
                Whitelisted
              </div>
            }>
              <WhitelistedDashboard 
                userAddress={account} 
                whitelistStatus={userRole}
              />
            </Tab>
          )}
          
          {userRole.isAdmin && (
            <Tab eventKey="admin" title={
              <div className="tab-title">
                <span className="tab-icon">🔐</span>
                Admin Panel
              </div>
            }>
              <AdminDashboard userAddress={account} />
            </Tab>
          )}
        </Tabs>

        {/* Quick Stats */}
        <Row className="mb-4">
          <Col md={4}>
            <Card className="stat-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stat-icon me-3">
                    <span>💰</span>
                  </div>
                  <div>
                    <Card.Title className="stat-label">Total Supply</Card.Title>
                    <Card.Text className="stat-value">
                      {totalSupply} INRT
                    </Card.Text>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="stat-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stat-icon me-3">
                    <span>🔒</span>
                  </div>
                  <div>
                    <Card.Title className="stat-label">Reserve Ratio</Card.Title>
                    <Card.Text className="stat-value">
                      1:1 Pegged
                    </Card.Text>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="stat-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stat-icon me-3">
                    <span>⚡</span>
                  </div>
                  <div>
                    <Card.Title className="stat-label">Network</Card.Title>
                    <Card.Text className="stat-value">
                      Ethereum
                    </Card.Text>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;