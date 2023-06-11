"use client";
import { useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import ConnectWallet from "./components/ConnectWallet";
import { ContractInteraction } from "./components/ContractInteraction";

const Home: NextPage = () => {
  const [accountId, setAccountId] = useState("");
  const [contractName, setContractName] = useState("GumiSpacecraft");
  
  // Function to handle connection of wallet
  const handleAccountConnect = (connectedAccount: string) => {
    setAccountId(connectedAccount);
    localStorage.setItem("accountId", connectedAccount);
    console.log("Connected Account:", connectedAccount);
  };

  // Effect hook to load account id from localStorage and check if account is connected
  useEffect(() => {
    const storedAccountId = localStorage.getItem("accountId");
    if (storedAccountId && window.ethereum && window.ethereum.selectedAddress === storedAccountId) {
      setAccountId(storedAccountId);
    } else {
      // If the stored account is not connected, set accountId to null and remove from localStorage
      setAccountId(null);
      localStorage.removeItem("accountId");
    }
  }, []);

  return (
    <div className="flex flex-col">
      <header className=" bg-gray-100 py-4 px-8 flex justify-between items-center">
        <h1 className="text-2xl text-black font-bold text">
          Contract: {contractName}
        </h1>
        <ConnectWallet
          connection={accountId}
          onAccountConnect={handleAccountConnect}
        />
      </header>
      
      <div className="w-full flex-grow overflow-auto">
        <ContractInteraction account={accountId} contractName={contractName} />
      </div>
    </div>
  );
};

export default Home;
