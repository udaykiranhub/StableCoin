// import React, { useState, useEffect } from 'react';
// import { Row, Col, Card, Button, Form, Table, Alert, Badge, Spinner } from 'react-bootstrap';
// import { getContract, getCurrentAccount } from '../services/web3Service';
// import { getAllPayments } from '../services/apiService';

// const AdminDashboard = ({ userAddress, onRefresh }) => {
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [allPayments, setAllPayments] = useState([]);
//   const [contractData, setContractData] = useState(null);
//   const [whitelistForm, setWhitelistForm] = useState({ address: '', canMint: true, canBurn: false });
//   const [adminForm, setAdminForm] = useState({ address: '', isAdmin: true });
//   const [logs, setLogs] = useState([]);

//   useEffect(() => {
//     fetchAdminData();
//     fetchContractData();
//   }, []);

//   const addLog = (message, type = 'info') => {
//     const timestamp = new Date().toLocaleTimeString();
//     setLogs(prev => [...prev, { timestamp, message, type }]);
//     console.log(`[ADMIN] ${message}`);
//   };

//   const fetchAdminData = async () => {
//     try {
//       const paymentsData = await getAllPayments();
//       setAllPayments(paymentsData.payments || []);
//       addLog(`Loaded ${paymentsData.payments?.length || 0} payments`, 'info');
//     } catch (error) {
//       addLog(`Error loading payments: ${error.message}`, 'error');
//     }
//   };

//  // In AdminDashboard.jsx, update fetchContractData:
// const fetchContractData = async () => {
//   try {
//     const contract = getContract();
    
//     const [name, symbol, decimals, totalSupply, totalReserve] = await Promise.all([
//       contract.methods.name().call(),
//       contract.methods.symbol().call(),
//       contract.methods.decimals().call(),
//       contract.methods.totalSupply().call(),
//       contract.methods.totalReserve().call()
//     ]);
    
//     // Convert BigInt to numbers
//     const decimalsNum = parseInt(decimals.toString());
//     const supplyNum = parseInt(totalSupply.toString());
//     const reserveNum = parseInt(totalReserve.toString());
    
//     // Calculate with proper decimal places
//     const divisor = 10 ** decimalsNum;
//     const supplyFormatted = (supplyNum / divisor).toFixed(2);
//     const reserveFormatted = (reserveNum / divisor).toFixed(2);
    
//     setContractData({
//       name, 
//       symbol, 
//       decimals: decimalsNum,
//       totalSupply: supplyFormatted,
//       totalReserve: reserveFormatted,
//       isPegged: supplyNum === reserveNum
//     });
    
//     addLog(`Contract data loaded: ${supplyFormatted} INRT supply`, 'info');
    
//   } catch (error) {
//     console.error('Error loading contract data:', error);
//     addLog(`Error loading contract data: ${error.message}`, 'error');
//   }
// };

//   const handleUpdateWhitelist = async () => {
//     if (!whitelistForm.address) {
//       alert('Please enter address');
//       return;
//     }
    
//     setActionLoading(true);
//     addLog(`Updating whitelist for ${whitelistForm.address}...`, 'info');
    
//     try {
//       const contract = getContract();
//       const account = getCurrentAccount();
      
//       addLog(`Calling updateWhitelist(${whitelistForm.address}, ${whitelistForm.canMint}, ${whitelistForm.canBurn})`, 'info');
      
//       const tx = await contract.methods.updateWhitelist(
//         whitelistForm.address,
//         whitelistForm.canMint,
//         whitelistForm.canBurn
//       ).send({ from: account });
      
//       addLog(`✅ Whitelist updated! Tx: ${tx.transactionHash}`, 'success');
      
//       setWhitelistForm({ address: '', canMint: true, canBurn: false });
//       alert('Whitelist updated successfully!');
      
//       if (onRefresh) onRefresh();
      
//     } catch (error) {
//       addLog(`❌ Whitelist update failed: ${error.message}`, 'error');
//       alert(`Failed: ${error.message}`);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleUpdateAdmin = async () => {
//     if (!adminForm.address) {
//       alert('Please enter address');
//       return;
//     }
    
//     setActionLoading(true);
//     addLog(`${adminForm.isAdmin ? 'Adding' : 'Removing'} admin ${adminForm.address}...`, 'info');
    
//     try {
//       const contract = getContract();
//       const account = getCurrentAccount();
      
//       addLog(`Calling updateAdmin(${adminForm.address}, ${adminForm.isAdmin})`, 'info');
      
//       const tx = await contract.methods.updateAdmin(
//         adminForm.address,
//         adminForm.isAdmin
//       ).send({ from: account });
      
//       addLog(`✅ Admin ${adminForm.isAdmin ? 'added' : 'removed'}! Tx: ${tx.transactionHash}`, 'success');
      
//       setAdminForm({ address: '', isAdmin: true });
//       alert('Admin updated successfully!');
      
//     } catch (error) {
//       addLog(`❌ Admin update failed: ${error.message}`, 'error');
//       alert(`Failed: ${error.message}`);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const formatAddress = (addr) => {
//     return `${addr?.substring(0, 8)}...${addr?.substring(addr.length - 6)}`;
//   };

//   if (loading) {
//     return (
//       <div className="text-center py-5">
//         <Spinner animation="border" />
//         <p className="mt-3">Loading admin dashboard...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="admin-dashboard">
//       {/* Contract Stats */}
//       {contractData && (
//         <Row className="mb-4">
//           <Col md={3}>
//             <Card className="text-center shadow-sm">
//               <Card.Body>
//                 <Card.Title className="small text-muted">Total Supply</Card.Title>
//                 <h4>{contractData.totalSupply} INRT</h4>
//               </Card.Body>
//             </Card>
//           </Col>
//           <Col md={3}>
//             <Card className="text-center shadow-sm">
//               <Card.Body>
//                 <Card.Title className="small text-muted">Total Reserve</Card.Title>
//                 <h4>{contractData.totalReserve} INR</h4>
//                 <Badge bg={contractData.isPegged ? "success" : "danger"}>
//                   {contractData.isPegged ? "1:1 Pegged" : "Not Pegged"}
//                 </Badge>
//               </Card.Body>
//             </Card>
//           </Col>
//           <Col md={3}>
//             <Card className="text-center shadow-sm">
//               <Card.Body>
//                 <Card.Title className="small text-muted">Tax Threshold</Card.Title>
//                 <h4>{contractData.taxThreshold} INRT</h4>
//                 <div className="small">1% tax above this</div>
//               </Card.Body>
//             </Card>
//           </Col>
//           <Col md={3}>
//             <Card className="text-center shadow-sm">
//               <Card.Body>
//                 <Card.Title className="small text-muted">Payments</Card.Title>
//                 <h4>{allPayments.length}</h4>
//                 <div className="small">Total transactions</div>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>
//       )}

//       {/* Admin Actions */}
//       <Row className="mb-4">
//         <Col lg={6} className="mb-4">
//           <Card className="shadow-sm">
//             <Card.Header>
//               <h5 className="mb-0">👥 Manage Whitelist</h5>
//             </Card.Header>
//             <Card.Body>
//               <Form.Group className="mb-3">
//                 <Form.Label>Address</Form.Label>
//                 <Form.Control
//                   type="text"
//                   placeholder="0x..."
//                   value={whitelistForm.address}
//                   onChange={(e) => setWhitelistForm({...whitelistForm, address: e.target.value})}
//                 />
//               </Form.Group>
              
//               <Row className="mb-3">
//                 <Col>
//                   <Form.Check
//                     label="Can Mint"
//                     checked={whitelistForm.canMint}
//                     onChange={(e) => setWhitelistForm({...whitelistForm, canMint: e.target.checked})}
//                   />
//                 </Col>
//                 <Col>
//                   <Form.Check
//                     label="Can Burn"
//                     checked={whitelistForm.canBurn}
//                     onChange={(e) => setWhitelistForm({...whitelistForm, canBurn: e.target.checked})}
//                   />
//                 </Col>
//               </Row>
              
//               <Button
//                 variant="primary"
//                 onClick={handleUpdateWhitelist}
//                 disabled={actionLoading || !whitelistForm.address}
//                 className="w-100"
//               >
//                 {actionLoading ? 'Updating...' : 'Update Whitelist'}
//               </Button>
//             </Card.Body>
//           </Card>
//         </Col>
        
//         <Col lg={6}>
//           <Card className="shadow-sm">
//             <Card.Header>
//               <h5 className="mb-0">🔧 Manage Admins</h5>
//             </Card.Header>
//             <Card.Body>
//               <Form.Group className="mb-3">
//                 <Form.Label>Address</Form.Label>
//                 <Form.Control
//                   type="text"
//                   placeholder="0x..."
//                   value={adminForm.address}
//                   onChange={(e) => setAdminForm({...adminForm, address: e.target.value})}
//                 />
//               </Form.Group>
              
//               <div className="mb-3">
//                 <Form.Check
//                   inline
//                   type="radio"
//                   label="Add Admin"
//                   checked={adminForm.isAdmin}
//                   onChange={() => setAdminForm({...adminForm, isAdmin: true})}
//                 />
//                 <Form.Check
//                   inline
//                   type="radio"
//                   label="Remove Admin"
//                   checked={!adminForm.isAdmin}
//                   onChange={() => setAdminForm({...adminForm, isAdmin: false})}
//                 />
//               </div>
              
//               <Button
//                 variant={adminForm.isAdmin ? "success" : "danger"}
//                 onClick={handleUpdateAdmin}
//                 disabled={actionLoading || !adminForm.address}
//                 className="w-100"
//               >
//                 {actionLoading ? 'Processing...' : (adminForm.isAdmin ? 'Add Admin' : 'Remove Admin')}
//               </Button>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* All Payments */}
//       <Row className="mb-4">
//         <Col>
//           <Card className="shadow-sm">
//             <Card.Header>
//               <h5 className="mb-0">📊 All Payments</h5>
//             </Card.Header>
//             <Card.Body>
//               {allPayments.length === 0 ? (
//                 <Alert variant="info">No payments found</Alert>
//               ) : (
//                 <div className="table-responsive">
//                   <Table hover>
//                     <thead>
//                       <tr>
//                         <th>User</th>
//                         <th>Amount</th>
//                         <th>Status</th>
//                         <th>Payment ID</th>
//                         <th>Transaction</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {allPayments.slice(0, 10).map(payment => (
//                         <tr key={payment._id}>
//                           <td>
//                             <code>{formatAddress(payment.userAddress)}</code>
//                           </td>
//                           <td className="fw-bold">₹{payment.amountINR}</td>
//                           <td>
//                             <Badge bg={
//                               payment.transactionHash ? 'success' :
//                               payment.status === 'completed' ? 'warning' :
//                               payment.status === 'pending' ? 'secondary' : 'danger'
//                             }>
//                               {payment.transactionHash ? 'Minted' : payment.status}
//                             </Badge>
//                           </td>
//                           <td>
//                             <code className="small">
//                               {payment.razorpayPaymentId?.substring(0, 10)}...
//                             </code>
//                           </td>
//                           <td>
//                             {payment.transactionHash ? (
//                               <a
//                                 href={`https://mumbai.polygonscan.com/tx/${payment.transactionHash}`}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                               >
//                                 View
//                               </a>
//                             ) : (
//                               <span className="text-muted">-</span>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </Table>
//                 </div>
//               )}
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Admin Logs */}
//       <Card className="shadow-sm">
//         <Card.Header>
//           <h5 className="mb-0">📝 Admin Action Logs</h5>
//         </Card.Header>
//         <Card.Body style={{ maxHeight: '150px', overflowY: 'auto' }}>
//           {logs.length === 0 ? (
//             <p className="text-muted">No admin actions yet</p>
//           ) : (
//             logs.map((log, index) => (
//               <div key={index} className={`small mb-1 ${log.type === 'error' ? 'text-danger' : 'text-success'}`}>
//                 [{log.timestamp}] {log.message}
//               </div>
//             ))
//           )}
//         </Card.Body>
//       </Card>
//     </div>
//   );
// };

// export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Table, Alert, Badge, Spinner } from 'react-bootstrap';
import { getContract, getCurrentAccount } from '../services/web3Service';
import { getAllPayments } from '../services/apiService';

const AdminDashboard = ({ userAddress, onRefresh }) => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [allPayments, setAllPayments] = useState([]);
  const [contractData, setContractData] = useState(null);
  const [whitelistForm, setWhitelistForm] = useState({ address: '', canMint: true, canBurn: false });
  const [adminForm, setAdminForm] = useState({ address: '', isAdmin: true });
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[ADMIN] ${message}`);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch both data in parallel
      await Promise.all([fetchAdminData(), fetchContractData()]);
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const paymentsData = await getAllPayments();
      setAllPayments(paymentsData.payments || []);
      addLog(`Loaded ${paymentsData.payments?.length || 0} payments`, 'info');
    } catch (error) {
      addLog(`Error loading payments: ${error.message}`, 'error');
      throw error;
    }
  };

  const fetchContractData = async () => {
    try {
      const contract = getContract();
      
      // Try to get contract data - handle case where contract might not be initialized
      if (!contract) {
        addLog('Contract not initialized', 'error');
        return;
      }
      
      const [name, symbol, decimals, totalSupply, totalReserve] = await Promise.all([
        contract.methods.name().call(),
        contract.methods.symbol().call(),
        contract.methods.decimals().call(),
        contract.methods.totalSupply().call(),
        contract.methods.totalReserve().call()
      ]);
      
      // Convert BigInt to numbers
      const decimalsNum = parseInt(decimals.toString());
      const supplyNum = parseInt(totalSupply.toString());
      const reserveNum = parseInt(totalReserve.toString());
      
      // Calculate with proper decimal places
      const divisor = 10 ** decimalsNum;
      const supplyFormatted = (supplyNum / divisor).toFixed(2);
      const reserveFormatted = (reserveNum / divisor).toFixed(2);
      
      setContractData({
        name, 
        symbol, 
        decimals: decimalsNum,
        totalSupply: supplyFormatted,
        totalReserve: reserveFormatted,
        isPegged: supplyNum === reserveNum
      });
      
      addLog(`Contract data loaded: ${supplyFormatted} INRT supply`, 'info');
      
    } catch (error) {
      console.error('Error loading contract data:', error);
      addLog(`Error loading contract data: ${error.message}`, 'error');
      // Don't rethrow here, just set basic contract data
      setContractData({
        name: 'INRT Token',
        symbol: 'INRT',
        decimals: 2,
        totalSupply: '0.00',
        totalReserve: '0.00',
        isPegged: false
      });
    }
  };

  const handleUpdateWhitelist = async () => {
    if (!whitelistForm.address) {
      alert('Please enter address');
      return;
    }
    
    setActionLoading(true);
    addLog(`Updating whitelist for ${whitelistForm.address}...`, 'info');
    
    try {
      const contract = getContract();
      const account = getCurrentAccount();
      
      if (!contract || !account) {
        throw new Error('Contract or account not initialized');
      }
      
      addLog(`Calling updateWhitelist(${whitelistForm.address}, ${whitelistForm.canMint}, ${whitelistForm.canBurn})`, 'info');
      
      const tx = await contract.methods.updateWhitelist(
        whitelistForm.address,
        whitelistForm.canMint,
        whitelistForm.canBurn
      ).send({ from: account });
      
      addLog(`✅ Whitelist updated! Tx: ${tx.transactionHash}`, 'success');
      
      setWhitelistForm({ address: '', canMint: true, canBurn: false });
      alert('Whitelist updated successfully!');
      
      if (onRefresh) onRefresh();
      
    } catch (error) {
      addLog(`❌ Whitelist update failed: ${error.message}`, 'error');
      alert(`Failed: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateAdmin = async () => {
    if (!adminForm.address) {
      alert('Please enter address');
      return;
    }
    
    setActionLoading(true);
    addLog(`${adminForm.isAdmin ? 'Adding' : 'Removing'} admin ${adminForm.address}...`, 'info');
    
    try {
      const contract = getContract();
      const account = getCurrentAccount();
      
      if (!contract || !account) {
        throw new Error('Contract or account not initialized');
      }
      
      addLog(`Calling updateAdmin(${adminForm.address}, ${adminForm.isAdmin})`, 'info');
      
      const tx = await contract.methods.updateAdmin(
        adminForm.address,
        adminForm.isAdmin
      ).send({ from: account });
      
      addLog(`✅ Admin ${adminForm.isAdmin ? 'added' : 'removed'}! Tx: ${tx.transactionHash}`, 'success');
      
      setAdminForm({ address: '', isAdmin: true });
      alert('Admin updated successfully!');
      
    } catch (error) {
      addLog(`❌ Admin update failed: ${error.message}`, 'error');
      alert(`Failed: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return 'N/A';
    return `${addr.substring(0, 8)}...${addr.substring(addr.length - 6)}`;
  };

  if (loading) {
    return (
      <div className="text-center py-5" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" style={{ 
          width: '50px', 
          height: '50px',
          borderWidth: '3px'
        }} />
        <p className="mt-3 text-muted">Loading admin dashboard...</p>
        <small className="text-muted">Fetching contract data and payment history...</small>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Admin Header */}
      <div className="mb-4">
        <h1 className="fw-bold">Admin Dashboard</h1>
        <p className="text-muted">Manage whitelists, admins, and monitor all transactions</p>
      </div>

      {/* Contract Stats */}
      <Row className="mb-5">
        {contractData ? (
          <>
            <Col md={3} className="mb-4">
              <Card className="text-center border-0 shadow-lg" style={{
                borderRadius: '20px',
                background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                borderTop: '4px solid #0d6efd'
              }}>
                <Card.Body className="p-4">
                  <div className="mb-3">
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'rgba(13, 110, 253, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto'
                    }}>
                      <span style={{ fontSize: '1.8rem', color: '#0d6efd' }}>💰</span>
                    </div>
                  </div>
                  <Card.Title className="text-muted mb-2" style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>
                    TOTAL SUPPLY
                  </Card.Title>
                  <h2 style={{ 
                    fontWeight: '800',
                    fontSize: '2rem',
                    color: '#0d6efd'
                  }}>
                    {contractData.totalSupply} INRT
                  </h2>
                  <small className="text-muted">Circulating tokens</small>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3} className="mb-4">
              <Card className="text-center border-0 shadow-lg" style={{
                borderRadius: '20px',
                background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                borderTop: '4px solid #28a745'
              }}>
                <Card.Body className="p-4">
                  <div className="mb-3">
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'rgba(40, 167, 69, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto'
                    }}>
                      <span style={{ fontSize: '1.8rem', color: '#28a745' }}>🏦</span>
                    </div>
                  </div>
                  <Card.Title className="text-muted mb-2" style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>
                    TOTAL RESERVE
                  </Card.Title>
                  <h2 style={{ 
                    fontWeight: '800',
                    fontSize: '2rem',
                    color: '#28a745'
                  }}>
                    {contractData.totalReserve} INR
                  </h2>
                  <Badge bg={contractData.isPegged ? "success" : "danger"} className="mt-2 px-3 py-2" style={{
                    fontWeight: '600',
                    boxShadow: contractData.isPegged ? '0 0 10px rgba(40, 167, 69, 0.3)' : '0 0 10px rgba(220, 53, 69, 0.3)'
                  }}>
                    {contractData.isPegged ? "✅ 1:1 Pegged" : "⚠️ Not Pegged"}
                  </Badge>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3} className="mb-4">
              <Card className="text-center border-0 shadow-lg" style={{
                borderRadius: '20px',
                background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                borderTop: '4px solid #ffc107'
              }}>
                <Card.Body className="p-4">
                  <div className="mb-3">
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'rgba(255, 193, 7, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto'
                    }}>
                      <span style={{ fontSize: '1.8rem', color: '#ffc107' }}>📊</span>
                    </div>
                  </div>
                  <Card.Title className="text-muted mb-2" style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>
                    DECIMALS
                  </Card.Title>
                  <h2 style={{ 
                    fontWeight: '800',
                    fontSize: '2.5rem',
                    color: '#ffc107'
                  }}>
                    {contractData.decimals}
                  </h2>
                  <small className="text-muted">Token precision</small>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3} className="mb-4">
              <Card className="text-center border-0 shadow-lg" style={{
                borderRadius: '20px',
                background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                borderTop: '4px solid #6f42c1'
              }}>
                <Card.Body className="p-4">
                  <div className="mb-3">
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'rgba(111, 66, 193, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto'
                    }}>
                      <span style={{ fontSize: '1.8rem', color: '#6f42c1' }}>📈</span>
                    </div>
                  </div>
                  <Card.Title className="text-muted mb-2" style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>
                    TOTAL PAYMENTS
                  </Card.Title>
                  <h2 style={{ 
                    fontWeight: '800',
                    fontSize: '2.5rem',
                    color: '#6f42c1'
                  }}>
                    {allPayments.length}
                  </h2>
                  <small className="text-muted">All transactions</small>
                </Card.Body>
              </Card>
            </Col>
          </>
        ) : (
          <Col className="text-center py-5">
            <Alert variant="warning" className="border-0 shadow" style={{ borderRadius: '15px' }}>
              <h5>Contract Data Unavailable</h5>
              <p className="mb-0">Unable to fetch contract data. Please check your connection.</p>
            </Alert>
          </Col>
        )}
      </Row>

      {/* Admin Actions */}
      <Row className="mb-5">
        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-lg" style={{
            borderRadius: '20px',
            background: 'linear-gradient(145deg, #ffffff, #f0f0f0)'
          }}>
            <Card.Header className="bg-white border-0 pt-4" style={{ borderRadius: '20px 20px 0 0' }}>
              <h5 className="mb-0 fw-bold d-flex align-items-center">
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
                  <span style={{ color: 'white', fontSize: '1.2rem' }}>👥</span>
                </div>
                Manage Whitelist
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold mb-2 d-flex align-items-center">
                  <span style={{ marginRight: '8px' }}>👤</span>
                  Ethereum Address
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="0x..."
                  value={whitelistForm.address}
                  onChange={(e) => setWhitelistForm({...whitelistForm, address: e.target.value})}
                  style={{
                    borderRadius: '10px',
                    padding: '12px 15px',
                    border: '1px solid #dee2e6'
                  }}
                />
              </Form.Group>
              
              <Row className="mb-4">
                <Col>
                  <div className="d-flex align-items-center mb-2">
                    <Form.Check
                      type="checkbox"
                      label="Can Mint"
                      checked={whitelistForm.canMint}
                      onChange={(e) => setWhitelistForm({...whitelistForm, canMint: e.target.checked})}
                      className="me-2"
                    />
                    <Badge bg={whitelistForm.canMint ? "success" : "secondary"} className="px-3 py-1">
                      {whitelistForm.canMint ? "✅ Enabled" : "❌ Disabled"}
                    </Badge>
                  </div>
                </Col>
                <Col>
                  <div className="d-flex align-items-center mb-2">
                    <Form.Check
                      type="checkbox"
                      label="Can Burn"
                      checked={whitelistForm.canBurn}
                      onChange={(e) => setWhitelistForm({...whitelistForm, canBurn: e.target.checked})}
                      className="me-2"
                    />
                    <Badge bg={whitelistForm.canBurn ? "warning" : "secondary"} className="px-3 py-1">
                      {whitelistForm.canBurn ? "✅ Enabled" : "❌ Disabled"}
                    </Badge>
                  </div>
                </Col>
              </Row>
              
              <Button
                variant="primary"
                onClick={handleUpdateWhitelist}
                disabled={actionLoading || !whitelistForm.address}
                className="w-100 py-3 fw-bold border-0"
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0d6efd, #0a58ca)',
                  boxShadow: actionLoading ? '0 4px 15px rgba(13, 110, 253, 0.2)' : '0 4px 20px rgba(13, 110, 253, 0.4)',
                  animation: actionLoading ? 'none' : 'buttonPulse 2s infinite',
                  fontSize: '1.1rem'
                }}
              >
                {actionLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <span style={{ marginRight: '8px' }}>✨</span>
                    UPDATE WHITELIST
                  </>
                )}
              </Button>
              
              {whitelistForm.address && (
                <div className="mt-3 text-center">
                  <small className="text-muted">
                    Will update permissions for: <code>{formatAddress(whitelistForm.address)}</code>
                  </small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6}>
          <Card className="border-0 shadow-lg" style={{
            borderRadius: '20px',
            background: 'linear-gradient(145deg, #ffffff, #f0f0f0)'
          }}>
            <Card.Header className="bg-white border-0 pt-4" style={{ borderRadius: '20px 20px 0 0' }}>
              <h5 className="mb-0 fw-bold d-flex align-items-center">
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #17a2b8, #138496)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '10px',
                  boxShadow: '0 0 15px rgba(23, 162, 184, 0.3)'
                }}>
                  <span style={{ color: 'white', fontSize: '1.2rem' }}>🔧</span>
                </div>
                Manage Admins
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold mb-2 d-flex align-items-center">
                  <span style={{ marginRight: '8px' }}>👑</span>
                  Ethereum Address
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="0x..."
                  value={adminForm.address}
                  onChange={(e) => setAdminForm({...adminForm, address: e.target.value})}
                  style={{
                    borderRadius: '10px',
                    padding: '12px 15px',
                    border: '1px solid #dee2e6'
                  }}
                />
              </Form.Group>
              
              <div className="mb-4">
                <div className="d-flex justify-content-center gap-4 mb-3">
                  <div className="text-center">
                    <Form.Check
                      type="radio"
                      label="Add Admin"
                      name="adminAction"
                      checked={adminForm.isAdmin}
                      onChange={() => setAdminForm({...adminForm, isAdmin: true})}
                      className="mb-2"
                    />
                    <Badge bg="success" className="px-3 py-2">
                      Grant Admin Rights
                    </Badge>
                  </div>
                  <div className="text-center">
                    <Form.Check
                      type="radio"
                      label="Remove Admin"
                      name="adminAction"
                      checked={!adminForm.isAdmin}
                      onChange={() => setAdminForm({...adminForm, isAdmin: false})}
                      className="mb-2"
                    />
                    <Badge bg="danger" className="px-3 py-2">
                      Revoke Admin Rights
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Button
                variant={adminForm.isAdmin ? "success" : "danger"}
                onClick={handleUpdateAdmin}
                disabled={actionLoading || !adminForm.address}
                className="w-100 py-3 fw-bold border-0"
                style={{
                  borderRadius: '12px',
                  background: adminForm.isAdmin 
                    ? 'linear-gradient(135deg, #28a745, #218838)' 
                    : 'linear-gradient(135deg, #dc3545, #c82333)',
                  boxShadow: actionLoading 
                    ? adminForm.isAdmin 
                      ? '0 4px 15px rgba(40, 167, 69, 0.2)' 
                      : '0 4px 15px rgba(220, 53, 69, 0.2)'
                    : adminForm.isAdmin 
                      ? '0 4px 20px rgba(40, 167, 69, 0.4)' 
                      : '0 4px 20px rgba(220, 53, 69, 0.4)',
                  animation: actionLoading ? 'none' : 'buttonPulse 2s infinite',
                  fontSize: '1.1rem'
                }}
              >
                {actionLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <span style={{ marginRight: '8px' }}>
                      {adminForm.isAdmin ? '➕' : '➖'}
                    </span>
                    {adminForm.isAdmin ? 'ADD ADMIN' : 'REMOVE ADMIN'}
                  </>
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* All Payments */}
      <Card className="border-0 shadow-lg mb-5" style={{
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
                  background: 'linear-gradient(135deg, #6f42c1, #563d7c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '10px',
                  boxShadow: '0 0 15px rgba(111, 66, 193, 0.3)'
                }}>
                  <span style={{ color: 'white', fontSize: '1.2rem' }}>📊</span>
                </div>
                All Payments
              </h5>
              <small className="text-muted">Monitor all INRT token purchases across the system</small>
            </div>
            <Badge bg="primary" className="px-3 py-2" style={{
              fontSize: '0.9rem',
              fontWeight: '500',
              borderRadius: '10px',
              boxShadow: '0 0 10px rgba(13, 110, 253, 0.3)'
            }}>
              {allPayments.length} Total
            </Badge>
          </div>
        </Card.Header>
        <Card.Body className="p-4">
          {allPayments.length === 0 ? (
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
              <p className="text-muted">No payments have been made yet</p>
            </div>
          ) : (
            <div className="table-responsive" style={{
              borderRadius: '15px',
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
            }}>
              <Table hover className="mb-0">
                <thead style={{ 
                  background: 'linear-gradient(135deg, #6f42c1, #563d7c)',
                  color: 'white'
                }}>
                  <tr>
                    <th className="py-3" style={{ paddingLeft: '25px', fontWeight: '600' }}>User</th>
                    <th className="py-3" style={{ fontWeight: '600' }}>Amount</th>
                    <th className="py-3" style={{ fontWeight: '600' }}>Status</th>
                    <th className="py-3" style={{ fontWeight: '600' }}>Payment ID</th>
                    <th className="py-3" style={{ paddingRight: '25px', fontWeight: '600' }}>Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {allPayments.slice(0, 10).map(payment => (
                    <tr key={payment._id} style={{ 
                      borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(111, 66, 193, 0.03)';
                      e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                      <td className="py-3" style={{ paddingLeft: '25px' }}>
                        <code className="bg-light p-2 rounded" style={{ 
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                          color: '#495057'
                        }}>
                          {formatAddress(payment.userAddress)}
                        </code>
                      </td>
                      <td className="py-3">
                        <div className="fw-bold" style={{ fontSize: '1.2rem', color: '#6f42c1' }}>
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
                                     payment.status === 'completed' ? '0 0 10px rgba(255, 193, 7, 0.4)' : 'none'
                        }}>
                          {payment.transactionHash ? 'Minted' : payment.status}
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
                            href={`https://mumbai.polygonscan.com/tx/${payment.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-pill"
                            style={{
                              fontWeight: '500',
                              borderWidth: '2px',
                              boxShadow: '0 2px 8px rgba(13, 110, 253, 0.2)'
                            }}
                          >
                            <span style={{ marginRight: '5px' }}>🔗</span>
                            View
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
        {allPayments.length > 0 && (
          <Card.Footer className="bg-white border-0 py-3" style={{ 
            borderRadius: '0 0 20px 20px',
            borderTop: '1px solid #f1f1f1'
          }}>
            <div className="text-center text-muted small">
              Showing {Math.min(allPayments.length, 10)} of {allPayments.length} payments
            </div>
          </Card.Footer>
        )}
      </Card>

      {/* Admin Logs */}
      <Card className="border-0 shadow-lg" style={{
        borderRadius: '20px',
        background: 'linear-gradient(145deg, #ffffff, #f0f0f0)'
      }}>
        <Card.Header className="bg-white border-0 pt-4" style={{ borderRadius: '20px 20px 0 0' }}>
          <h5 className="mb-0 fw-bold d-flex align-items-center">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #17a2b8, #138496)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '10px',
              boxShadow: '0 0 15px rgba(23, 162, 184, 0.3)'
            }}>
              <span style={{ color: 'white', fontSize: '1.2rem' }}>📝</span>
            </div>
            Admin Action Logs
          </h5>
        </Card.Header>
        <Card.Body className="p-4" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {logs.length === 0 ? (
            <div className="text-center py-3">
              <span style={{ fontSize: '3rem', opacity: 0.3 }}>📋</span>
              <p className="text-muted mt-2">No admin actions logged yet</p>
            </div>
          ) : (
            <div className="log-list">
              {logs.map((log, index) => (
                <div key={index} className={`mb-2 p-3 rounded ${log.type === 'error' ? 'bg-danger bg-opacity-10' : 'bg-success bg-opacity-10'}`}>
                  <div className="d-flex justify-content-between">
                    <span className={`fw-semibold ${log.type === 'error' ? 'text-danger' : 'text-success'}`}>
                      {log.type === 'error' ? '❌' : '✅'} {log.message}
                    </span>
                    <span className="text-muted small">{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
        {logs.length > 0 && (
          <Card.Footer className="bg-white border-0 py-3" style={{ 
            borderRadius: '0 0 20px 20px',
            borderTop: '1px solid #f1f1f1'
          }}>
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                {logs.length} log{logs.length !== 1 ? 's' : ''}
              </small>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setLogs([])}
                className="rounded-pill"
              >
                Clear Logs
              </Button>
            </div>
          </Card.Footer>
        )}
      </Card>

      <style>{`
        @keyframes buttonPulse {
          0% { box-shadow: 0 4px 20px rgba(13, 110, 253, 0.4); }
          50% { box-shadow: 0 4px 25px rgba(13, 110, 253, 0.6); }
          100% { box-shadow: 0 4px 20px rgba(13, 110, 253, 0.4); }
        }
        
        .admin-dashboard {
          background: transparent;
        }
        
        .card {
          transition: transform 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-5px);
        }
        
        .log-list {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
          .card {
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;