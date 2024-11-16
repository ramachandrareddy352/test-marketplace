import React from "react";
import { useState, useEffect } from "react";
import { Row, Col, Card, Spinner } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import { FcLike } from "react-icons/fc";
import { FaRegHeart } from "react-icons/fa";

const ethers = require("ethers");

const Home = ({ network, account, marketplace }) => {
  const [soldedItems, setSoldedItems] = useState([]);
  const [unSoldedItems, setUnSoldedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMarketplaceItems = async () => {
    let soldeditems = [];
    let unsoldeditems = [];
    setLoading(true);
    const itemCount = await marketplace._tokenIds();
    console.log(itemCount);

    for (let i = 1; i <= itemCount; i++) {
      const item = await marketplace.idToMarketItem(i);
      const uri = await marketplace.tokenURI(item.tokenId);
      const response = await fetch(uri);
      const metadata = await response.json();
      const userLiked = await marketplace.tokenLikes(item.tokenId, account);

      const marketItem = {
        price: item.price ? item.price.toString() : "0",
        itemId: item.tokenId ? item.tokenId.toString() : "0",
        name: metadata.Name,
        description: metadata.Description,
        image: metadata.Image,
        likes: item.likes ? item.likes.toString() : "0",
        seller: item.seller,
        owner: item.owner,
        userLiked: userLiked,
      };

      if (item.sold) {
        soldeditems.push(marketItem);
      } else {
        unsoldeditems.push(marketItem);
      }

      setUnSoldedItems(unsoldeditems);
      setSoldedItems(soldeditems);
      setLoading(false);
    }
  };

  //buy nft
  const buyMarketItem = async (item) => {
    if (network === 11155111) {
      try {
        console.log(item.price);
        await (
          await marketplace.createMarketSale(item.itemId, {
            value: item.price,
          })
        ).wait();
        await loadMarketplaceItems();
        toast.success(`Bought NFT successfully`, {
          position: "top-center",
          duration: 4000,
        });
      } catch {
        toast.error(`Transaction was rejected`, {
          position: "top-center",
          duration: 4000,
        });
      }
    } else {
      toast.error(`Please change the network to sepolia`, {
        position: "top-center",
        duration: 4000,
      });
    }
  };

  // like the NFT
  const likeTheNFT = async (item) => {
    if (network === 11155111) {
      try {
        const like = await marketplace.tokenLikes(item.itemId, account);
        if (like === false) {
          await (await marketplace.likeNFT(item.itemId)).wait();
          await loadMarketplaceItems();
          toast.success(`You liked the NFT #${item.itemId}`, {
            position: "top-center",
            duration: 4000,
          });
        } else {
          toast.error(`You have already like the NFT`, {
            position: "top-center",
            duration: 4000,
          });
        }
      } catch {
        toast.error(`Transaction was rejected`, {
          position: "top-center",
          duration: 4000,
        });
      }
    } else {
      toast.error(`Please change the network to sepolia`, {
        position: "top-center",
        duration: 4000,
      });
    }
  };

  useEffect(() => {
    async function fetchData() {
      await loadMarketplaceItems();
    }
    fetchData();
  }, [network, account]);

  return (
    <div className="container">
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
      <div className="flex justify-center">
        <div className=" my-5 container">
          <h2>UnSolded Items</h2>
          {!loading ? (
            <div>
              {unSoldedItems.length > 0 ? (
                <Row xs={1} md={2} lg={4} className="g-4">
                  {unSoldedItems.map((item, idx) => (
                    <Col key={idx} className="overflow-hidden">
                      <Card
                        style={{
                          boxShadow: "15px 15px 6px silver",
                          border: "1px dashed black",
                          borderRadius: "10px",
                        }}
                      >
                        <Card.Img variant="top" src={item.image} height={200} />
                        <Card.Body color="secondary">
                          <div className="d-flex justify-content-between align-items-center">
                            <Card.Title>{item.name}</Card.Title>
                            <h4>#{item.itemId}</h4>
                          </div>
                          <Card.Text
                            style={{ height: "50px", overflow: "hidden" }}
                          >
                            {item.description}
                          </Card.Text>
                        </Card.Body>
                        <Card.Footer>
                          <div className="my-2 d-flex">
                            <button
                              className="btn btn-primary mx-2 "
                              style={{ width: "10.5rem" }}
                              onClick={() => buyMarketItem(item)}
                            >
                              Buy{" "}
                              <b>{ethers.utils.formatEther(item.price)} ETH</b>
                            </button>
                            <button
                              className="btn d-flex flex-column align-items-center p-2"
                              style={{
                                gap: "0", // No gap between elements
                                width: "4rem",
                              }}
                              onClick={() => likeTheNFT(item)}
                            >
                              {item.userLiked ? (
                                <FcLike size={24} />
                              ) : (
                                <FaRegHeart />
                              )}
                              <span>{item.likes}</span>
                            </button>
                          </div>
                        </Card.Footer>
                      </Card>
                      <br />
                    </Col>
                  ))}
                </Row>
              ) : (
                <div
                  className="overflow-hidden"
                  style={{
                    width: "18rem",
                    height: "22rem",
                    boxShadow: "15px 15px 6px silver",
                    border: "1px dashed black",
                    borderRadius: "10px",
                  }}
                >
                  <h3 style={{ textAlign: "center", marginTop: "150px" }}>
                    NULL
                  </h3>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                width: "18rem",
                height: "22rem",
                boxShadow: "15px 15px 6px silver",
                border: "1px dashed black",
                borderRadius: "10px",
              }}
            >
              <div style={{ marginTop: "45%" }}>
                <Spinner animation="border" />
                <p className="mx-3 my-0">Loading Data...</p>
              </div>
            </div>
          )}
        </div>

        <div className=" my-5 container">
          <h2>Solded Items</h2>
          {!loading ? (
            <div>
              {soldedItems.length > 0 ? (
                <Row xs={1} md={2} lg={4} className="g-4">
                  {soldedItems.map((item, idx) => (
                    <Col key={idx} className="overflow-hidden">
                      <Card
                        style={{
                          boxShadow: "15px 15px 6px silver",
                          border: "1px dashed black",
                          borderRadius: "10px",
                        }}
                      >
                        <Card.Img variant="top" src={item.image} height={200} />
                        <Card.Body color="secondary">
                          <Card.Title>{item.name}</Card.Title>
                          <Card.Text
                            style={{ height: "50px", overflow: "hidden" }}
                          >
                            {item.description}
                          </Card.Text>
                        </Card.Body>
                        <Card.Footer>
                          <div className="my-2 d-flex">
                            <p
                              className="my-4 mx-2 "
                              style={{ width: "10.5rem" }}
                            >
                              Solded at{" "}
                              <b>{ethers.utils.formatEther(item.price)} ETH</b>
                            </p>
                            <button
                              className="btn d-flex flex-column align-items-center p-2"
                              style={{
                                gap: "0", // No gap between elements
                                width: "4rem",
                              }}
                              onClick={() => likeTheNFT(item)}
                            >
                              {item.userLiked ? (
                                <FcLike size={24} />
                              ) : (
                                <FaRegHeart />
                              )}
                              <span>{item.likes}</span>
                            </button>
                          </div>
                        </Card.Footer>
                      </Card>
                      <br />
                    </Col>
                  ))}
                </Row>
              ) : (
                <div
                  className="overflow-hidden"
                  style={{
                    width: "18rem",
                    height: "22rem",
                    boxShadow: "15px 15px 6px silver",
                    border: "1px dashed black",
                    borderRadius: "10px",
                  }}
                >
                  <h3 style={{ textAlign: "center", marginTop: "150px" }}>
                    NULL
                  </h3>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                width: "18rem",
                height: "22rem",
                boxShadow: "15px 15px 6px silver",
                border: "1px dashed black",
                borderRadius: "10px",
              }}
            >
              <div style={{ marginTop: "45%" }}>
                <Spinner animation="border" />
                <p className="mx-3 my-0">Loading Data...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Home;
