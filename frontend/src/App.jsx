import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [account, setAccount] = useState(null);
  const [userRole, setUserRole] = useState({
    isAdmin: false,
    isWhitelisted: false,
    canMint: false,
    canBurn: false
  });

  const handleConnect = (address) => {
    setAccount(address);
  };

  const handleDisconnect = () => {
    setAccount(null);
    setUserRole({
      isAdmin: false,
      isWhitelisted: false,
      canMint: false,
      canBurn: false
    });
  };

  const handleRoleChange = (roles) => {
    setUserRole(roles);
  };

  return (
    <Router>
      <div className="App">
        <Navbar 
          account={account}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onRoleChange={handleRoleChange}
          userRole={userRole}
        />
        
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/dashboard" element={
              account ? (
                <Dashboard 
                  account={account} 
                  userRole={userRole}
                />
              ) : (
                <div className="access-restricted">
                  <div className="container text-center py-5">
                    <div className="restricted-icon">🔐</div>
                    <h2>Access Restricted</h2>
                    <p className="text-muted">
                      Please connect your wallet to access the dashboard
                    </p>
                  </div>
                </div>
              )
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="row">
        <div className="col-md-6">
          <h5>INRT Token System</h5>
          <p className="footer-text">
            A blockchain-based stable token pegged 1:1 with Indian Rupee
          </p>
        </div>
        <div className="col-md-6 text-md-end">
          <p className="footer-text">
            B.Tech Final Year Project | Blockchain Technology | {new Date().getFullYear()}
          </p>
          <p className="footer-note">
            Note: This is a demonstration project for educational purposes
          </p>
        </div>
      </div>
      <div className="footer-bottom text-center">
        <p>&copy; {new Date().getFullYear()} INRT Token System. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default App;