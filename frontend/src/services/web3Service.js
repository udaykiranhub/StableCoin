// import Web3 from 'web3';
// import { CONTRACT_ADDRESS } from '../constants/contractAddress';
// import CONTRACT_ABI from "../constants/contractABI.json";

// let web3 = null;
// let contract = null;

// export const initWeb3 = async () => {
//   if (window.ethereum) {
//     try {
//       // Request account access
//       await window.ethereum.request({ method: 'eth_requestAccounts' });
//       web3 = new Web3(window.ethereum);
      
//       // Initialize contract
//       contract = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);
      
//       console.log("Web3 initialized successfully");
//       return { web3, contract };
//     } catch (error) {
//       console.error('User denied account access', error);
//       throw new Error('Please connect to MetaMask');
//     }
//   } else if (window.web3) {
//     web3 = new Web3(window.web3.currentProvider);
//     contract = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);
//     return { web3, contract };
//   } else {
//     throw new Error('Please install MetaMask');
//   }
// };

// export const getWeb3 = () => {
//   if (!web3) throw new Error('Web3 not initialized');
//   return web3;
// };

// export const getContract = () => {
//   if (!contract) throw new Error('Contract not initialized');
//   return contract;
// };

// export const getAccounts = async () => {
//   if (!web3) throw new Error('Web3 not initialized');
//   return await web3.eth.getAccounts();
// };

// export const getCurrentAccount = async () => {
//   const accounts = await getAccounts();
//   return accounts[0] || null;
// };

// export const getBalance = async (address) => {
//   const contract = getContract();
//   const balance = await contract.methods.balanceOf(address).call();
//   const decimals = await contract.methods.decimals().call();
//   return web3.utils.fromWei(balance, 'ether') * (10 ** (18 - decimals));
// };

// export const getTokenInfo = async () => {
//   const contract = getContract();
//   const [name, symbol, totalSupply, decimals] = await Promise.all([
//     contract.methods.name().call(),
//     contract.methods.symbol().call(),
//     contract.methods.totalSupply().call(),
//     contract.methods.decimals().call()
//   ]);
  
//   return { name, symbol, totalSupply, decimals };
// };

// export const checkWhitelistStatus = async (address) => {
//   const contract = getContract();
//   try {
//     const status = await contract.methods.whitelist(address).call();
//     return {
//       canMint: status.canMint,
//       canBurn: status.canBurn
//     };
//   } catch (error) {
//     console.error('Error checking whitelist:', error);
//     return { canMint: false, canBurn: false };
//   }
// };

// export const checkAdminStatus = async (address) => {
//   const contract = getContract();
//   try {
//     return await contract.methods.admins(address).call();
//   } catch (error) {
//     console.error('Error checking admin status:', error);
//     return false;
//   }
// };

// export const getNetworkInfo = async () => {
//   if (!web3) throw new Error('Web3 not initialized');
//   const networkId = await web3.eth.net.getId();
//   const networks = {
//     1: 'Ethereum Mainnet',
//     3: 'Ropsten',
//     4: 'Rinkeby',
//     5: 'Goerli',
//     42: 'Kovan',
//     137: 'Polygon',
//     80001: 'Mumbai',
//     1337: 'Localhost',
//     31337: 'Hardhat'
//   };
//   return {
//     id: networkId,
//     name: networks[networkId] || `Network ${networkId}`
//   };
// };


import Web3 from 'web3';
import { CONTRACT_ADDRESS } from '../constants/contractAddress';
import CONTRACT_ABI from "../constants/contractABI.json";

let web3 = null;
let contract = null;

export const initWeb3 = async () => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      web3 = new Web3(window.ethereum);
      
      contract = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);
      
      console.log("Web3 initialized successfully");
      return { web3, contract };
    } catch (error) {
      console.error('User denied account access', error);
      throw new Error('Please connect to MetaMask');
    }
  } else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
    contract = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);
    return { web3, contract };
  } else {
    throw new Error('Please install MetaMask');
  }
};

export const getWeb3 = () => {
  if (!web3) throw new Error('Web3 not initialized');
  return web3;
};

export const getContract = () => {
  if (!contract) throw new Error('Contract not initialized');
  return contract;
};

export const getAccounts = async () => {
  if (!web3) throw new Error('Web3 not initialized');
  return await web3.eth.getAccounts();
};

export const getCurrentAccount = async () => {
  const accounts = await getAccounts();
  return accounts[0] || null;
};

// Helper function to convert to BigInt
export const toBigInt = (value) => {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'string' || typeof value === 'number') {
    return BigInt(Math.floor(Number(value)));
  }
  return BigInt(value);
};

// Helper function to convert to Wei (considering decimals)
export const toTokenUnits = async (amount) => {
  const contract = getContract();
  const decimals = await contract.methods.decimals().call();
  return toBigInt(amount) * (10n ** BigInt(decimals));
};

// Helper function to convert from Wei
export const fromTokenUnits = async (amount) => {
  const contract = getContract();
  const decimals = await contract.methods.decimals().call();
  return Number(amount) / Number(10n ** BigInt(decimals));
};

export const getBalance = async (address) => {
  const contract = getContract();
  const balance = await contract.methods.balanceOf(address).call();
  const decimals = await contract.methods.decimals().call();
  const divisor = 10n ** BigInt(decimals);
  return Number(BigInt(balance) / divisor);
};

export const getTokenInfo = async () => {
  const contract = getContract();
  const [name, symbol, totalSupply, decimals] = await Promise.all([
    contract.methods.name().call(),
    contract.methods.symbol().call(),
    contract.methods.totalSupply().call(),
    contract.methods.decimals().call()
  ]);
  
  return { name, symbol, totalSupply, decimals };
};

export const checkWhitelistStatus = async (address) => {
  const contract = getContract();
  try {
    const status = await contract.methods.whitelist(address).call();
    return {
      canMint: status.canMint,
      canBurn: status.canBurn
    };
  } catch (error) {
    console.error('Error checking whitelist:', error);
    return { canMint: false, canBurn: false };
  }
};

export const checkAdminStatus = async (address) => {
  const contract = getContract();
  try {
    return await contract.methods.admins(address).call();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export const getNetworkInfo = async () => {
  if (!web3) throw new Error('Web3 not initialized');
  const networkId = await web3.eth.net.getId();
  const networks = {
    1: 'Ethereum Mainnet',
    3: 'Ropsten',
    4: 'Rinkeby',
    5: 'Goerli',
    42: 'Kovan',
    137: 'Polygon',
    80001: 'Mumbai',
    1337: 'Localhost',
    31337: 'Hardhat'
  };
  return {
    id: networkId,
    name: networks[networkId] || `Network ${networkId}`
  };
};

// Helper for minting
export const mintTokens = async (to, amount, paymentId) => {
  const contract = getContract();
  const account = await getCurrentAccount();
  const amountInUnits = await toTokenUnits(amount);
  
  return await contract.methods.mintTokens(
    to,
    amountInUnits.toString(), // Convert BigInt to string
    paymentId
  ).send({ from: account });
};

// Helper for burning
export const burnTokens = async (from, amount) => {
  const contract = getContract();
  const account = await getCurrentAccount();
  const amountInUnits = await toTokenUnits(amount);
  
  return await contract.methods.burnTokens(
    from,
    amountInUnits.toString()
  ).send({ from: account });
};

// Helper for burning own tokens
export const burnMyTokens = async (amount) => {
  const contract = getContract();
  const account = await getCurrentAccount();
  const amountInUnits = await toTokenUnits(amount);
  
  return await contract.methods.burnMyTokens(
    amountInUnits.toString()
  ).send({ from: account });
};