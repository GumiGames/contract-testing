import { useEffect, useState } from "react";
import Web3 from "web3";
import { fetchContractArtifact } from "../data/ContractArtifact";

interface Nft {
  id: number;
  url: string;
}

interface SpacecraftComponentProps {
  account: string;
}

const GumiSpacecraft: React.FC<SpacecraftComponentProps> = ({ account }) => {
  const [nfts, setNfts] = useState<Nft[]>([]);

  useEffect(() => {
    fetchNfts();
  }, [account]);

  const fetchNfts = async () => {
    try {
      const contract = await fetchContractArtifact("GumiSpacecraft");
      
      const contractAddress = contract.address;
      // problem: contract.artifact is a object, not an string
      const contractABI = contract.artifact.abi;
      if (!account || !contractAddress || !contractABI) return;
      const web3 = new Web3((window as any).ethereum);
      const contractInstance = new web3.eth.Contract(contractABI, contractAddress);
      
      const balance = await contractInstance.methods.balanceOf(account).call();
      const nfts: Nft[] = [];

      for (let i = 0; i < balance; i++) {
        const tokenId = await contractInstance.methods.tokenOfOwnerByIndex(account, i).call();
        const tokenURI = await contractInstance.methods.tokenURI(tokenId).call();
        nfts.push({ id: tokenId, url: tokenURI });
      }
      
      setNfts(nfts);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Connected Account: {account}</h2>
      <h3>Owned NFTs:</h3>
      <ul>
        {nfts.map((nft) => (
          <li key={nft.id}>
            NFT ID: {nft.id} | URL: {nft.url}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GumiSpacecraft;
