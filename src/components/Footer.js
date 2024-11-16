import React from "react";
import { Container, Row, Col, Nav } from "react-bootstrap";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-secondary text-light py-4">
      <Container>
        <Row className="justify-content-center">
          <Col md={4} className="mx-5">
            <Nav className="social-icons mx-5">
              <Nav.Link
                as={Link}
                to="/"
                target="_blank"
                className="text-light me-3"
              >
                <FaFacebook size={24} />
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/"
                target="_blank"
                className="text-light me-3"
              >
                <FaTwitter size={24} />
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/"
                target="_blank"
                className="text-light me-3"
              >
                <FaLinkedin size={24} />
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/"
                target="_blank"
                className="text-light me-3"
              >
                <FaInstagram size={24} />
              </Nav.Link>
            </Nav>
          </Col>
        </Row>

        <Row className="my-2 justify-content-center">
          <Col className="text-center">
            <p className="mb-0">
              &copy; {new Date().getFullYear()} This is my testing NFT
              Marketplace.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
