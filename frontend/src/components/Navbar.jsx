import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Offcanvas } from 'react-bootstrap';
import WalletConnect from './WalletConnect';

const CustomNavbar = ({ account, onConnect, onDisconnect, onRoleChange, userRole }) => {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    ...(account ? [{ path: '/dashboard', label: 'Dashboard' }] : [])
  ];

  const handleToggleOffcanvas = () => setShowOffcanvas(!showOffcanvas);

  return (
    <>
      <Navbar expand="lg" className="navbar-main" variant="dark">
        <Container>
          <Navbar.Brand as={Link} to="/" className="navbar-brand">
            <div className="brand-logo">
              <span className="logo-icon">₹</span>
              <span className="brand-text">INRT Token</span>
            </div>
          </Navbar.Brand>

          {/* Desktop Navigation */}
          <div className="d-none d-lg-flex align-items-center w-100">
            <Nav className="me-auto">
              {navLinks.map((link) => (
                <Nav.Link 
                  key={link.path}
                  as={Link} 
                  to={link.path}
                  className={`nav-link-desktop ${location.pathname === link.path ? 'active' : ''}`}
                >
                  {link.label}
                </Nav.Link>
              ))}
            </Nav>
            
            <div className="d-flex align-items-center gap-3">
              {/* Role Badges */}
              {account && (
                <div className="role-badges d-none d-md-flex">
                  {userRole.isAdmin && <span className="badge admin-badge">Admin</span>}
                  {userRole.canMint && <span className="badge minter-badge">Minter</span>}
                  {userRole.canBurn && <span className="badge burner-badge">Burner</span>}
                </div>
              )}
              
              <WalletConnect
                onConnect={onConnect}
                onDisconnect={onDisconnect}
                onRoleChange={onRoleChange}
              />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="outline-light"
            className="d-lg-none mobile-menu-btn"
            onClick={handleToggleOffcanvas}
          >
            <span className="hamburger-icon">☰</span>
          </Button>
        </Container>
      </Navbar>

      {/* Mobile Offcanvas Menu */}
      <Offcanvas show={showOffcanvas} onHide={handleToggleOffcanvas} placement="end" className="mobile-menu">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <div className="brand-logo">
              <span className="logo-icon">₹</span>
              <span className="brand-text">INRT Token</span>
            </div>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column mobile-nav">
            {navLinks.map((link) => (
              <Nav.Link
                key={link.path}
                as={Link}
                to={link.path}
                className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
                onClick={handleToggleOffcanvas}
              >
                {link.label}
              </Nav.Link>
            ))}
            
            {/* Role Badges Mobile */}
            {account && (
              <div className="role-badges-mobile mt-3">
                {userRole.isAdmin && <span className="badge admin-badge">Admin</span>}
                {userRole.canMint && <span className="badge minter-badge">Minter</span>}
                {userRole.canBurn && <span className="badge burner-badge">Burner</span>}
              </div>
            )}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default CustomNavbar;