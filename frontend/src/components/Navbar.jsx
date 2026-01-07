import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button, Dropdown, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const CustomNavbar = ({ account, userRole, onConnect, onDisconnect, walletLoading }) => {
  const navigate = useNavigate();

  const handleConnect = async () => {
    const result = await onConnect();
    if (result && result.success) {
      navigate('/dashboard');
    }
  };

  const handleDisconnect = () => {
    if (window.confirm('Are you sure you want to disconnect your wallet?')) {
      onDisconnect();
      navigate('/');
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Role badge colors with better styling
  const getRoleBadge = (role, label) => {
    if (!role) return null;
    
    const colors = {
      Admin: 'danger',
      Minter: 'success', 
      Burner: 'warning'
    };
    
    return (
      <Badge 
        bg={colors[label]}
        className="px-2 py-1 rounded-pill fw-normal"
        style={{
          fontSize: '0.7rem',
          letterSpacing: '0.5px',
          boxShadow: `0 0 5px ${colors[label] === 'danger' ? '#dc3545' : colors[label] === 'success' ? '#28a745' : '#ffc107'}`
        }}
      >
        {label}
      </Badge>
    );
  };

  return (
    <BootstrapNavbar 
      bg="white" 
      expand="lg" 
      className="py-3 shadow-sm border-bottom"
      style={{
        background: 'white',
        boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)'
      }}
    >
      <Container fluid="xl">
        {/* Brand Logo with Neon Effect */}
        <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center gap-2">
          <div style={{
            width: '35px',
            height: '35px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 10px rgba(13, 110, 253, 0.5)',
            position: 'relative',
            animation: 'glow 2s ease-in-out infinite alternate'
          }}>
            <span className="text-white fw-bold">I</span>
          </div>
          <div className="d-flex flex-column">
            <span className="text-dark fw-bold fs-4" style={{
              textShadow: '0 0 1px rgba(0, 0, 0, 0.1)'
            }}>INRT</span>
            <span className="text-muted" style={{
              fontSize: '0.65rem',
              letterSpacing: '1px',
              fontWeight: '600'
            }}>TOKEN SYSTEM</span>
          </div>
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle 
          aria-controls="basic-navbar-nav" 
          className="border-0"
          style={{ boxShadow: 'none' }}
        >
          <span className="navbar-toggler-icon"></span>
        </BootstrapNavbar.Toggle>
        
        <BootstrapNavbar.Collapse id="basic-navbar-nav" className="justify-content-between">
          {/* Navigation Links */}
          <Nav className="mx-auto mx-lg-0 d-flex align-items-center gap-4">
            <Nav.Link 
              as={Link} 
              to="/" 
              className="text-dark position-relative"
              style={{ 
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#0d6efd';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '';
              }}
            >
              Home
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/about" 
              className="text-dark position-relative"
              style={{ 
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#0d6efd';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '';
              }}
            >
              About
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/dashboard" 
              className="text-dark position-relative"
              style={{ 
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#0d6efd';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '';
              }}
            >
              Dashboard
            </Nav.Link>
          </Nav>
          
          {/* Right Section */}
          <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
            {/* Role Badges */}
            {account && (
              <div className="d-flex gap-2 align-items-center">
                {userRole.isAdmin && getRoleBadge(true, 'Admin')}
                {userRole.canMint && getRoleBadge(true, 'Minter')}
                {userRole.canBurn && getRoleBadge(true, 'Burner')}
              </div>
            )}
            
            {/* Wallet Connection */}
            {account ? (
              <Dropdown align="end">
                <Dropdown.Toggle 
                  variant="outline-primary" 
                  id="dropdown-basic"
                  className="d-flex align-items-center gap-2 border-1 px-3 py-2 rounded-pill"
                  style={{
                    background: 'white',
                    fontWeight: '500',
                    boxShadow: '0 2px 8px rgba(13, 110, 253, 0.1)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow = '0 0 10px rgba(13, 110, 253, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = '0 2px 8px rgba(13, 110, 253, 0.1)';
                  }}
                >
                  <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
                       style={{ 
                         width: '25px', 
                         height: '25px',
                         background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)'
                       }}>
                    <span className="text-white small">W</span>
                  </div>
                  <div className="d-flex flex-column text-start">
                    <span className="text-dark fw-semibold" style={{ fontSize: '0.8rem' }}>
                      {formatAddress(account)}
                    </span>
                    <span className="text-primary" style={{ fontSize: '0.65rem' }}>
                      Connected
                    </span>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu 
                  className="mt-2 border-0 shadow-lg"
                  style={{
                    borderRadius: '10px',
                    border: '1px solid rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <Dropdown.Header className="text-muted fw-semibold border-bottom">
                    Wallet Account
                  </Dropdown.Header>
                  <Dropdown.Item 
                    as={Link} 
                    to="/dashboard"
                    className="text-dark py-2"
                    style={{ 
                      transition: 'all 0.1s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f8f9fa';
                    }}
                  >
                    Dashboard
                  </Dropdown.Item>
                  
                  <Dropdown.Item 
                    href={`https://mumbai.polygonscan.com/address/${account}`}
                    target="_blank"
                    className="text-dark py-2"
                    style={{ 
                      transition: 'all 0.1s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f8f9fa';
                    }}
                  >
                    View on Explorer
                  </Dropdown.Item>
                  
                  <Dropdown.Divider />
                  
                  <Dropdown.Item 
                    onClick={handleDisconnect} 
                    className="text-danger py-2"
                    style={{ 
                      transition: 'all 0.1s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f8f9fa';
                    }}
                  >
                    Disconnect Wallet
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Button 
                variant="primary" 
                onClick={handleConnect}
                disabled={walletLoading}
                className="px-4 py-2 rounded-pill"
                style={{
                  background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
                  fontWeight: '500',
                  boxShadow: '0 4px 12px rgba(13, 110, 253, 0.3)',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  animation: walletLoading ? 'none' : 'glow 2s ease-in-out infinite alternate'
                }}
                onMouseEnter={(e) => {
                  if (!walletLoading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(13, 110, 253, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(13, 110, 253, 0.3)';
                }}
              >
                {walletLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Connecting...
                  </>
                ) : (
                  'Connect Wallet'
                )}
              </Button>
            )}
          </div>
        </BootstrapNavbar.Collapse>
      </Container>

      <style jsx>{`
        @keyframes glow {
          from {
            box-shadow: 0 0 5px rgba(13, 110, 253, 0.3);
          }
          to {
            box-shadow: 0 0 10px rgba(13, 110, 253, 0.6);
          }
        }
        
        /* Simple neon effect for brand icon */
        .navbar-brand div:first-child::after {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: 10px;
          background: linear-gradient(135deg, #0d6efd 0%, transparent 50%);
          z-index: -1;
          animation: glow 2s ease-in-out infinite alternate;
        }
        
        /* Responsive adjustments */
        @media (max-width: 992px) {
          .navbar-collapse {
            background: white;
            padding: 15px;
            border-radius: 10px;
            margin-top: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          }
          
          .nav-link {
            padding: 10px 15px !important;
            border-radius: 5px;
          }
          
          .nav-link:hover {
            background-color: #f8f9fa;
          }
        }
      `}</style>
    </BootstrapNavbar>
  );
};

export default CustomNavbar;