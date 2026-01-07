import React from 'react';
import { Container, Row, Col, Card, Accordion, Badge } from 'react-bootstrap';

const AboutPage = () => {
  return (
    <Container className="py-5">
      {/* Hero Section */}
      <Row className="mb-5 text-center">
        <Col lg={10} className="mx-auto">
          <Badge bg="primary" className="px-4 py-2 mb-3 rounded-pill fw-bold">
            B.Tech Final Year Project
          </Badge>
          <h1 className="display-5 fw-bold mb-4">
            <span style={{
              color: '#0d6efd',
              textShadow: '0 0 10px rgba(13, 110, 253, 0.5)'
            }}>
              INRT
            </span> Stable Token System
          </h1>
          <p className="lead text-muted">
            A blockchain-based digital currency pegged 1:1 to Indian Rupee,
            designed for secure, transparent, and programmable digital payments.
          </p>
        </Col>
      </Row>

      {/* Features Section */}
      <Row className="mb-5">
        <Col className="text-center mb-4">
          <h2 className="fw-bold mb-4" style={{
            textShadow: '0 0 5px rgba(0, 0, 0, 0.1)'
          }}>Core Features</h2>
        </Col>
        
        <Row>
          {[
            { 
              icon: '🔐',
              title: 'Secure & Regulated',
              desc: 'Blockchain security with compliance features'
            },
            { 
              icon: '💰',
              title: '1:1 INR Peg',
              desc: 'Every token backed by equivalent INR in reserve'
            },
            { 
              icon: '👁️',
              title: 'Transparent',
              desc: 'All transactions recorded on blockchain'
            },
            { 
              icon: '📊',
              title: 'Audit Ready',
              desc: 'Complete transaction history for easy auditing'
            },
            { 
              icon: '👥',
              title: 'Role Control',
              desc: 'Controlled minting and burning with permissions'
            },
            { 
              icon: '⚡',
              title: 'Programmable',
              desc: 'Smart contracts automate compliance and taxes'
            }
          ].map((feature, index) => (
            <Col lg={4} md={6} className="mb-4" key={index}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body className="text-center p-4">
                  <div className="mb-3" style={{
                    fontSize: '2.5rem'
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
      </Row>

      {/* How It Works */}
      <Row className="mb-5">
        <Col className="text-center mb-4">
          <h2 className="fw-bold mb-4" style={{
            textShadow: '0 0 5px rgba(0, 0, 0, 0.1)'
          }}>How It Works</h2>
        </Col>
        
        <Col lg={10} className="mx-auto">
          <div className="d-flex flex-wrap justify-content-center text-center">
            {[
              { step: '1', title: 'Connect Wallet', desc: 'Link MetaMask wallet' },
              { step: '2', title: 'Make Payment', desc: 'Pay INR via Razorpay' },
              { step: '3', title: 'Token Minting', desc: 'Minter mints INRT tokens' },
              { step: '4', title: 'Use Tokens', desc: 'Transfer or hold INRT' },
              { step: '5', title: 'Redeem', desc: 'Burn tokens to redeem INR' }
            ].map((step, index) => (
              <div key={index} className="position-relative" style={{ width: '20%', minWidth: '150px' }}>
                <div className="mb-3">
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    margin: '0 auto',
                    boxShadow: '0 0 15px rgba(13, 110, 253, 0.3)'
                  }}>
                    {step.step}
                  </div>
                </div>
                <h5 className="fw-bold mb-2">{step.title}</h5>
                <p className="text-muted small">{step.desc}</p>
                {index < 4 && (
                  <div style={{
                    position: 'absolute',
                    top: '30px',
                    right: '-20px',
                    width: '40px',
                    height: '2px',
                    backgroundColor: '#0d6efd',
                    opacity: 0.3
                  }}></div>
                )}
              </div>
            ))}
          </div>
        </Col>
      </Row>

      {/* Technical Details */}
      <Row className="mb-5">
        <Col lg={6} className="mb-4">
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="p-4">
              <Card.Title className="fw-bold mb-4">
                <span style={{ fontSize: '1.5rem' }}>⚙️</span> Technical Stack
              </Card.Title>
              <div className="mb-3">
                <p className="text-muted">
                  Built with modern web3 technologies for scalability and security.
                </p>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {[
                  'Solidity', 'React.js', 'Express.js', 'MongoDB', 
                  'Razorpay', 'MetaMask', 'Web3.js', 'Polygon'
                ].map((tech, index) => (
                  <Badge key={index} bg="secondary" className="px-3 py-2">
                    {tech}
                  </Badge>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6} className="mb-4">
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="p-4">
              <Card.Title className="fw-bold mb-4">
                <span style={{ fontSize: '1.5rem' }}>📋</span> Project Details
              </Card.Title>
              <div className="mb-3">
                <h6 className="fw-semibold text-primary">Project Type</h6>
                <p className="text-muted">Academic Research Prototype</p>
              </div>
              <div className="mb-3">
                <h6 className="fw-semibold text-primary">Supervisor</h6>
                <p className="text-muted">Ms. P. Sangeeta (B.Tech, M.Tech, Ph.D)</p>
              </div>
              <div className="mb-3">
                <h6 className="fw-semibold text-primary">Team Members</h6>
                <p className="text-muted">
                  R. Kavya, P. Uday Kiran, U. Krishna Vamsi, S. Uday
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* FAQ Section */}
      <Row className="mb-5">
        <Col lg={10} className="mx-auto">
          <h2 className="fw-bold text-center mb-4" style={{
            textShadow: '0 0 5px rgba(0, 0, 0, 0.1)'
          }}>Frequently Asked Questions</h2>
          
          <Accordion className="shadow-sm">
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                <span className="fw-semibold">What is INRT Token?</span>
              </Accordion.Header>
              <Accordion.Body className="text-muted">
                INRT is a stable digital token pegged 1:1 with Indian Rupee.
                Each INRT token represents 1 INR held in reserve.
              </Accordion.Body>
            </Accordion.Item>
            
            <Accordion.Item eventKey="1">
              <Accordion.Header>
                <span className="fw-semibold">How do I purchase INRT tokens?</span>
              </Accordion.Header>
              <Accordion.Body className="text-muted">
                1. Connect your MetaMask wallet<br/>
                2. Go to Dashboard<br/>
                3. Enter amount and complete payment<br/>
                4. Tokens are minted to your wallet
              </Accordion.Body>
            </Accordion.Item>
            
            <Accordion.Item eventKey="2">
              <Accordion.Header>
                <span className="fw-semibold">Can I redeem INRT for INR?</span>
              </Accordion.Header>
              <Accordion.Body className="text-muted">
                Yes, you can burn your INRT tokens to redeem equivalent INR.
              </Accordion.Body>
            </Accordion.Item>
            
            <Accordion.Item eventKey="3">
              <Accordion.Header>
                <span className="fw-semibold">Is this a real cryptocurrency?</span>
              </Accordion.Header>
              <Accordion.Body className="text-muted">
                This is a research prototype for educational purposes.
                It operates on test networks with test funds.
              </Accordion.Body>
            </Accordion.Item>
            
            <Accordion.Item eventKey="4">
              <Accordion.Header>
                <span className="fw-semibold">What security features are implemented?</span>
              </Accordion.Header>
              <Accordion.Body className="text-muted">
                Smart contract auditing, whitelist-only minting/burning,
                multi-admin control, emergency pause function, and
                blockchain's inherent cryptographic security.
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Col>
      </Row>

      {/* Footer */}
      <Row className="mt-5">
        <Col className="text-center">
          <p className="text-muted mb-2">
            B.Tech Final Year Project | Blockchain Technology | 2024
          </p>
          <p className="small text-muted">
            Note: This project is for educational and research purposes only.
          </p>
          <div className="mt-3">
            <span className="text-primary fw-semibold" style={{
              textShadow: '0 0 5px rgba(13, 110, 253, 0.3)'
            }}>
              A Stable Digital Token for INR Pegging
            </span>
          </div>
        </Col>
      </Row>

      <style>{`
        .shadow-sm {
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05) !important;
        }
        
        .border-0 {
          border: none !important;
        }
        
        .rounded-pill {
          border-radius: 50rem !important;
        }
        
        /* Neon effect for main title */
        h1 span {
          animation: neonGlow 2s ease-in-out infinite alternate;
        }
        
        @keyframes neonGlow {
          from {
            text-shadow: 0 0 5px #0d6efd, 0 0 10px #0d6efd;
          }
          to {
            text-shadow: 0 0 10px #0d6efd, 0 0 20px #0d6efd, 0 0 30px #0d6efd;
          }
        }
        
        /* Subtle hover effects for cards */
        .card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }
        
        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .display-5 {
            font-size: 2.5rem;
          }
          
          .lead {
            font-size: 1.1rem;
          }
          
          /* Step connectors hidden on mobile */
          .position-relative .d-none {
            display: none !important;
          }
        }
      `}</style>
    </Container>
  );
};

export default AboutPage;