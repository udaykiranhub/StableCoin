// import React, { useState, useEffect } from 'react';
// import { Row, Col, Card, Button, Form, Table, Alert, Badge, Spinner } from 'react-bootstrap';
// import { getContract, getTokenBalance ,getCurrentAccount ,getWeb3} from '../services/web3Service';
// import { getUserPayments } from '../services/apiService';
// import PaymentGateway from './PaymentGateway';

// const UserDashboard = ({ userAddress, onRefresh }) => {
//   const [loading, setLoading] = useState(true);
//   const [payments, setPayments] = useState([]);
//   const [balance, setBalance] = useState('0.00');
//   const [burnAmount, setBurnAmount] = useState('');
//   const [burning, setBurning] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   useEffect(() => {
//     if (userAddress) {
//       fetchUserData();
//     }
//   }, [userAddress]);

//   const fetchUserData = async () => {
//     setLoading(true);
//     try {
//       // Get payments from backend
//       const paymentData = await getUserPayments(userAddress);
//       setPayments(paymentData.payments || []);
      
//       // Get balance from contract
//       const balanceFormatted = await getTokenBalance(userAddress);
//       setBalance(balanceFormatted);
      
//       console.log('📊 User Data:', {
//         balance: balanceFormatted,
//         payments: paymentData.payments?.length || 0
//       });
//     } catch (error) {
//       console.error('❌ Error fetching user data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // In UserDashboard.jsx, update the handleBurnTokens function:

// const handleBurnTokens = async () => {
//   if (!burnAmount || isNaN(burnAmount) || burnAmount <= 0) {
//     setError('Please enter valid amount');
//     return;
//   }

//   if (parseFloat(burnAmount) > parseFloat(balance)) {
//     setError(`Insufficient balance. Available: ${balance} INRT`);
//     return;
//   }

//   setBurning(true);
//   setError('');
//   setSuccess('');

//   try {
//     const contract = getContract();
//     const web3 = getWeb3();
    
//     // Get account
//     let account;
//     if (window.ethereum) {
//       const accounts = await window.ethereum.request({ method: 'eth_accounts' });
//       account = accounts[0];
//     }
    
//     if (!account) {
//       throw new Error('Please connect your wallet first');
//     }
    
//     // Check ETH balance for gas fees
//     const ethBalance = await web3.eth.getBalance(account);
//     const minEthRequired = web3.utils.toWei('0.01', 'ether');
    
//     if (Number(ethBalance) < Number(minEthRequired)) {
//       throw new Error(`Insufficient ETH for gas fees. Please add at least 0.01 ETH to your wallet.`);
//     }
    
//     // Convert to token units
//     const decimals = await contract.methods.decimals().call();
//     const decimalsNum = parseInt(decimals.toString());
//     const amountNum = parseFloat(burnAmount);
//     const amountInUnits = Math.floor(amountNum * 10**decimalsNum).toString();
    
//     console.log('🔥 Burning tokens:', {
//       amount: burnAmount,
//       amountInUnits,
//       user: account,
//       decimals: decimalsNum
//     });
    
//     // Get current network gas fees
//     let gasParams = {};
    
//     // Check if network supports EIP-1559 (Polygon Mumbai does)
//     const chainId = await web3.eth.getChainId();
//     const supportsEIP1559 = [1, 5, 137, 80001, 31337, 1337].includes(Number(chainId));
    
//   if (supportsEIP1559) {
//   // Get current gas price and use it for both
//   const gasPrice = await web3.eth.getGasPrice();
//   const gasPriceNum = parseInt(gasPrice, 16);
  
//   // Add 20% for priority fee
//   const priorityFee = Math.floor(gasPriceNum * 1.2);
//   const maxFee = Math.floor(gasPriceNum * 1.5); // Max fee 50% higher
  
//   gasParams = {
//     maxPriorityFeePerGas: web3.utils.toHex(priorityFee),
//     maxFeePerGas: web3.utils.toHex(maxFee)
//   };
// } else {
//       // Use legacy gas price for non-EIP-1559 networks
//       const gasPrice = await web3.eth.getGasPrice();
//       const increasedGasPrice = Math.floor(Number(gasPrice) * 1.15).toString();
      
//       gasParams = {
//         gasPrice: increasedGasPrice
//       };
//     }
    
//     // Estimate gas
//     let gasLimit;
//     try {
//       const estimatedGas = await contract.methods.burnMyTokens(amountInUnits)
//         .estimateGas({ from: account });
//       gasLimit = Math.floor(Number(estimatedGas) * 1.3).toString();
//     } catch (estimationError) {
//       console.warn('Gas estimation failed, using default:', estimationError);
//       gasLimit = '200000';
//     }
    
//     console.log('⛽ Transaction settings:', {
//       ...gasParams,
//       gasLimit,
//       chainId: Number(chainId),
//       supportsEIP1559
//     });
    
//     // Send transaction with appropriate gas parameters
//     const tx = await contract.methods.burnMyTokens(amountInUnits)
//       .send({ 
//         from: account,
//         gas: gasLimit,
//         ...gasParams
//       });
    
//     setSuccess(`
//       ✅ Successfully burned ${burnAmount} INRT!
      
//       Transaction Details:
//       • Hash: ${tx.transactionHash}
//       • Block: ${tx.blockNumber}
//       • Gas Used: ${tx.gasUsed}
//       • Status: ${tx.status ? 'Success' : 'Failed'}
//     `);
    
//     setBurnAmount('');
    
//     // Refresh data after a short delay
//     setTimeout(() => {
//       fetchUserData();
//       if (onRefresh) onRefresh();
//     }, 2000);
    
//     console.log('✅ Burn successful:', {
//       transactionHash: tx.transactionHash,
//       blockNumber: tx.blockNumber,
//       gasUsed: tx.gasUsed
//     });
    
//   } catch (error) {
//     console.error('❌ Burn error details:', error);
    
//     // User-friendly error messages
//     let errorMessage = 'Failed to burn tokens';
    
//     if (error.code === 4001 || error.message?.includes('user rejected')) {
//       errorMessage = 'Transaction was cancelled by user';
//     } else if (error.message?.includes('insufficient funds')) {
//       errorMessage = 'Insufficient ETH for gas fees. Please add ETH to your wallet.';
//     } else if (error.message?.includes('gas required exceeds allowance')) {
//       errorMessage = 'Transaction requires more gas than allowed. Try increasing gas limit.';
//     } else if (error.message?.includes('execution reverted')) {
//       const revertMatch = error.message.match(/execution reverted: ([^"]+)/);
//       errorMessage = revertMatch ? `Transaction failed: ${revertMatch[1]}` : 'Transaction reverted';
//     } else if (error.message) {
//       errorMessage = error.message;
//     }
    
//     setError(errorMessage);
//   } finally {
//     setBurning(false);
//   }
// };


//   const getPaymentStatus = (payment) => {
//     if (payment.transactionHash) return 'Minted';
//     if (payment.status === 'completed') return 'Pending Mint';
//     if (payment.status === 'pending') return 'Pending Payment';
//     return payment.status || 'Unknown';
//   };

//   const viewTransaction = (hash) => {
//     window.open(`https://mumbai.polygonscan.com/tx/${hash}`, '_blank');
//   };

//   if (loading) {
//     return (
//       <div className="text-center py-5">
//         <Spinner animation="border" />
//         <p className="mt-3">Loading user dashboard...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="user-dashboard">
//       {/* Stats Cards */}
//       <Row className="mb-4">
//         <Col md={4}>
//           <Card className="text-center shadow-sm">
//             <Card.Body>
//               <Card.Title className="text-muted">Token Balance</Card.Title>
//               <h2 className={balance === '0.00' ? 'text-muted' : 'text-success'}>
//                 {balance} INRT
//               </h2>
//               <small className="text-muted">1 INRT = 1 INR</small>
//             </Card.Body>
//           </Card>
//         </Col>
        
//         <Col md={4}>
//           <Card className="text-center shadow-sm">
//             <Card.Body>
//               <Card.Title className="text-muted">Total Purchases</Card.Title>
//               <h2>
//                 ₹{payments.reduce((sum, p) => sum + (p.amountINR || 0), 0)}
//               </h2>
//               <small className="text-muted">{payments.length} payment(s)</small>
//             </Card.Body>
//           </Card>
//         </Col>
        
//         <Col md={4}>
//           <Card className="text-center shadow-sm">
//             <Card.Body>
//               <Card.Title className="text-muted">Successful Mints</Card.Title>
//               <h2 className="text-success">
//                 {payments.filter(p => p.transactionHash).length}
//               </h2>
//               <small className="text-muted">Tokens received</small>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Alerts */}
//       {error && <Alert variant="danger">{error}</Alert>}
//       {success && <Alert variant="success">{success}</Alert>}

//       {/* Purchase & Burn Section */}
//       <Row className="mb-4">
//         <Col lg={6} className="mb-4">
//           <PaymentGateway 
//             userAddress={userAddress}
//             onPaymentSuccess={fetchUserData}
//           />
//         </Col>
        
//         <Col lg={6}>
//           <Card className="h-100 shadow-sm">
//             <Card.Header>
//               <h5 className="mb-0">🔥 Burn My Tokens</h5>
//             </Card.Header>
//             <Card.Body>
//               <Alert variant="warning" className="small">
//                 Burning removes tokens permanently. Available: <strong>{balance} INRT</strong>
//               </Alert>
              
//               <Form.Group>
//                 <Form.Label>Amount to Burn</Form.Label>
//                 <div className="input-group">
//                   <Form.Control
//                     type="number"
//                     value={burnAmount}
//                     onChange={(e) => setBurnAmount(e.target.value)}
//                     placeholder="Enter amount"
//                     min="0.01"
//                     step="0.01"
//                     disabled={burning}
//                   />
//                   <span className="input-group-text">INRT</span>
//                 </div>
//               </Form.Group>
              
//               <Button
//                 variant="danger"
//                 onClick={handleBurnTokens}
//                 disabled={burning || !burnAmount}
//                 className="w-100 mt-3"
//               >
//                 {burning ? (
//                   <>
//                     <Spinner size="sm" className="me-2" />
//                     Burning...
//                   </>
//                 ) : (
//                   'Burn Tokens'
//                 )}
//               </Button>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Payment History */}
//       <Card className="shadow-sm">
//         <Card.Header>
//           <h5 className="mb-0">📋 Payment History</h5>
//         </Card.Header>
//         <Card.Body>
//           {payments.length === 0 ? (
//             <Alert variant="info" className="text-center">
//               No payments found
//             </Alert>
//           ) : (
//             <div className="table-responsive">
//               <Table hover>
//                 <thead>
//                   <tr>
//                     <th>Date</th>
//                     <th>Amount</th>
//                     <th>Status</th>
//                     <th>Payment ID</th>
//                     <th>Transaction</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {payments.map(payment => (
//                     <tr key={payment._id}>
//                       <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
//                       <td className="fw-bold">₹{payment.amountINR}</td>
//                       <td>
//                         <Badge bg={
//                           payment.transactionHash ? 'success' :
//                           payment.status === 'completed' ? 'warning' :
//                           payment.status === 'pending' ? 'secondary' : 'danger'
//                         }>
//                           {getPaymentStatus(payment)}
//                         </Badge>
//                       </td>
//                       <td>
//                         <code className="small">
//                           {payment.razorpayPaymentId?.substring(0, 10)}...
//                         </code>
//                       </td>
//                       <td>
//                         {payment.transactionHash ? (
//                           <Button
//                             variant="link"
//                             size="sm"
//                             onClick={() => viewTransaction(payment.transactionHash)}
//                           >
//                             View
//                           </Button>
//                         ) : (
//                           <span className="text-muted">-</span>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </Table>
//             </div>
//           )}
//         </Card.Body>
//       </Card>
//     </div>
//   );
// };

// export default UserDashboard;




import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Table, Alert, Badge, Spinner } from 'react-bootstrap';
import { getContract, getTokenBalance, getCurrentAccount, getWeb3 } from '../services/web3Service';
import { getUserPayments } from '../services/apiService';
import PaymentGateway from './PaymentGateway';

const UserDashboard = ({ userAddress, onRefresh }) => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [balance, setBalance] = useState('0.00');
  const [burnAmount, setBurnAmount] = useState('');
  const [burning, setBurning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (userAddress) {
      fetchUserData();
    }
  }, [userAddress]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const paymentData = await getUserPayments(userAddress);
      setPayments(paymentData.payments || []);
      
      const balanceFormatted = await getTokenBalance(userAddress);
      setBalance(balanceFormatted);
      
      console.log('📊 User Data:', {
        balance: balanceFormatted,
        payments: paymentData.payments?.length || 0
      });
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBurnTokens = async () => {
    if (!burnAmount || isNaN(burnAmount) || burnAmount <= 0) {
      setError('Please enter valid amount');
      return;
    }

    if (parseFloat(burnAmount) > parseFloat(balance)) {
      setError(`Insufficient balance. Available: ${balance} INRT`);
      return;
    }

    setBurning(true);
    setError('');
    setSuccess('');

    try {
      const contract = getContract();
      const web3 = getWeb3();
      
      let account;
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        account = accounts[0];
      }
      
      if (!account) {
        throw new Error('Please connect your wallet first');
      }
      
      const ethBalance = await web3.eth.getBalance(account);
      const minEthRequired = web3.utils.toWei('0.01', 'ether');
      
      if (Number(ethBalance) < Number(minEthRequired)) {
        throw new Error(`Insufficient ETH for gas fees. Please add at least 0.01 ETH to your wallet.`);
      }
      
      const decimals = await contract.methods.decimals().call();
      const decimalsNum = parseInt(decimals.toString());
      const amountNum = parseFloat(burnAmount);
      const amountInUnits = Math.floor(amountNum * 10**decimalsNum).toString();
      
      console.log('🔥 Burning tokens:', {
        amount: burnAmount,
        amountInUnits,
        user: account,
        decimals: decimalsNum
      });
      
      let gasParams = {};
      
      const chainId = await web3.eth.getChainId();
      const supportsEIP1559 = [1, 5, 137, 80001, 31337, 1337].includes(Number(chainId));
      
      if (supportsEIP1559) {
        const gasPrice = await web3.eth.getGasPrice();
        const gasPriceNum = parseInt(gasPrice, 16);
        
        const priorityFee = Math.floor(gasPriceNum * 1.2);
        const maxFee = Math.floor(gasPriceNum * 1.5);
        
        gasParams = {
          maxPriorityFeePerGas: web3.utils.toHex(priorityFee),
          maxFeePerGas: web3.utils.toHex(maxFee)
        };
      } else {
        const gasPrice = await web3.eth.getGasPrice();
        const increasedGasPrice = Math.floor(Number(gasPrice) * 1.15).toString();
        
        gasParams = {
          gasPrice: increasedGasPrice
        };
      }
      
      let gasLimit;
      try {
        const estimatedGas = await contract.methods.burnMyTokens(amountInUnits)
          .estimateGas({ from: account });
        gasLimit = Math.floor(Number(estimatedGas) * 1.3).toString();
      } catch (estimationError) {
        console.warn('Gas estimation failed, using default:', estimationError);
        gasLimit = '200000';
      }
      
      console.log('⛽ Transaction settings:', {
        ...gasParams,
        gasLimit,
        chainId: Number(chainId),
        supportsEIP1559
      });
      
      const tx = await contract.methods.burnMyTokens(amountInUnits)
        .send({ 
          from: account,
          gas: gasLimit,
          ...gasParams
        });
      
      setSuccess(`
        ✅ Successfully burned ${burnAmount} INRT!
        
        Transaction Details:
        • Hash: ${tx.transactionHash}
        • Block: ${tx.blockNumber}
        • Gas Used: ${tx.gasUsed}
        • Status: ${tx.status ? 'Success' : 'Failed'}
      `);
      
      setBurnAmount('');
      
      setTimeout(() => {
        fetchUserData();
        if (onRefresh) onRefresh();
      }, 2000);
      
      console.log('✅ Burn successful:', {
        transactionHash: tx.transactionHash,
        blockNumber: tx.blockNumber,
        gasUsed: tx.gasUsed
      });
      
    } catch (error) {
      console.error('❌ Burn error details:', error);
      
      let errorMessage = 'Failed to burn tokens';
      
      if (error.code === 4001 || error.message?.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled by user';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH for gas fees. Please add ETH to your wallet.';
      } else if (error.message?.includes('gas required exceeds allowance')) {
        errorMessage = 'Transaction requires more gas than allowed. Try increasing gas limit.';
      } else if (error.message?.includes('execution reverted')) {
        const revertMatch = error.message.match(/execution reverted: ([^"]+)/);
        errorMessage = revertMatch ? `Transaction failed: ${revertMatch[1]}` : 'Transaction reverted';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setBurning(false);
    }
  };

  const getPaymentStatus = (payment) => {
    if (payment.transactionHash) return 'Minted';
    if (payment.status === 'completed') return 'Pending Mint';
    if (payment.status === 'pending') return 'Pending Payment';
    return payment.status || 'Unknown';
  };

  const viewTransaction = (hash) => {
    window.open(`https://mumbai.polygonscan.com/tx/${hash}`, '_blank');
  };

  if (loading) {
    return (
      <div className="text-center py-5" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" style={{ 
          width: '50px', 
          height: '50px',
          borderWidth: '3px'
        }} />
        <p className="mt-3 text-muted">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      {/* Stats Cards with Neon Glow */}
      <Row className="mb-5">
        <Col md={4} className="mb-4">
          <Card className="text-center border-0 shadow-lg" style={{
            borderRadius: '20px',
            background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
            borderTop: '4px solid #0d6efd',
            animation: 'cardGlow 3s infinite alternate'
          }}>
            <Card.Body className="p-4">
              <div className="mb-3">
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: 'rgba(13, 110, 253, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  border: '2px solid rgba(13, 110, 253, 0.3)'
                }}>
                  <span style={{ 
                    fontSize: '2rem', 
                    color: '#0d6efd',
                    fontWeight: 'bold'
                  }}>💰</span>
                </div>
              </div>
              <Card.Title className="text-muted mb-2" style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>
                TOKEN BALANCE
              </Card.Title>
              <h2 className={balance === '0.00' ? 'text-muted' : 'text-success'} style={{ 
                fontWeight: '800',
                fontSize: '2.5rem',
                textShadow: balance === '0.00' ? 'none' : '0 0 10px rgba(40, 167, 69, 0.3)'
              }}>
                {balance} <span style={{ fontSize: '1.5rem', color: '#6c757d' }}>INRT</span>
              </h2>
              <div className="mt-3" style={{
                padding: '8px 15px',
                background: 'rgba(13, 110, 253, 0.05)',
                borderRadius: '20px',
                display: 'inline-block'
              }}>
                <small className="text-primary fw-bold">1 INRT = 1 INR</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="text-center border-0 shadow-lg" style={{
            borderRadius: '20px',
            background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
            borderTop: '4px solid #28a745'
          }}>
            <Card.Body className="p-4">
              <div className="mb-3">
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: 'rgba(40, 167, 69, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  border: '2px solid rgba(40, 167, 69, 0.3)'
                }}>
                  <span style={{ 
                    fontSize: '2rem', 
                    color: '#28a745',
                    fontWeight: 'bold'
                  }}>📈</span>
                </div>
              </div>
              <Card.Title className="text-muted mb-2" style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>
                TOTAL PURCHASES
              </Card.Title>
              <h2 style={{ 
                fontWeight: '800',
                fontSize: '2.5rem',
                textShadow: '0 0 5px rgba(0, 0, 0, 0.1)'
              }}>
                ₹{payments.reduce((sum, p) => sum + (p.amountINR || 0), 0)}
              </h2>
              <div className="mt-3">
                <Badge bg="success" className="px-3 py-2" style={{
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  borderRadius: '10px'
                }}>
                  {payments.length} payment{payments.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="text-center border-0 shadow-lg" style={{
            borderRadius: '20px',
            background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
            borderTop: '4px solid #17a2b8'
          }}>
            <Card.Body className="p-4">
              <div className="mb-3">
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: 'rgba(23, 162, 184, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  border: '2px solid rgba(23, 162, 184, 0.3)'
                }}>
                  <span style={{ 
                    fontSize: '2rem', 
                    color: '#17a2b8',
                    fontWeight: 'bold'
                  }}>✅</span>
                </div>
              </div>
              <Card.Title className="text-muted mb-2" style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>
                SUCCESSFUL MINTS
              </Card.Title>
              <h2 className="text-success" style={{ 
                fontWeight: '800',
                fontSize: '2.5rem',
                textShadow: '0 0 10px rgba(40, 167, 69, 0.3)'
              }}>
                {payments.filter(p => p.transactionHash).length}
              </h2>
              <div className="mt-3">
                <small className="text-muted">Tokens delivered to wallet</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Alerts */}
      {error && (
        <div className="mb-4" style={{
          animation: 'errorGlow 1s'
        }}>
          <Alert variant="danger" className="border-0 shadow" style={{
            borderRadius: '15px',
            background: 'linear-gradient(135deg, #dc3545, #c82333)',
            color: 'white',
            borderLeft: '5px solid #ff6b6b'
          }}>
            <div className="d-flex align-items-center">
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '15px'
              }}>
                <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              </div>
              <div className="flex-grow-1">
                <strong>Error:</strong> {error}
              </div>
            </div>
          </Alert>
        </div>
      )}
      
      {success && (
        <div className="mb-4" style={{
          animation: 'successGlow 1s'
        }}>
          <Alert variant="success" className="border-0 shadow" style={{
            borderRadius: '15px',
            background: 'linear-gradient(135deg, #28a745, #218838)',
            color: 'white',
            borderLeft: '5px solid #51cf66'
          }}>
            <div className="d-flex align-items-center">
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '15px'
              }}>
                <span style={{ fontSize: '1.2rem' }}>✅</span>
              </div>
              <div className="flex-grow-1" style={{ whiteSpace: 'pre-line' }}>
                {success}
              </div>
            </div>
          </Alert>
        </div>
      )}

      {/* Purchase & Burn Section */}
      <Row className="mb-5">
        <Col lg={6} className="mb-4">
          <PaymentGateway 
            userAddress={userAddress}
            onPaymentSuccess={fetchUserData}
          />
        </Col>
        
        <Col lg={6}>
          <Card className="h-100 border-0 shadow-lg" style={{
            borderRadius: '20px',
            background: 'linear-gradient(145deg, #ffffff, #f0f0f0)'
          }}>
            <Card.Header className="bg-white border-0 pt-4" style={{ borderRadius: '20px 20px 0 0' }}>
              <h5 className="mb-0 fw-bold d-flex align-items-center">
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #dc3545, #c82333)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '10px',
                  boxShadow: '0 0 15px rgba(220, 53, 69, 0.3)'
                }}>
                  <span style={{ color: 'white', fontSize: '1.2rem' }}>🔥</span>
                </div>
                Burn My Tokens
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="mb-4" style={{
                padding: '15px',
                background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 193, 7, 0.05))',
                borderRadius: '15px',
                border: '1px solid rgba(255, 193, 7, 0.2)'
              }}>
                <div className="d-flex align-items-center">
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'rgba(255, 193, 7, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '10px'
                  }}>
                    <span style={{ fontSize: '0.9rem' }}>⚠️</span>
                  </div>
                  <div>
                    <strong className="text-warning">Warning:</strong> Burning removes tokens permanently.<br/>
                    <span className="text-muted">Available balance: </span>
                    <strong className="text-danger" style={{ textShadow: '0 0 5px rgba(220, 53, 69, 0.3)' }}>
                      {balance} INRT
                    </strong>
                  </div>
                </div>
              </div>
              
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold mb-3 d-flex align-items-center">
                  <span style={{ marginRight: '8px' }}>💸</span>
                  Amount to Burn
                </Form.Label>
                <div className="input-group" style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)'
                }}>
                  <span className="input-group-text bg-white border-0" style={{ 
                    padding: '15px',
                    fontWeight: 'bold',
                    color: '#dc3545'
                  }}>
                    INRT
                  </span>
                  <Form.Control
                    type="number"
                    value={burnAmount}
                    onChange={(e) => setBurnAmount(e.target.value)}
                    placeholder="Enter amount to burn"
                    min="0.01"
                    step="0.01"
                    disabled={burning}
                    className="border-0"
                    style={{
                      padding: '15px',
                      fontSize: '1.1rem'
                    }}
                  />
                </div>
                <Form.Text className="text-muted mt-2 d-flex align-items-center">
                  <span style={{ marginRight: '5px' }}>📝</span>
                  Minimum burn: 0.01 INRT (₹0.01)
                </Form.Text>
              </Form.Group>
              
              <Button
                variant="danger"
                onClick={handleBurnTokens}
                disabled={burning || !burnAmount}
                className="w-100 py-3 fw-bold border-0"
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #dc3545, #c82333)',
                  boxShadow: burning ? '0 4px 15px rgba(220, 53, 69, 0.2)' : '0 4px 20px rgba(220, 53, 69, 0.4)',
                  animation: burning ? 'none' : 'buttonPulse 2s infinite',
                  fontSize: '1.1rem',
                  letterSpacing: '0.5px'
                }}
              >
                {burning ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Burning Tokens...
                  </>
                ) : (
                  <>
                    <span style={{ marginRight: '8px' }}>🔥</span>
                    BURN TOKENS
                  </>
                )}
              </Button>
              
              {burnAmount && (
                <div className="mt-3 text-center">
                  <div style={{
                    display: 'inline-block',
                    padding: '8px 20px',
                    background: 'rgba(220, 53, 69, 0.1)',
                    borderRadius: '20px',
                    border: '1px solid rgba(220, 53, 69, 0.2)'
                  }}>
                    <small className="text-danger fw-semibold">
                      You will burn <span style={{ fontSize: '1.1em' }}>{burnAmount} INRT</span> (₹{burnAmount})
                    </small>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Payment History */}
      <Card className="border-0 shadow-lg" style={{
        borderRadius: '20px',
        background: 'linear-gradient(145deg, #ffffff, #f0f0f0)'
      }}>
        <Card.Header className="bg-white border-0 pt-4" style={{ borderRadius: '20px 20px 0 0' }}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1 fw-bold d-flex align-items-center">
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0d6efd, #0a58ca)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '10px',
                  boxShadow: '0 0 15px rgba(13, 110, 253, 0.3)'
                }}>
                  <span style={{ color: 'white', fontSize: '1.2rem' }}>📋</span>
                </div>
                Payment History
              </h5>
              <small className="text-muted">All your INRT token purchases and transactions</small>
            </div>
            <Badge bg="primary" className="px-3 py-2" style={{
              fontSize: '0.9rem',
              fontWeight: '500',
              borderRadius: '10px',
              boxShadow: '0 0 10px rgba(13, 110, 253, 0.3)'
            }}>
              {payments.length} Total
            </Badge>
          </div>
        </Card.Header>
        <Card.Body className="p-4">
          {payments.length === 0 ? (
            <div className="text-center py-5">
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(13, 110, 253, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                border: '2px dashed rgba(13, 110, 253, 0.3)'
              }}>
                <span style={{ fontSize: '2.5rem', opacity: 0.5 }}>📄</span>
              </div>
              <h5 className="text-muted">No Payment History</h5>
              <p className="text-muted">Make your first INRT purchase to see it here</p>
            </div>
          ) : (
            <div className="table-responsive" style={{
              borderRadius: '15px',
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
            }}>
              <Table hover className="mb-0">
                <thead style={{ 
                  background: 'linear-gradient(135deg, #0d6efd, #0a58ca)',
                  color: 'white'
                }}>
                  <tr>
                    <th className="py-3" style={{ paddingLeft: '25px', fontWeight: '600' }}>Date & Time</th>
                    <th className="py-3" style={{ fontWeight: '600' }}>Amount</th>
                    <th className="py-3" style={{ fontWeight: '600' }}>Status</th>
                    <th className="py-3" style={{ fontWeight: '600' }}>Payment ID</th>
                    <th className="py-3" style={{ paddingRight: '25px', fontWeight: '600' }}>Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => (
                    <tr key={payment._id} style={{ 
                      borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(13, 110, 253, 0.03)';
                      e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                      <td className="py-3" style={{ paddingLeft: '25px' }}>
                        <div className="fw-semibold">{new Date(payment.createdAt).toLocaleDateString()}</div>
                        <small className="text-muted">{new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                      </td>
                      <td className="py-3">
                        <div className="fw-bold" style={{ fontSize: '1.2rem', color: '#0d6efd' }}>
                          ₹{payment.amountINR}
                        </div>
                        <small className="text-muted">{payment.amountINR} INRT</small>
                      </td>
                      <td className="py-3">
                        <Badge className="px-3 py-2 rounded-pill" bg={
                          payment.transactionHash ? 'success' :
                          payment.status === 'completed' ? 'warning' :
                          payment.status === 'pending' ? 'secondary' : 'danger'
                        } style={{
                          fontWeight: '600',
                          fontSize: '0.85rem',
                          boxShadow: payment.transactionHash ? '0 0 10px rgba(40, 167, 69, 0.4)' : 
                                     payment.status === 'completed' ? '0 0 10px rgba(255, 193, 7, 0.4)' : 'none',
                          animation: payment.transactionHash ? 'badgeGlow 2s infinite alternate' : 'none'
                        }}>
                          {getPaymentStatus(payment)}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <code className="bg-light p-2 rounded" style={{ 
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                          color: '#495057',
                          border: '1px solid #dee2e6'
                        }}>
                          {payment.razorpayPaymentId?.substring(0, 12)}...
                        </code>
                      </td>
                      <td className="py-3" style={{ paddingRight: '25px' }}>
                        {payment.transactionHash ? (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => viewTransaction(payment.transactionHash)}
                            className="px-3 py-2 rounded-pill"
                            style={{
                              fontWeight: '500',
                              borderWidth: '2px',
                              boxShadow: '0 2px 8px rgba(13, 110, 253, 0.2)'
                            }}
                          >
                            <span style={{ marginRight: '5px' }}>🔗</span>
                            View Tx
                          </Button>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <style>{`
        @keyframes cardGlow {
          0% { box-shadow: 0 8px 25px rgba(13, 110, 253, 0.1); }
          100% { box-shadow: 0 8px 25px rgba(13, 110, 253, 0.2); }
        }
        
        @keyframes buttonPulse {
          0% { box-shadow: 0 4px 20px rgba(220, 53, 69, 0.4); }
          50% { box-shadow: 0 4px 25px rgba(220, 53, 69, 0.6); }
          100% { box-shadow: 0 4px 20px rgba(220, 53, 69, 0.4); }
        }
        
        @keyframes errorGlow {
          0% { box-shadow: 0 0 10px rgba(220, 53, 69, 0.2); }
          50% { box-shadow: 0 0 20px rgba(220, 53, 69, 0.4); }
          100% { box-shadow: 0 0 10px rgba(220, 53, 69, 0.2); }
        }
        
        @keyframes successGlow {
          0% { box-shadow: 0 0 10px rgba(40, 167, 69, 0.2); }
          50% { box-shadow: 0 0 20px rgba(40, 167, 69, 0.4); }
          100% { box-shadow: 0 0 10px rgba(40, 167, 69, 0.2); }
        }
        
        @keyframes badgeGlow {
          0% { box-shadow: 0 0 5px rgba(40, 167, 69, 0.4); }
          100% { box-shadow: 0 0 15px rgba(40, 167, 69, 0.6); }
        }
        
        .user-dashboard {
          background: transparent;
        }
        
        .card {
          transition: transform 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-5px);
        }
        
        @media (max-width: 768px) {
          .display-5 {
            font-size: 2.5rem;
          }
          
          .card {
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;