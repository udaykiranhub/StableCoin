import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section py-5" style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: 'white'
      }}>
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <Badge bg="primary" className="px-3 py-2 mb-3 rounded-pill">
                B.Tech Final Year Project
              </Badge>
              <h1 className="display-5 fw-bold mb-4">
                Welcome to <span style={{
                  color: '#0d6efd',
                  textShadow: '0 0 10px rgba(13, 110, 253, 0.5)'
                }}>INRT Token</span>
              </h1>
              <p className="lead mb-4 text-white-75">
                A blockchain-based stable token pegged 1:1 with Indian Rupee.
                Secure, transparent, and accessible digital currency.
              </p>
              <div className="d-flex gap-3">
                <Button 
                  as={Link} 
                  to="/dashboard" 
                  variant="primary" 
                  size="lg"
                  className="px-4 py-3 rounded-pill"
                  style={{
                    background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(13, 110, 253, 0.3)'
                  }}
                >
                  Get Started
                </Button>
                <Button 
                  as={Link} 
                  to="/about" 
                  variant="outline-light" 
                  size="lg"
                  className="px-4 py-3 rounded-pill"
                >
                  Learn More
                </Button>
              </div>
            </Col>
            <Col lg={6} className="text-center">
              <div className="token-visual mt-4 mt-lg-0">
                <div className="d-flex align-items-center justify-content-center">
                  <div 
                    className="token-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: '200px',
                      height: '200px',
                      borderRadius: '50%',
                      background: 'rgba(13, 110, 253, 0.1)',
                      border: '2px solid rgba(13, 110, 253, 0.3)',
                      boxShadow: '0 0 30px rgba(13, 110, 253, 0.2)'
                    }}
                  >
                    <div style={{
                      fontSize: '5rem',
                      fontWeight: 'bold',
                      color: '#0d6efd',
                      textShadow: '0 0 20px rgba(13, 110, 253, 0.5)'
                    }}>
                      ₹
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="d-flex justify-content-center gap-3">
                    <Badge bg="success" className="px-3 py-2 rounded-pill">
                      💰 1:1 Pegged
                    </Badge>
                    <Badge bg="info" className="px-3 py-2 rounded-pill">
                      ⚡ Fast
                    </Badge>
                    <Badge bg="warning" className="px-3 py-2 rounded-pill text-dark">
                      🔒 Secure
                    </Badge>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features */}
      <section className="features-section py-5 bg-white">
        <Container>
          <h2 className="text-center mb-5 fw-bold" style={{
            textShadow: '0 0 5px rgba(0, 0, 0, 0.1)'
          }}>
            Why Choose <span style={{ color: '#0d6efd' }}>INRT</span>?
          </h2>
          
          <Row className="g-4">
            {[
              {
                icon: '💰',
                title: 'Stable Value',
                desc: '1 INRT = 1 Indian Rupee. Backed by real reserves with transparent tracking.'
              },
              {
                icon: '⚡',
                title: 'Fast Transactions',
                desc: 'Instant blockchain transfers. No banking delays or settlement waits.'
              },
              {
                icon: '🔒',
                title: 'Secure & Transparent',
                desc: 'Built on Ethereum blockchain with full audit trail and cryptographic security.'
              },
              {
                icon: '👁️',
                title: 'Full Transparency',
                desc: 'All minting, burning, and transfers recorded on-chain for complete visibility.'
              },
              {
                icon: '⚖️',
                title: 'Regulatory Compliance',
                desc: 'Automated tax collection and compliance features built into smart contracts.'
              },
              {
                icon: '🎯',
                title: 'Programmable',
                desc: 'Smart contracts enable automated rules, limits, and conditional logic.'
              }
            ].map((feature, index) => (
              <Col md={4} key={index}>
                <Card className="h-100 border-0 shadow-sm" style={{
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
                }}>
                  <Card.Body className="text-center p-4">
                    <div className="mb-3" style={{
                      fontSize: '3rem'
                    }}>
                      {feature.icon}
                    </div>
                    <Card.Title className="fw-bold mb-3">{feature.title}</Card.Title>
                    <Card.Text className="text-muted">
                      {feature.desc}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* How It Works */}
      <section className="how-it-works py-5" style={{
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
      }}>
        <Container>
          <h2 className="text-center mb-5 fw-bold" style={{
            textShadow: '0 0 5px rgba(0, 0, 0, 0.1)'
          }}>
            How It Works
          </h2>
          
          <div className="d-flex flex-wrap justify-content-center text-center">
            {[
              { 
                step: '1', 
                icon: '🔌',
                title: 'Connect Wallet', 
                desc: 'Connect MetaMask wallet to the platform' 
              },
              { 
                step: '2', 
                icon: '💳',
                title: 'Make Payment', 
                desc: 'Pay INR via secure Razorpay gateway' 
              },
              { 
                step: '3', 
                icon: '🪙',
                title: 'Token Minting', 
                desc: 'Whitelisted minter mints equivalent INRT' 
              },
              { 
                step: '4', 
                icon: '🔄',
                title: 'Use Tokens', 
                desc: 'Transfer, trade, or hold your tokens' 
              },
              { 
                step: '5', 
                icon: '🔥',
                title: 'Redeem', 
                desc: 'Burn tokens to redeem equivalent INR' 
              }
            ].map((step, index) => (
              <div key={index} className="position-relative" style={{ 
                width: '20%', 
                minWidth: '180px',
                padding: '20px'
              }}>
                <div className="mb-3">
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    margin: '0 auto',
                    boxShadow: '0 4px 15px rgba(13, 110, 253, 0.3)'
                  }}>
                    <div style={{ fontSize: '1.5rem', marginRight: '5px' }}>
                      {step.icon}
                    </div>
                    {step.step}
                  </div>
                </div>
                <h5 className="fw-bold mb-2">{step.title}</h5>
                <p className="text-muted small">{step.desc}</p>
                {index < 4 && (
                  <div style={{
                    position: 'absolute',
                    top: '35px',
                    right: '0',
                    width: '40px',
                    height: '2px',
                    backgroundColor: '#0d6efd',
                    opacity: 0.3
                  }}></div>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="cta-section py-5">
        <Container>
          <Card className="border-0 shadow-lg" style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: '20px',
            overflow: 'hidden'
          }}>
            <Card.Body className="p-5 text-center text-white">
              <h2 className="mb-4 fw-bold">
                Ready to <span style={{ color: '#0d6efd' }}>Get Started</span>?
              </h2>
              <p className="lead mb-4 text-white-75">
                Connect your wallet and start using INRT tokens today.
                Experience the future of digital currency.
              </p>
              <Button 
                as={Link} 
                to="/dashboard" 
                variant="primary" 
                size="lg"
                className="px-5 py-3 rounded-pill"
                style={{
                  background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
                  border: 'none',
                  boxShadow: '0 4px 15px rgba(13, 110, 253, 0.3)',
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(13, 110, 253, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(13, 110, 253, 0.3)';
                }}
              >
                🚀 Launch Dashboard
              </Button>
              
              <div className="mt-4">
                <p className="text-white-50 small mb-2">
                  Already have tokens? Check your balance and transaction history.
                </p>
                <Button 
                  as={Link} 
                  to="/dashboard" 
                  variant="outline-light" 
                  size="sm"
                  className="rounded-pill"
                >
                  View Dashboard
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </section>

      {/* Footer Note */}
      <section className="py-4 bg-dark text-white text-center">
        <Container>
          <p className="mb-0 text-white-50 small">
            <strong>Note:</strong> This is a B.Tech Final Year Project for educational purposes.
            The system operates on test networks with test funds.
          </p>
        </Container>
      </section>

      <style>{`
        .hero-section {
          position: relative;
          overflow: hidden;
        }
        
        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 50%, rgba(13, 110, 253, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }
        
        .token-circle {
          animation: pulse 2s ease-in-out infinite alternate;
        }
        
        @keyframes pulse {
          from {
            box-shadow: 0 0 20px rgba(13, 110, 253, 0.2);
          }
          to {
            box-shadow: 0 0 40px rgba(13, 110, 253, 0.4);
          }
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .hero-section h1 {
            font-size: 2.5rem;
          }
          
          .token-circle {
            width: 150px !important;
            height: 150px !important;
          }
          
          .token-circle div {
            font-size: 4rem !important;
          }
          
          .how-it-works .position-relative {
            width: 100% !important;
            margin-bottom: 30px;
          }
          
          .how-it-works .position-relative:last-child {
            margin-bottom: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Add this Badge component since it's used but not imported
const Badge = ({ bg, className, children }) => (
  <span className={`badge bg-${bg} ${className}`}>
    {children}
  </span>
);

export default HomePage;