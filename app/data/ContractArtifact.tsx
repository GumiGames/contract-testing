import axios from 'axios';

interface Contract {
  // Database id
  id: number;

  // Contract info
  name: string;
  address: string;

  // Hardhat build artifact
  artifact: any;
}

const apiHost = process.env.API_URL || 'http://localhost:8000/contract';


export async function fetchContractArtifact(contractName: string): Promise<Contract> {
  try {
    const response = await axios.get<Contract>(`${apiHost}/${contractName}`);
    return response.data;
    console.error(`${apiHost}/${contractName}`);
  } catch (error) {
    console.error(error);
    throw error;
  }
}