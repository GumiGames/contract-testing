import { useState, useEffect } from "react";
import Web3 from "web3";
import { fetchContractArtifact } from "../data/ContractArtifact";

type FunctionResult = string | number | { [key: string]: any };

interface AbiItem {
  type: string;
  name: string;
  inputs: Array<{ name: string; type: string; internalType: string }>;
  stateMutability?: string;
  outputs?: Array<{ name: string; type: string; internalType: string }>;
  anonymous?: boolean;
}

interface NftComponentProps {
  contractName: string;
  account: string;
}

export const ContractInteraction: React.FC<NftComponentProps> = ({
  account,
  contractName,
}) => {
  const [address, setAddress] = useState<string>("0x0");
  const [artifact, setArtifact] = useState<any>();
  const [events, setEvents] = useState<AbiItem[]>([]);
  const [functions, setFunctions] = useState<AbiItem[]>([]);
  const [eventLogs, setEventLogs] = useState<FunctionResult[]>([]);
  const [paramValues, setParamValues] = useState({});
  const [subscriptions, setSubscriptions] = useState({});

  const web3 = new Web3((window as any).ethereum);

  // Load ABI on component mount
  useEffect(() => {
    fetchContractDetails();
    const savedParamValues = localStorage.getItem('paramValues');
    if (savedParamValues) {
      setParamValues(JSON.parse(savedParamValues));
    }
  }, []);

  function web3Contract() {
    const contract = new web3.eth.Contract(artifact.abi, address);
    return contract;
  }

  const handleEventSubscription = (eventName: string) => {
    const contract = web3Contract();
    const subscription = contract.events[eventName]()
      .on("data", (event: any) => {
        console.log(event); // log the event data
        setEventLogs((prevEventLogs) => [...prevEventLogs, event]);
      })
      .on("error", (error: any, receipt: any) => {
        console.log(error, receipt); // log the error and receipt
        setEventLogs((prevEventLogs) => [...prevEventLogs, error, receipt])
      });
    setSubscriptions((prevSubscriptions) => ({
      ...prevSubscriptions,
      [eventName]: subscription,
    }));
    setEventLogs((prevEventLogs) => [
      ...prevEventLogs,
      `subscribed to ${eventName}`,
    ]);
  };

  const unsubscribeEvent = (eventName: string) => {
    if (subscriptions[eventName]) {
      subscriptions[eventName].unsubscribe((error: any, success: boolean) => {
        if (success) {
          setEventLogs((prevEventLogs) => [
            ...prevEventLogs,
            `Unsubscribed from ${eventName}`,
          ]);
        }
      });
      setSubscriptions((prevSubscriptions) => {
        const newSubscriptions = { ...prevSubscriptions };
        delete newSubscriptions[eventName];
        return newSubscriptions;
      });
    }
  };

  const convertParameters = (params: any, func: AbiItem): any[] => {
    const convertParameter = (param: string, type: string): any => {
      if (type === "address" || type === "string") {
        return param;
      } else if (type === "uint256") {
        return web3.utils.toBN(param);
      } else if (type.endsWith("[]")) {
        const elementType = type.slice(0, -2);
        return param
          .split(",")
          .map((item: string) => convertParameter(item.trim(), elementType));
      } else {
        throw new Error(`Unsupported parameter type: ${type}`);
      }
    };

    return func.inputs.map((input) => {
      const param = params[input.name];
      return convertParameter(param, input.type);
    });
  };

  const handleInputChange = (
    funcName: string | number,
    paramName: any,
    event: { target: { value: any } }
  ) => {
    const updatedParamValues = {
      ...paramValues,
      [funcName]: {
        ...paramValues[funcName],
        [paramName]: event.target.value,
      },
    };
  
    setParamValues(updatedParamValues);
    localStorage.setItem('paramValues', JSON.stringify(updatedParamValues));
  };

  const handleFunctionCall = async (funcName: string) => {
    const params = paramValues[funcName];
    await invokeContractFunction(funcName, params);
  };

  async function invokeContractFunction(
    functionName: string,
    params: any
  ): Promise<void> {
    const contract = web3Contract();
    const functionAbi = functions.find((func) => func.name === functionName);
    if (!functionAbi) {
      throw new Error(`Function ${functionName} not found in ABI`);
    }
    //log whats being call and with what
    console.log(functionName, params);

    const convertedParams = convertParameters(params, functionAbi);

    const method = contract.methods[functionName](...convertedParams);
    const accounts = await web3.eth.getAccounts();

    // If the function is view or pure, use the call method
    if (
      functionAbi.stateMutability === "view" ||
      functionAbi.stateMutability === "pure"
    ) {
      const result = await method.call({ from: accounts[0] });
      setEventLogs((prevEventLogs) => [
        ...prevEventLogs,
        `${functionName} Result: ${result}`,
      ]);
    } else {
      // For non-view or non-pure functions, use the send method
      const gasEstimate = await method.estimateGas({ from: accounts[0] });

      // Send the transaction
      const receipt = await method.send({
        from: accounts[0],
        gas: gasEstimate,
      });
      // setEventLogs((prevEventLogs) => [...prevEventLogs, receipt.events]);
      console.log(receipt);
      setEventLogs((prevEventLogs) => [...prevEventLogs, receipt]);
    }
  }
  
  const fetchContractDetails = async () => {
    const contract = await fetchContractArtifact(contractName);
    setArtifact(contract.artifact);
    setAddress(contract.address);

    const contractAbi: AbiItem[] = contract.artifact.abi;
    if (!contract.artifact.abi) return;

    const parsedEvents = contractAbi
      .filter((item) => item.type === "event")
      .sort((a, b) => a.name.localeCompare(b.name));

    const parsedFunctions = contractAbi
      .filter((item) => item.type === "function")
      .sort((a, b) => a.name.localeCompare(b.name));

    setEvents(parsedEvents);
    setFunctions(parsedFunctions);
  };

  return (
    <div className="flex flex-row max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-x-4 p-4">
      <div className="w-1/2 pr-4 space-y-6">
        <h2 className="text-2xl font-bold text-white-900">Contract Events:</h2>
        <ul className="mt-4 space-y-4">
          {events.map((event, index) => (
            <li
              key={index}
              className="flex justify-between items-center p-4 border rounded-md shadow-sm"
            >
              <span className="text-lg text-white-700">{event.name}</span>
              <button
                onClick={() =>
                  subscriptions[event.name]
                    ? unsubscribeEvent(event.name)
                    : handleEventSubscription(event.name)
                }
                className={
                  subscriptions[event.name]
                    ? "bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    : "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                }
              >
                {subscriptions[event.name] ? "Unsubscribe" : "Subscribe"}
              </button>
            </li>
          ))}
        </ul>
        <h2 className="text-2xl font-bold text-white-900 mt-8">
          Contract Functions:
        </h2>
        <div className="space-y-4">
          {functions.map((func, index) => (
            <details key={index} className="mt-4">
              <summary className="cursor-pointer bg-gray-100 hover:bg-gray-200 p-4 border rounded-md shadow-sm flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">
                  {func.name}
                </span>
                <span className="text-blue-500 hover:text-blue-700">debug</span>
              </summary>
              <div className="p-4 border-t border-gray-200 space-y-2">
                {func.inputs.map((input, inputIndex) => (
                  <div key={inputIndex} className="mt-2">
                    <label className="text-gray-700">
                      {input.name} ({input.type}):
                    </label>
                    <input
                      type="text"
                      className="border p-2 ml-2 w-full mt-1 rounded-md text-gray-700"
                      value={paramValues[func.name]?.[input.name] || ""}
                      onChange={(e) =>
                        handleInputChange(func.name, input.name, e)
                      }
                    />
                  </div>
                ))}
                <div className="flex justify-end items-center">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
                    onClick={() => handleFunctionCall(func.name)}
                  >
                    Call Function
                  </button>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
      <div className="w-1/2 pl-4 space-y-6 bg-gray-600 text-white rounded border-2 border-gray-800 overflow-auto">
        <h2 className="text-2xl font-bold text-green-400">Event Logs:</h2>
        {eventLogs.map((log, index) => (
          <pre key={index} className="font-mono text-white mt-4">
            {JSON.stringify(log, null, 2)}
          </pre>
        ))}
        <div className="text-green-400 font-mono">&gt;_</div>
      </div>
    </div>
  );
};
