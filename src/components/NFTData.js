import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Spinner, Card, Container, Row, Col } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
const ethers = require("ethers");

const NFTData = ({ marketplace }) => {
  const params = useParams();
  console.log(params.id);

  const [item, setItem] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      setItem(null);
      try {
        const itemCount = await marketplace._tokenIds();

        if (params.id <= itemCount && params.id > 0) {
          const item = await marketplace.idToMarketItem(params.id);
          const uri = await marketplace.tokenURI(item.tokenId);
          const response = await fetch(uri);
          const metadata = await response.json();

          const marketItem = {
            price: item.price ? item.price.toString() : "0",
            itemId: item.tokenId ? item.tokenId.toString() : "0",
            name: metadata.Name,
            description: metadata.Description,
            image: metadata.Image,
            likes: item.likes ? item.likes.toString() : "0",
            seller: item.seller,
            owner: item.owner,
            isSolded: item.sold,
          };
          console.log(marketItem);

          setItem(marketItem);
        } else {
          toast.error(`Invalid tokenID #${params.id}`, {
            position: "top-center",
            duration: 4000,
          });
        }
      } catch (error) {
        toast.error("Unable to load NFT data", {
          position: "top-center",
          duration: 4000,
        });
      }
    };
    fetchItem();
  }, [params]);
  return (
    <div>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Define default options
          className: "",
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },

          // Default options for specific types
          success: {
            duration: 4000,
            theme: {
              primary: "green",
              secondary: "black",
            },
          },
        }}
      />
      {item !== null ? (
        <div>
          <div>
            <Container className="my-5">
              <Row className="align-items-center">
                {/* Left Side: Image */}
                <Col md={6}>
                  <Card>
                    <Card.Img
                      variant="top"
                      src={item.image || "https://via.placeholder.com/500"}
                      alt={item.name || "NFT Image"}
                      style={{
                        maxHeight: "600px",
                        objectFit: "cover",
                      }}
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
                    <strong>Price:</strong>{" "}
                    {ethers.utils.formatEther(item.price)} ETH
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
                    {item.isSolded ? (
                      <span>Solded</span>
                    ) : (
                      <span>Unsolded</span>
                    )}
                  </p>
                </Col>
              </Row>
            </Container>
          </div>
        </div>
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
          <span>
            Fetching Data
            <Spinner animation="border" />
          </span>
        </div>
      )}
    </div>
  );
};

export default NFTData;
