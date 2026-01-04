import React from 'react';
import { Container, Row, Col, Card, Accordion } from 'react-bootstrap';

const AboutPage = () => {
  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col>
          <h1 className="display-5 fw-bold mb-4">About INRT Token</h1>
          <p className="lead">
            INRT is a blockchain-based stable token pegged 1:1 with Indian Rupee (INR), 
            designed as a B.Tech Final Year Project to demonstrate real-world blockchain applications.
          </p>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col lg={6} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <Card.Title className="fw-bold mb-4">Project Overview</Card.Title>
              <Card.Text>
                The INRT Token System implements a fully-reserved stablecoin where each token is 
                backed by an equivalent amount of Indian Rupees held in reserve. The system combines 
                traditional payment gateways with blockchain technology to create a seamless 
                fiat-to-crypto bridge.
              </Card.Text>
              <Card.Text>
                This project demonstrates key blockchain concepts including smart contracts, 
                token economics, payment integration, and decentralized finance principles.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <Card.Title className="fw-bold mb-4">Technical Features</Card.Title>
              <ul className="list-unstyled">
                <li className="mb-2">✅ ERC-20 compliant token standard</li>
                <li className="mb-2">✅ 1:1 INR peg with reserve tracking</li>
                <li className="mb-2">✅ Razorpay payment gateway integration</li>
                <li className="mb-2">✅ Role-based access control (User/Whitelisted/Admin)</li>
                <li className="mb-2">✅ Conditional tax system for large transactions</li>
                <li className="mb-2">✅ Pausable contract for emergencies</li>
                <li className="mb-2">✅ Full audit trail and transparency</li>
                <li className="mb-2">✅ Responsive React dashboard</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col>
          <h2 className="fw-bold mb-4">Frequently Asked Questions</h2>
          <Accordion>
            <Accordion.Item eventKey="0">
              <Accordion.Header>What is INRT Token?</Accordion.Header>
              <Accordion.Body>
                INRT is a stable digital token pegged 1:1 with Indian Rupee. Each INRT token 
                represents 1 INR held in reserve. It's built on Ethereum blockchain using ERC-20 standard.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>How do I purchase INRT tokens?</Accordion.Header>
              <Accordion.Body>
                1. Connect your MetaMask wallet
                2. Navigate to the dashboard
                3. Enter the amount you want to purchase
                4. Complete payment through Razorpay gateway
                5. Tokens are minted to your wallet address
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
              <Accordion.Header>Can I redeem INRT for INR?</Accordion.Header>
              <Accordion.Body>
                Yes, you can burn your INRT tokens to redeem the equivalent INR value. 
                The burn function reduces the token supply and corresponding reserve amount.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="3">
              <Accordion.Header>Is there a transaction fee?</Accordion.Header>
              <Accordion.Body>
                Regular transfers have minimal gas fees only. A 1% tax applies only to 
                transactions above ₹5,00,000 to maintain system stability.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="4">
              <Accordion.Header>What's the minimum purchase amount?</Accordion.Header>
              <Accordion.Body>
                Minimum purchase is ₹1 (1 INRT token). There's no maximum limit for purchasing, 
                but transfer limits apply as per admin configuration.
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="border-0" style={{ backgroundColor: '#f8f9fa' }}>
            <Card.Body>
              <h3 className="fw-bold mb-3">Technology Stack</h3>
              <Row>
                <Col md={3} className="text-center mb-3">
                  <div style={{ fontSize: '2rem' }}>⚡</div>
                  <h5>Solidity</h5>
                  <small className="text-muted">Smart Contracts</small>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div style={{ fontSize: '2rem' }}>⚛️</div>
                  <h5>React</h5>
                  <small className="text-muted">Frontend Framework</small>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div style={{ fontSize: '2rem' }}>🔗</div>
                  <h5>Web3.js</h5>
                  <small className="text-muted">Blockchain Integration</small>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div style={{ fontSize: '2rem' }}>💰</div>
                  <h5>Razorpay</h5>
                  <small className="text-muted">Payment Gateway</small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col className="text-center">
          <p className="text-muted">
            B.Tech Final Year Project | Blockchain Technology | 2024
          </p>
          <p className="small text-muted">
            Note: This is a demonstration project for educational purposes.
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default AboutPage;