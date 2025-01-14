"use client"

import { createContext, useState, useContext, ReactNode } from "react";

interface ApprovalContextType {
  isApproved: boolean;
  setIsApproved: (status: boolean) => void;
}

const ApprovalContext = createContext<ApprovalContextType | undefined>(undefined);

export const ApprovalProvider = ({ children }: { children: ReactNode }) => {
  const [isApproved, setIsApproved] = useState(false);

  return (
    <ApprovalContext.Provider value={{ isApproved, setIsApproved }}>
      {children}
    </ApprovalContext.Provider>
  );
};

export const useApproval = () => {
  const context = useContext(ApprovalContext);
  if (!context) {
    throw new Error("useApproval must be used within an ApprovalProvider");
  }
  return context;
};
