import { Link } from "react-router-dom";
import { Navbar, Nav, Button, Container } from "react-bootstrap";
import { TbWalletOff } from "react-icons/tb";

const Navigation = ({ web3Handler, disconnectWallet, account }) => {
  return (
    <Navbar expand="lg" bg="secondary" variant="dark">
      <Container>
        <Navbar.Brand
          href="https://ramachandrareddy.netlify.app/"
          target="_blank"
          className="mx-4"
        >
          NFT Marketplace
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto mx-5">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/create">
              Create NFT
            </Nav.Link>
            <Nav.Link as={Link} to="/my-nfts">
              My NFTs
            </Nav.Link>
          </Nav>
          <Nav>
            {account ? (
              <>
                <Nav.Link
                  href={`https://sepolia.etherscan.io/address/${account}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button nav-button btn-sm mx-4"
                >
                  <Button variant="outline-light">
                    {account.slice(0, 5) + "..." + account.slice(38, 42)}
                  </Button>
                </Nav.Link>
                <Nav.Item>
                  <Button onClick={disconnectWallet} className="mx-4 my-2">
                    <TbWalletOff />
                  </Button>
                </Nav.Item>
              </>
            ) : (
              <Button
                onClick={web3Handler}
                variant="outline-light"
                className="my-2"
              >
                Connect Wallet
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
