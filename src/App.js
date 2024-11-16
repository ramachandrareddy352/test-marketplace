import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import React from "react";
import { Spinner } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";

// components pages
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import CreateNFT from "./components/CreateNFT";
import MyNFTs from "./components/MyNFTs";
import Footer from "./components/Footer";
import NFTData from "./components/NFTData";

// contract data
import contractAbi from "./contract_data/contractAbi";

const ethers = require("ethers");

function App() {
  const contractAddress = "0x816991406b49B5cB0292ee8917753816e8eE1aab";
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(0);
  const [marketplace, setMarketplace] = useState({});

  const web3Handler = async () => {
    if (typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner(); // Set signer

        // Get the network details
        const network = await provider.getNetwork();
        setNetwork(network.chainId);

        setAccount(accounts[0]);
        loadContracts(signer);

        toast.success(`Metamask connected successfully`, {
          position: "top-center",
          duration: 4000,
        });
      } catch (e) {
        toast.error(`${e.message}`, {
          position: "top-center",
          duration: 4000,
        });
      }
    } else {
      toast.error(`Please install Metamask`, {
        position: "top-center",
        duration: 4000,
      });
    }
  };

  const loadContracts = async (signer) => {
    const nftmarketplace = new ethers.Contract(
      contractAddress,
      contractAbi.contractAbi,
      signer
    );
    setMarketplace(nftmarketplace);
    setLoading(false);
  };

  const disconnectWallet = async () => {
    setLoading(true);
    setAccount(null);
    toast.success(`Metamask disconnected successfully`, {
      position: "top-center",
      duration: 4000,
    });
  };

  useEffect(() => {
    // Effect logic here
    return () => {
      window.ethereum.on("accountsChanged", async function (accounts) {
        if (accounts.length === 0) {
          setAccount(null);
          setLoading(true);
          toast.success(`Metamask disconnected successfully`, {
            position: "top-center",
            duration: 4000,
          });
        } else {
          setLoading(false);
          setAccount(accounts[0]);
          toast.success(`Account changed`, {
            position: "top-center",
            duration: 4000,
          });
        }
      });
      window.ethereum.on("chainChanged", async function (chainId) {
        if (parseInt(chainId, 16) === 11155111) {
          setLoading(false);
          setNetwork(parseInt(chainId, 16));
        } else {
          setNetwork(parseInt(chainId, 16));
          setLoading(true);
          toast.error(`Change chainId to Sepolia`, {
            position: "top-center",
            duration: 4000,
          });
        }
      });
    };
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
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
        <div className="AppPage">
          <Navbar
            web3Handler={web3Handler}
            disconnectWallet={disconnectWallet}
            account={account}
          />
        </div>
        <div style={{ minHeight: "500px" }}>
          {loading || account === null ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "80vh",
              }}
            >
              <Spinner animation="border" style={{ display: "flex" }} />
              <p className="mx-3 my-0">Awaiting For Metamask Connection...</p>
            </div>
          ) : (
            <div className="container">
              <Routes>
                <Route
                  path="/"
                  element={
                    <Home
                      network={network}
                      account={account}
                      marketplace={marketplace}
                    />
                  }
                />
                <Route
                  path="/create"
                  element={
                    <CreateNFT
                      network={network}
                      account={account}
                      marketplace={marketplace}
                    />
                  }
                />
                <Route
                  path="/my-nfts"
                  element={
                    <MyNFTs
                      network={network}
                      account={account}
                      marketplace={marketplace}
                    />
                  }
                />

                <Route
                  path="/nft/:id"
                  element={<NFTData marketplace={marketplace} />}
                />
              </Routes>
            </div>
          )}
        </div>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
