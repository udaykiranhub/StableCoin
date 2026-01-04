import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-75">
            <Col lg={6} className="hero-content">
              <h1 className="hero-title">
                Welcome to <span className="highlight">INRT Token</span> System
              </h1>
              <p className="hero-subtitle">
                A blockchain-based stable token pegged 1:1 with Indian Rupee.
                Secure, transparent, and accessible digital currency for everyone.
              </p>
              <div className="hero-buttons">
                <Button as={Link} to="/dashboard" variant="primary" size="lg" className="me-3">
                  Get Started
                </Button>
                <Button as={Link} to="/about" variant="outline-light" size="lg">
                  Learn More
                </Button>
              </div>
            </Col>
            <Col lg={6} className="hero-image-col">
              <div className="hero-image">
                <div className="token-visual">
                  <div className="token-circle">
                    <span className="token-icon">₹</span>
                  </div>
                  <div className="blockchain-visual">
                    <div className="block"></div>
                    <div className="block"></div>
                    <div className="block"></div>
                    <div className="chain-line"></div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Container>
          <div className="section-header text-center mb-5">
            <h2 className="section-title">Why Choose INRT Token?</h2>
            <p className="section-subtitle">
              Experience the future of digital currency with our innovative features
            </p>
          </div>
          
          <Row className="g-4">
            <Col md={4}>
              <Card className="feature-card h-100">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    <span>💰</span>
                  </div>
                  <Card.Title className="feature-title">Stable Value</Card.Title>
                  <Card.Text className="feature-text">
                    1 INRT = 1 Indian Rupee. Each token is backed by real INR reserves,
                    ensuring price stability and trust.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="feature-card h-100">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    <span>⚡</span>
                  </div>
                  <Card.Title className="feature-title">Fast Transactions</Card.Title>
                  <Card.Text className="feature-text">
                    Instant transfers on blockchain network. No banking delays,
                    available 24/7 for seamless transactions.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="feature-card h-100">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    <span>🔒</span>
                  </div>
                  <Card.Title className="feature-title">Secure & Transparent</Card.Title>
                  <Card.Text className="feature-text">
                    Built on Ethereum blockchain with full audit trail.
                    All transactions are verifiable and immutable.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <Container>
          <div className="section-header text-center mb-5">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              Simple steps to get started with INRT tokens
            </p>
          </div>
          
          <Row className="steps-row">
            <Col lg={3} md={6} className="step-col">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h5 className="step-title">Connect Wallet</h5>
                  <p className="step-text">Connect your MetaMask wallet securely</p>
                </div>
              </div>
            </Col>
            
            <Col lg={3} md={6} className="step-col">
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h5 className="step-title">Purchase Tokens</h5>
                  <p className="step-text">Buy INRT tokens using Razorpay gateway</p>
                </div>
              </div>
            </Col>
            
            <Col lg={3} md={6} className="step-col">
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h5 className="step-title">Use Tokens</h5>
                  <p className="step-text">Transfer, hold or use in applications</p>
                </div>
              </div>
            </Col>
            
            <Col lg={3} md={6} className="step-col">
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h5 className="step-title">Redeem Anytime</h5>
                  <p className="step-text">Burn tokens to redeem equivalent INR</p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <Container>
          <Row className="stats-row">
            <Col md={3} className="text-center">
              <div className="stat-item">
                <h3 className="stat-value">1:1</h3>
                <p className="stat-label">Peg Ratio</p>
              </div>
            </Col>
            <Col md={3} className="text-center">
              <div className="stat-item">
                <h3 className="stat-value">₹1</h3>
                <p className="stat-label">Min. Purchase</p>
              </div>
            </Col>
            <Col md={3} className="text-center">
              <div className="stat-item">
                <h3 className="stat-value">24/7</h3>
                <p className="stat-label">Availability</p>
              </div>
            </Col>
            <Col md={3} className="text-center">
              <div className="stat-item">
                <h3 className="stat-value">0%</h3>
                <p className="stat-label">Small Tx Fee</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <div className="cta-card">
            <Row className="align-items-center">
              <Col md={8}>
                <h3 className="cta-title">Ready to Get Started?</h3>
                <p className="cta-text">
                  Connect your wallet and start using INRT tokens today.
                  Experience the future of digital currency.
                </p>
              </Col>
              <Col md={4} className="text-md-end">
                <Button as={Link} to="/dashboard" variant="light" size="lg">
                  Launch Dashboard
                </Button>
              </Col>
            </Row>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;