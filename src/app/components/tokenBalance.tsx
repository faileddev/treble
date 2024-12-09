// components/TokenBalance.tsx
"use client";

import { useEffect, useState } from "react";
import { useWalletClient } from "wagmi";
import { ethers } from "ethers";

type TokenBalanceProps = {
  tokenAddress: string;
};

export default function TokenBalance({ tokenAddress }: TokenBalanceProps) {
  const { data: walletClient } = useWalletClient();
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!walletClient || !tokenAddress) return;

      try {
        const provider = new ethers.BrowserProvider(walletClient as any);
        const erc20Abi = ["function balanceOf(address owner) view returns (uint256)"];
        const erc20Contract = new ethers.Contract(tokenAddress, erc20Abi, provider);

        const address = await (await provider.getSigner()).getAddress();
        const balance = await erc20Contract.balanceOf(address);

        setBalance(ethers.formatUnits(balance, 18)); // Adjust decimals as per the token
      } catch (error) {
        console.error("Error fetching token balance:", error);
      }
    };

    fetchBalance();
  }, [walletClient, tokenAddress]);

  return (
    <div style={{display:"flex",
        flexDirection: "row",
        alignItems: "center",
      }}>
      <p style={{color: "white", fontSize: "10px"}}>V1 Balance:</p>
      <p style={{color: "white", fontSize: "10px", marginLeft: "5px"}} >{balance !== null ? `${balance} ARBINU` : "Loading..."}</p>
    </div>
  );
}
