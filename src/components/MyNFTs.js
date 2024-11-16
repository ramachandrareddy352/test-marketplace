import React, { useState, useEffect } from "react";
import { Row, Col, Card, Spinner } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import { FcLike } from "react-icons/fc";
import { FaRegHeart } from "react-icons/fa";
import { ethers } from "ethers";

const MyNFTs = ({ network, account, marketplace }) => {
  const [myItems, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user's NFTs
  const loadMyItems = async () => {
    setLoading(true);

    try {
      const items = await marketplace.fetchMyNFTs();
      const nftItems = await Promise.all(
        items.map(async (item) => {
          try {
            const uri = await marketplace.tokenURI(item.tokenId);
            const response = await fetch(uri);
            const metadata = await response.json();
            const userLiked = await marketplace.tokenLikes(
              item.tokenId,
              account
            );

            return {
              price: item.price ? item.price.toString() : "0",
              itemId: item.tokenId ? item.tokenId.toString() : "0",
              name: metadata.Name || "Unnamed NFT",
              description: metadata.Description || "No description provided",
              image: metadata.Image || "https://via.placeholder.com/200",
              likes: item.likes ? item.likes.toString() : "0",
              seller: item.seller,
              owner: item.owner,
              userLiked: userLiked,
            };
          } catch (error) {
            console.error(
              `Error fetching metadata for token ID: ${item.tokenId}`
            );
            return null;
          }
        })
      );

      setItems(nftItems.filter((nft) => nft !== null)); // Remove failed fetches
    } catch (error) {
      console.error("Error loading items:", error);
      toast.error("Failed to load your NFTs.", { duration: 4000 });
    }

    setLoading(false);
  };

  // Like an NFT
  const likeTheNFT = async (item) => {
    if (network !== 11155111) {
      toast.error("Please switch to the Sepolia network.", { duration: 4000 });
      return;
    }

    try {
      const liked = await marketplace.tokenLikes(item.itemId, account);
      if (!liked) {
        const tx = await marketplace.likeNFT(item.itemId);
        await tx.wait();
        toast.success(`You liked NFT #${item.itemId}`, { duration: 4000 });
        await loadMyItems(); // Reload items to reflect updated likes
      } else {
        toast.error("You have already liked this NFT.", { duration: 4000 });
      }
    } catch (error) {
      console.error("Error liking NFT:", error);
      toast.error("Transaction failed or was rejected.", { duration: 4000 });
    }
  };

  // Fetch data on component mount or when `network`/`account` changes
  useEffect(() => {
    loadMyItems();
  }, [network, account]);

  return (
    <div className="container">
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: "#363636", color: "#fff" },
        }}
      />
      <div className="my-5">
        <h2>Your Items</h2>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "20rem",
            }}
          >
            <Spinner animation="border" />
            <p className="mx-3">Loading your NFTs...</p>
          </div>
        ) : myItems.length > 0 ? (
          <Row xs={1} md={2} lg={4} className="g-4">
            {myItems.map((item, idx) => (
              <Col key={idx}>
                <Card
                  style={{
                    boxShadow: "15px 15px 6px silver",
                    border: "1px dashed black",
                    borderRadius: "10px",
                  }}
                >
                  <Card.Img variant="top" src={item.image} height={200} />
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <Card.Title>{item.name}</Card.Title>
                      <h4>#{item.itemId}</h4>
                    </div>
                    <Card.Text style={{ height: "50px", overflow: "hidden" }}>
                      {item.description}
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <div className="d-flex justify-content-between align-items-center">
                      <p>
                        Bought at{" "}
                        <b>{ethers.utils.formatEther(item.price)} ETH</b>
                      </p>
                      <button
                        className="btn p-2 d-flex flex-column align-items-center"
                        style={{ width: "4rem" }}
                        onClick={() => likeTheNFT(item)}
                      >
                        {item.userLiked ? <FcLike size={24} /> : <FaRegHeart />}
                        <span>{item.likes}</span>
                      </button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "20rem",
            }}
          >
            <h3>No NFTs found.</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyNFTs;
