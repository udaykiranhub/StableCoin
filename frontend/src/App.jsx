import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Spinner, Alert } from 'react-bootstrap';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import Dashboard from './components/Dashboard';
import { 
  initWeb3, 
  initWeb3Silently, 
  getSavedConnection, 
  clearSavedConnection,
  getUserRoles 
} from './services/web3Service';
import './App.css';

function App() {
  const [account, setAccount] = useState(null);
  const [userRole, setUserRole] = useState({
    isAdmin: false,
    isWhitelisted: false,
    canMint: false,
    canBurn: false
  });
  const [loading, setLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(false);
  const [error, setError] = useState('');

  // Check for saved connection on mount
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        const savedAccount = getSavedConnection();
        
        if (savedAccount) {
          console.log('Found saved account:', savedAccount);
          // Try silent connection first
          const connection = await initWeb3Silently();
          
          if (connection && connection.account) {
            setAccount(connection.account);
            // Fetch user roles
            const roles = await getUserRoles(connection.account);
            setUserRole(roles);
            console.log('✅ Silent connection successful with roles:', roles);
          } else {
            // Just show saved account but don't set as connected
            console.log('Saved account found but cannot connect silently');
          }
        }
      } catch (error) {
        console.error('Initialization error:', error);
        setError('Failed to initialize wallet connection');
      } finally {
        setLoading(false);
      }
    };
    
    initialize();
  }, []);

  const handleConnectWallet = async () => {
    setWalletLoading(true);
    setError('');
    
    try {
      // Initialize Web3 with popup
      const connection = await initWeb3();
      
      if (connection && connection.account) {
        setAccount(connection.account);
        
        // Fetch user roles from smart contract
        const roles = await getUserRoles(connection.account);
        setUserRole(roles);
        
        console.log('✅ Wallet connected with roles:', roles);
        
        return { success: true, account: connection.account, roles };
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      setError(error.message || 'Failed to connect wallet');
      return { success: false, error: error.message };
    } finally {
      setWalletLoading(false);
    }
  };

  const handleDisconnect = () => {
    console.log('Wallet disconnected');
    setAccount(null);
    setUserRole({
      isAdmin: false,
      isWhitelisted: false,
      canMint: false,
      canBurn: false
    });
    clearSavedConnection();
    setError('');
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Initializing application...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navbar 
          account={account}
          userRole={userRole}
          onConnect={handleConnectWallet}
          onDisconnect={handleDisconnect}
          walletLoading={walletLoading}
        />
        
        <main>
          {error && (
            <Container className="mt-4">
              <Alert variant="danger" dismissible onClose={() => setError('')}>
                {error}
              </Alert>
            </Container>
          )}
          
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/dashboard" element={
              account ? (
                <Dashboard 
                  account={account} 
                  userRole={userRole}
                  onRefresh={async () => {
                    // Refresh roles
                    if (account) {
                      const roles = await getUserRoles(account);
                      setUserRole(roles);
                    }
                  }}
                />
              ) : (
                <Container className="text-center py-5">
                  <div className="display-1 mb-4">🔐</div>
                  <h2>Access Restricted</h2>
                  <p className="text-muted mb-4">
                    Please connect your wallet to access the dashboard
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={handleConnectWallet}
                    disabled={walletLoading}
                  >
                    {walletLoading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Connecting...
                      </>
                    ) : (
                      'Connect Wallet'
                    )}
                  </button>
                </Container>
              )
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        
        <footer className="text-center py-4 text-muted small border-top">
          <div className="container">
            <p>INRT Token System - B.Tech Final Year Project</p>
            <p>Test Network: Hardhat Local (31337) | 1 INRT = 1 INR</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;