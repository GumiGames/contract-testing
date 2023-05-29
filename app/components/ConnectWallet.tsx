'use client';

import { on } from 'events';
import { useEffect, useState } from 'react';
import Web3 from 'web3';

interface ConnectWalletProps {
  onAccountConnect: (account: string) => void;
  connection: string;
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ onAccountConnect, connection }) => {
  const [account, setAccount] = useState<string>('');
  

  useEffect(() => {
    if ((window as any).ethereum) {
      const web3 = new Web3((window as any).ethereum);
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        console.log('Account changed:', accounts[0])
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          onAccountConnect(accounts[0]); // Notify the parent about the connected account
        } else {
          setAccount('');
          onAccountConnect(''); // Notify the parent about the disconnected account
        }
      });
    } else {
      alert('Please install MetaMask to use this dApp!');
    }
  }, []);

  const connectWallet = async () => {
    if ((window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        const connectedAccount = accounts[0];

        setAccount(connectedAccount);
        onAccountConnect(connectedAccount); // Notify the parent about the connected account
      } catch (error) {
        console.error(error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  return (
    <div>
      <button onClick={connectWallet} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          {connection || account ? (connection || account).slice(0, 6) : 'Connect Wallet'}... {connection || account ? (connection || account).slice(connection.length-4, connection.length) : ''}
        </button>
    </div>
  );
};

export default ConnectWallet;
