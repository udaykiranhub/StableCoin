import React, { useState, useEffect } from 'react';
import { Button, Alert, Badge } from 'react-bootstrap';
import { initWeb3, getCurrentAccount, checkWhitelistStatus, checkAdminStatus } from '../services/web3Service';

const WalletConnect = ({ onConnect, onDisconnect, onRoleChange }) => {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [isWhitelisted, setIsWhitelisted] = useState({ canMint: false, canBurn: false });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkConnection();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      await connectWallet();
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError('');
    
    try {
      await initWeb3();
      const currentAccount = await getCurrentAccount();
      
      if (currentAccount) {
        setAccount(currentAccount);
        await checkRoles(currentAccount);
        
        if (onConnect) onConnect(currentAccount);
      }
    } catch (error) {
      setError(error.message || 'Failed to connect wallet');
      console.error('Connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsWhitelisted({ canMint: false, canBurn: false });
    setIsAdmin(false);
    
    if (onDisconnect) onDisconnect();
  };

  const checkRoles = async (address) => {
    try {
      const whitelistStatus = await checkWhitelistStatus(address);
      const adminStatus = await checkAdminStatus(address);
      
      setIsWhitelisted({
        canMint: whitelistStatus.canMint,
        canBurn: whitelistStatus.canBurn
      });
      setIsAdmin(adminStatus);
      
      if (onRoleChange) {
        onRoleChange({
          isAdmin: adminStatus,
          isWhitelisted: whitelistStatus.canMint || whitelistStatus.canBurn,
          canMint: whitelistStatus.canMint,
          canBurn: whitelistStatus.canBurn
        });
      }
    } catch (error) {
      console.error('Error checking roles:', error);
    }
  };

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
      checkRoles(accounts[0]);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const formatAddress = (addr) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="wallet-connect">
      {error && (
        <Alert variant="danger" className="wallet-error">
          <small>{error}</small>
        </Alert>
      )}
      
      {account ? (
        <div className="connected-wallet">
          <div className="wallet-info">
            <span className="wallet-status">Connected</span>
            <span className="wallet-address">{formatAddress(account)}</span>
          </div>
          <Button 
            variant="outline-light" 
            size="sm"
            onClick={disconnectWallet}
            className="disconnect-btn"
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <Button 
          variant="primary" 
          onClick={connectWallet}
          disabled={isConnecting}
          className="connect-btn"
        >
          {isConnecting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Connecting...
            </>
          ) : (
            <>
              <span className="wallet-icon">🦊</span>
              Connect Wallet
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default WalletConnect;