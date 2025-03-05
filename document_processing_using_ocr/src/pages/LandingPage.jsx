import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/api";

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
`;

const Navbar = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #3b82f6;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const NavLink = styled.a`
  color: #1e293b;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;

  &:hover {
    color: #3b82f6;
  }
`;

const LoginButton = styled.button`
  padding: 0.5rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
  padding: 6rem 2rem 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    background: url("/path-to-your-pattern.svg");
    opacity: 0.1;
    pointer-events: none;
  }
`;

const HeroContent = styled.div`
  max-width: 1200px;
  text-align: center;
  color: white;
  animation: ${fadeIn} 1s ease-in;
  position: relative;
  z-index: 1;
`;

const Title = styled.h1`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const UploadSection = styled.section`
  padding: 6rem 2rem;
  background: white;
`;

const UploadContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`;

const UploadArea = styled.div`
  border: 2px dashed #3b82f6;
  border-radius: 12px;
  padding: 3rem;
  margin-top: 2rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f0f9ff;
  }
`;

const UploadText = styled.p`
  color: #64748b;
  margin-top: 1rem;
`;

const Footer = styled.footer`
  background: #1e293b;
  color: white;
  padding: 4rem 2rem;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 3rem;
`;

const FooterColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FooterTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
`;

const FooterLink = styled.a`
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: white;
  }
`;

const UserMenu = styled.div`
  position: relative;
  display: inline-block;
`;

const UserIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 500;
  &:hover {
    background: #2563eb;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  min-width: 150px;
  z-index: 1000;
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 0.5rem 1rem;
  text-align: left;
  background: none;
  border: none;
  border-radius: 0.25rem;
  color: #1e293b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #f1f5f9;
  }
`;

const LandingPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Add click outside listener
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setShowDropdown(false);
    navigate("/");
  };

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase() || "?"
    );
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file drop logic here
  };

  return (
    <Container>
      <Navbar>
        <Logo>DocProcess</Logo>
        <NavLinks>
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#about">About</NavLink>
          <NavLink href="#contact">Contact</NavLink>
          {user ? (
            <UserMenu ref={dropdownRef}>
              <UserIcon onClick={() => setShowDropdown(!showDropdown)}>
                {getInitials(user.name)}
              </UserIcon>
              {showDropdown && (
                <DropdownMenu>
                  <MenuItem
                    onClick={() => {
                      navigate("/dashboard");
                      setShowDropdown(false);
                    }}
                  >
                    Dashboard
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      navigate("/profile");
                      setShowDropdown(false);
                    }}
                  >
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </DropdownMenu>
              )}
            </UserMenu>
          ) : (
            <Link to="/login">
              <LoginButton>Login</LoginButton>
            </Link>
          )}
        </NavLinks>
      </Navbar>

      <HeroSection>
        <HeroContent>
          <Title>Transform Your Documents Into Actionable Data</Title>
          <Subtitle>
            Powerful document processing solution powered by cutting-edge OCR
            technology
          </Subtitle>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <LoginButton
              as={Link}
              to={user ? "/dashboard" : "/login"}
              style={{ padding: "1rem 2rem", fontSize: "1.2rem" }}
            >
              {user ? "Go to Dashboard" : "Get Started"}
            </LoginButton>
          </motion.div>
        </HeroContent>
      </HeroSection>

      <UploadSection>
        <UploadContainer>
          <h2>Start Processing Your Documents</h2>
          <UploadArea
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              background: isDragging ? "#f0f9ff" : "transparent",
            }}
          >
            <motion.div whileHover={{ scale: 1.02 }}>
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <UploadText>
                Drag and drop your documents here or click to browse
              </UploadText>
            </motion.div>
          </UploadArea>
        </UploadContainer>
      </UploadSection>

      <Footer>
        <FooterContent>
          <FooterColumn>
            <FooterTitle>Company</FooterTitle>
            <FooterLink href="#about">About Us</FooterLink>
            <FooterLink href="#careers">Careers</FooterLink>
            <FooterLink href="#contact">Contact</FooterLink>
          </FooterColumn>
          <FooterColumn>
            <FooterTitle>Product</FooterTitle>
            <FooterLink href="#features">Features</FooterLink>
            <FooterLink href="#pricing">Pricing</FooterLink>
            <FooterLink href="#security">Security</FooterLink>
          </FooterColumn>
          <FooterColumn>
            <FooterTitle>Resources</FooterTitle>
            <FooterLink href="#docs">Documentation</FooterLink>
            <FooterLink href="#api">API Reference</FooterLink>
            <FooterLink href="#support">Support</FooterLink>
          </FooterColumn>
          <FooterColumn>
            <FooterTitle>Legal</FooterTitle>
            <FooterLink href="#privacy">Privacy Policy</FooterLink>
            <FooterLink href="#terms">Terms of Service</FooterLink>
            <FooterLink href="#security">Security</FooterLink>
          </FooterColumn>
        </FooterContent>
      </Footer>
    </Container>
  );
};

export default LandingPage;
