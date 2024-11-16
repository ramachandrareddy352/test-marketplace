import React, { useState, useRef } from "react";
import { Row, Form, Spinner } from "react-bootstrap";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { Buffer } from "buffer";
import toast, { Toaster } from "react-hot-toast";
import { FaCloudUploadAlt } from "react-icons/fa";
import { FcLike } from "react-icons/fc";

const ethers = require("ethers");

const projectId = "2N7yp4DUu80pxg5dnzC9t0Pj9dM";
const projectSecret = "38a1af53c42ef43d40476b8f5083db44";
const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
const client = ipfsHttpClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

const CreateNFT = ({ network, account, marketplace }) => {
  const [price, setPrice] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);

  const [uploadedImage, setUploadedImage] = useState(null); // State to store the uploaded image
  const fileInputRef = useRef(null);

  // Handle file input click
  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file upload and set preview
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    console.log(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result); // Update state with the uploaded image
      };
      reader.readAsDataURL(file); // Convert file to base64
      setFile(file);
    }
  };

  const preview = () => {
    if (
      uploadedImage === null ||
      name === "" ||
      description === "" ||
      price === null ||
      name.length > 20
    ) {
      toast.error("Please fill in required format!", {
        position: "top-center",
        duration: 4000,
      });
    } else {
      document.getElementById("previewButton").click();
    }
  };

  const uploadToIPFS = async () => {
    setLoading(true);
    if (typeof file !== "undefined") {
      try {
        const result = await client.add(file);
        console.log(result);
        setImage(`https://ipfs.io/ipfs/${result.path}`);
        console.log(image);
      } catch (error) {
        setLoading(false);
        console.log("ipfs image upload error: ", error);
        toast.error(`Unable to upload image to IPFS!`, {
          position: "top-center",
          duration: 4000,
        });
      }
    }
  };

  const createNFT = async () => {
    if (network !== 11155111) {
      toast.error("Please change the network to sepolia", {
        position: "top-center",
        duration: 4000,
      });
      return;
    } else {
      try {
        await uploadToIPFS(file);

        if (image === null) {
          toast.error(`Retry minting NFT`, {
            position: "top-center",
            duration: 4000,
          });
          return;
        }
        const result = await client.add(
          JSON.stringify({
            Name: name,
            Description: description,
            Image: image,
            developer: "https://ramachandrareddy.netlify.app/",
          })
        );
        await mintThenList(result);
        document.getElementById("closePreview").click();
      } catch (error) {
        setLoading(false);
        toast.error(`Creating NFT failed`, {
          position: "top-center",
          duration: 4000,
        });
      }
    }
  };

  const mintThenList = async (result) => {
    const uri = `https://ipfs.io/ipfs/${result.path}`;
    console.log(uri);
    // mint nft
    try {
      const isApproved = await marketplace.isApprovedForAll(
        account,
        marketplace.address
      );
      console.log(isApproved);
      if (isApproved === false) {
        await (
          await marketplace.setApprovalForAll(marketplace.address, true)
        ).wait();
      }

      const listingPrice = ethers.utils.parseEther(price.toString());
      await (
        await marketplace.mintToken(uri, listingPrice, {
          value: ethers.utils.parseEther("0.0025"), // Specify the amount of Ether to send
        })
      ).wait();
      toast.success(`NFT is successfully minted`, {
        position: "top-center",
        duration: 4000,
      });
    } catch (error) {
      console.log(error);
      toast.error("Transction was rejected!", {
        position: "top-center",
        duration: 4000,
      });
    }
    setDescription(null);
    setImage(null);
    setName(null);
    setUploadedImage(null);
    setPrice(null);
    setLoading(false);
    setFile(null);
  };

  return (
    <div className="container-fluid">
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

      <div className="row">
        <main
          role="main"
          className="col-lg-6 mx-auto"
          style={{ maxWidth: "800px" }}
        >
          <div className="content mx-auto my-5">
            <Row className="g-4 justify-content-center">
              {uploadedImage ? (
                // Display the uploaded image
                <div
                  style={{
                    width: "20rem",
                    height: "22rem",
                    position: "relative",
                    cursor: "pointer",
                  }}
                  onClick={handleFileSelect}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    required
                    name="file"
                    accept=".png, .jpg, .jpeg"
                    style={{
                      display: "none", // Hidden input
                    }}
                    onChange={handleFileChange} // Handle file upload
                  />
                  <img
                    src={uploadedImage}
                    alt="Uploaded Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "10px",
                      border: "2px dashed #6c757d",
                    }}
                  />
                </div>
              ) : (
                // Display the file upload form
                <Form.Group
                  controlId="formFile"
                  className="d-flex flex-column align-items-center p-4 bg-light"
                  style={{
                    width: "20rem",
                    height: "22rem",
                    justifyContent: "center",
                    borderRadius: "10px",
                    border: "2px dashed #6c757d",
                    backgroundColor: "#f8f9fa",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                  onClick={handleFileSelect} // Trigger file input when form is clicked
                >
                  <FaCloudUploadAlt
                    size={50}
                    color="#6c757d"
                    className="mb-3"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    required
                    name="file"
                    accept=".png, .jpg, .jpeg"
                    style={{
                      display: "none", // Hidden input
                    }}
                    onChange={handleFileChange} // Handle file upload
                  />
                  <div className="text-muted">
                    Drag & Drop your image here <br /> or <br />{" "}
                    <strong>Click to Browse</strong>
                  </div>
                </Form.Group>
              )}

              <p className="text-center">
                Listing Price : <strong>0.0025 ETH</strong>
              </p>

              <Form.Control
                onChange={(e) => setName(e.target.value)}
                size="lg"
                required
                type="text"
                placeholder="Name"
              />
              <Form.Control
                onChange={(e) => setDescription(e.target.value)}
                size="lg"
                required
                as="textarea"
                placeholder="Description"
              />
              <Form.Control
                onChange={(e) => setPrice(e.target.value)}
                size="lg"
                required
                type="number"
                placeholder="Price in ETH"
              />
              <div className="d-grid px-0">
                <button
                  type="button"
                  className="btn btn-primary"
                  size="lg"
                  onClick={preview}
                >
                  Preview Mint
                </button>
              </div>
            </Row>
          </div>
        </main>
      </div>

      {/* Preview image */}
      <div>
        <button
          type="button"
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#staticBackdrop"
          id="previewButton"
          style={{ display: "none" }}
        >
          Launch static backdrop modal
        </button>
        <div
          className="modal fade"
          id="staticBackdrop"
          data-bs-backdrop="static"
          data-bs-keyboard="false"
          tabIndex="-1"
          aria-labelledby="staticBackdropLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered ">
            <div className="modal-content">
              <div className="modal-header justify-content-center">
                <h1 className="modal-title fs-5 r" id="staticBackdropLabel">
                  <strong>NFT Preview</strong>
                </h1>
              </div>
              <div className="modal-dialog justify-content-center">
                <div
                  className="card"
                  style={{
                    width: "18rem",
                    height: "430px",
                    borderRadius: "10px",
                    border: "2px dashed #6c757d",
                  }}
                >
                  <img
                    src={uploadedImage}
                    className="card-img-top"
                    alt="..."
                    style={{
                      width: "100%",
                      height: "250px",
                      objectFit: "cover",
                    }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{name}</h5>
                    <p
                      className="card-text"
                      style={{
                        color: "grey",
                        height: "50px",
                        overflow: "hidden",
                      }}
                    >
                      {description}
                    </p>
                    <div className="my-2 d-flex">
                      <button
                        className="btn btn-primary mx-2"
                        style={{ width: "10.5rem", height: "50px" }}
                      >
                        Buy <b>{price} ETH</b>
                      </button>
                      <button
                        className="btn d-flex flex-column align-items-center"
                        style={{
                          gap: "0", // No gap between elements
                          width: "4rem",
                          height: "80px",
                        }}
                      >
                        <FcLike size={24} />
                        <span>0</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                  id="closePreview"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={createNFT}
                  className="btn btn-primary mx-5"
                >
                  Mint NFT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNFT;
