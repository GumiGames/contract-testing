import axios from 'axios';

interface Contract {
  id: number;
  name: string;
  address: string;
  artifact: any;
}

export async function fetchContractArtifact(contractName: string): Promise<Contract> {
  try {
    const response = await axios.get<Contract>(`http://localhost:8000/contract/${contractName}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}