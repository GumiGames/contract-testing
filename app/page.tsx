'use client';
import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import ConnectWallet from './components/ConnectWallet';
import { ContractInteraction } from './components/ContractInteraction';

const Home: NextPage = () => {
  const [accountId, setAccountId] = useState('');
  const [contractName, setContractName] = useState('GumiSpacecraft');
  // Function to handle connection of wallet
  const handleAccountConnect = (connectedAccount: string) => {
    setAccountId(connectedAccount);
    // Store the connected account id to localStorage
    localStorage.setItem('accountId', connectedAccount);
    console.log('Connected Account:', connectedAccount);
  };

  // Effect hook to load account id from localStorage on component mount
  useEffect(() => {
    const storedAccountId = localStorage.getItem('accountId');
    if (storedAccountId) {
      setAccountId(storedAccountId);
    }
  }, []);

  return (
    <div className=" flex-col justify-start min-h-screen py-2">
      <Head>
        <title>{contractName}</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="w-full bg-gray-100 py-4 px-8 flex justify-between items-center">
        <h1 className="text-2xl text-black font-bold text">Contract: {contractName}</h1>
        <ConnectWallet connection={accountId} onAccountConnect={handleAccountConnect} />
      </header>

      <ContractInteraction account={accountId} contractName={contractName} />
    </div>
  );
}

export default Home;