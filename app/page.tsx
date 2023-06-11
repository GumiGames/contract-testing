"use client";
import { useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import ConnectWallet from "./components/ConnectWallet";
import {ContractInteraction} from "./components/ContractInteraction";

const Home: NextPage = () => {
  const [accountId, setAccountId] = useState(null);
  const contractName = "GumiSpacecraft";

  useEffect(() => {
    const storedAccountId = localStorage.getItem("accountId");
    if (storedAccountId && window.ethereum && window.ethereum.selectedAddress === storedAccountId) {
      setAccountId(storedAccountId);
    } else {
      setAccountId(null);
      localStorage.removeItem("accountId");
    }
  }, []);

  const handleAccountConnect = (connectedAccount) => {
    setAccountId(connectedAccount);
    localStorage.setItem("accountId", connectedAccount);
  };

  return (
    <div className="flex flex-col">
      <Head>
        <title>{contractName}</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-gray-100 py-4 px-8 flex justify-between items-center">
        <h1 className="text-2xl text-black font-bold">Contract: {contractName}</h1>
        <ConnectWallet connection={accountId} onAccountConnect={handleAccountConnect} />
      </header>
      
      <main className="w-full flex-grow overflow-auto">
        <ContractInteraction account={accountId} contractName={contractName} />
      </main>
    </div>
  );
};

export default Home;
