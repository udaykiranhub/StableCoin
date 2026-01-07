// WalletConnect.jsx
import React, { useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { initWeb3, clearSavedConnection } from '../services/web3Service';

const WalletConnect = ({ onConnect, onDisconnect }) => {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const connection = await initWeb3();
      if (connection && connection.account) {
        onConnect(connection.account);
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert('Failed to connect wallet: ' + error.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    clearSavedConnection();
    onDisconnect();
  };

  return (
    <div>
      <Button 
        variant="primary" 
        onClick={handleConnect}
        disabled={connecting}
      >
        {connecting ? (
          <>
            <Spinner as="span" size="sm" className="me-2" />
            Connecting...
          </>
        ) : (
          'Connect Wallet'
        )}
      </Button>
    </div>
  );
};

export default WalletConnect;