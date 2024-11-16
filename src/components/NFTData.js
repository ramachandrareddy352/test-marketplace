import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Spinner, Card, Container, Row, Col } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import { ethers } from "ethers";

const NFTData = ({ marketplace }) => {
  const { id } = useParams();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchNFTData = async (tokenId) => {
    try {
      const itemCount = await marketplace._tokenIds();
      if (tokenId > 0 && tokenId <= itemCount) {
        const item = await marketplace.idToMarketItem(tokenId);
        const uri = await marketplace.tokenURI(item.tokenId);
        const response = await fetch(uri);
        const metadata = await response.json();

        return {
          price: item.price ? item.price.toString() : "0",
          itemId: item.tokenId ? item.tokenId.toString() : "0",
          name: metadata.Name || "Unnamed NFT",
          description: metadata.Description || "No description available",
          image: metadata.Image || "https://via.placeholder.com/500",
          likes: item.likes ? item.likes.toString() : "0",
          seller: item.seller,
          owner: item.owner,
          isSold: item.sold,
        };
      } else {
        toast.error("Invalid tokenID", {
          position: "top-center",
          duration: 4000,
        });
      }
    } catch (error) {
      toast.error(`${error.message}`, {
        position: "top-center",
        duration: 4000,
      });
    }
  };

  useEffect(() => {
    let isMounted = true; // Prevent setting state on unmounted component
    setLoading(true);
    setItem(null);

    const loadItem = async () => {
      try {
        const marketItem = await fetchNFTData(Number(id));
        if (isMounted) {
          setItem(marketItem);
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setLoading(false);
          toast.error(error.message, {
            position: "top-center",
            duration: 4000,
          });
        }
      }
    };

    loadItem();

    return () => {
      isMounted = false; // Cleanup on unmount
    };
  }, [id, marketplace]);

  return (
    <div>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          style: { background: "#363636", color: "#fff" },
          success: {
            duration: 4000,
            theme: { primary: "green", secondary: "black" },
          },
          error: { duration: 4000 },
        }}
      />
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "80vh",
            textAlign: "center",
          }}
        >
          <span>
            Fetching Data <Spinner animation="border" />
          </span>
        </div>
      ) : item ? (
        <Container className="my-5">
          <Row className="align-items-center">
            {/* Left Side: Image */}
            <Col md={6}>
              <Card>
                <Card.Img
                  variant="top"
                  src={item.image}
                  alt={item.name}
                  style={{ maxHeight: "600px", objectFit: "cover" }}
                />
              </Card>
            </Col>

            {/* Right Side: Metadata */}
            <Col md={6}>
              <h3 className="mb-3">
                #{item.itemId} {item.name}
              </h3>
              <p className="mb-4">{item.description}</p>
              <p>
                <strong>Price:</strong> {ethers.utils.formatEther(item.price)}{" "}
                ETH
              </p>
              <p>
                <strong>Owner:</strong> <span>{item.owner}</span>
              </p>
              <p>
                <strong>Seller:</strong> <span>{item.seller}</span>
              </p>
              <p>
                <strong>Total Likes:</strong> <span>{item.likes}</span>
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span>{item.isSold ? "Sold" : "Unsold"}</span>
              </p>
            </Col>
          </Row>
        </Container>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "80vh",
            textAlign: "center",
          }}
        >
          <h3>No NFT data available</h3>
        </div>
      )}
    </div>
  );
};

export default NFTData;
