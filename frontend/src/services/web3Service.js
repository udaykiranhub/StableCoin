import Web3 from 'web3';
import { CONTRACT_ADDRESS } from '../constants/contractAddress';
import CONTRACT_ABI from '../constants/contractABI.json';

// Global instances
let web3 = null;
let contract = null;
let currentAccount = null;

// Safe BigInt conversion
const safeParseInt = (value) => {
  if (typeof value === 'bigint') {
    return parseInt(value.toString());
  }
  return parseInt(value);
};

const safeParseFloat = (value, decimals = 2) => {
  if (typeof value === 'bigint') {
    const divisor = 10 ** decimals;
    return parseInt(value.toString()) / divisor;
  }
  return value / (10 ** decimals);
};

// Initialize Web3
export const initWeb3 = async () => {
  console.log('🔄 Initializing Web3...');
  
  if (!window.ethereum) {
    throw new Error('Please install MetaMask');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    if (!accounts.length) {
      throw new Error('No accounts found');
    }

    // Create Web3 instance
    web3 = new Web3(window.ethereum);
    
    // Fix ABI format issue - ensure it's an array
    let abi = CONTRACT_ABI;
    if (CONTRACT_ABI.abi) {
      abi = CONTRACT_ABI.abi; // Extract abi from {abi: [...]}
    }
    
    // Create contract instance
    contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
    currentAccount = accounts[0];
    
    // Save to localStorage
    localStorage.setItem('connectedAccount', currentAccount);
    
    console.log('✅ Web3 Initialized:', {
      account: currentAccount,
      contractAddress: CONTRACT_ADDRESS,
      network: safeParseInt(await web3.eth.net.getId())
    });
    
    return { web3, contract, account: currentAccount };
    
  } catch (error) {
    console.error('❌ Web3 initialization failed:', error);
    throw error;
  }
};

// Silent initialization
export const initWeb3Silently = async () => {
  console.log('🔇 Trying silent Web3 initialization...');
  
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      });
      
      if (accounts.length > 0) {
        web3 = new Web3(window.ethereum);
        
        // Fix ABI format issue
        let abi = CONTRACT_ABI;
        if (CONTRACT_ABI.abi) {
          abi = CONTRACT_ABI.abi;
        }
        
        contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
        currentAccount = accounts[0];
        
        console.log('✅ Silent initialization successful:', currentAccount);
        return { web3, contract, account: currentAccount };
      }
    } catch (error) {
      console.error('Silent initialization error:', error);
    }
  }
  
  return null;
};

// Get contract instance
export const getContract = () => {
  if (!contract) throw new Error('Contract not initialized');
  return contract;
};

// Get Web3 instance
export const getWeb3 = () => {
  if (!web3) throw new Error('Web3 not initialized');
  return web3;
};

// Get current account
export const getCurrentAccount = () => currentAccount;

// Check connection
export const isConnected = () => !!web3 && !!contract && !!currentAccount;

// Clear connection
export const clearSavedConnection = () => {
  web3 = null;
  contract = null;
  currentAccount = null;
  localStorage.removeItem('connectedAccount');
  console.log('🔌 Connection cleared');
};

// Get saved account
export const getSavedConnection = () => {
  return localStorage.getItem('connectedAccount');
};

// Get network info
export const getNetworkInfo = async () => {
  if (!web3) return null;
  
  try {
    const chainId = safeParseInt(await web3.eth.getChainId());
    
    const networks = {
      1: { name: 'Ethereum Mainnet', testnet: false },
      5: { name: 'Goerli Testnet', testnet: true },
      137: { name: 'Polygon Mainnet', testnet: false },
      80001: { name: 'Polygon Mumbai', testnet: true },
      31337: { name: 'Anvil Local', testnet: true },
      1337: { name: 'Ganache Local', testnet: true }
    };
    
    const network = networks[chainId] || { name: `Unknown (${chainId})`, testnet: true };
    
    return {
      chainId,
      name: network.name,
      isTestnet: network.testnet,
      isCorrectNetwork: chainId === 31337 || chainId === 80001 // Accept Hardhat Local
    };
  } catch (error) {
    console.error('Get network error:', error);
    return null;
  }
};

// Add this missing function for Dashboard.jsx
export const switchToCorrectNetwork = async () => {
  if (!window.ethereum) return false;
  
  try {
    const networkInfo = await getNetworkInfo();
    
    // If already on acceptable network, return true
    if (networkInfo && networkInfo.isCorrectNetwork) {
      return true;
    }
    
    // Try to switch to Polygon Mumbai (80001)
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13881' }], // Polygon Mumbai
      });
      return true;
    } catch (switchError) {
      // If network not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x13881',
            chainName: 'Polygon Mumbai',
            nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
            rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
            blockExplorerUrls: ['https://mumbai.polygonscan.com']
          }]
        });
        return true;
      }
      throw switchError;
    }
  } catch (error) {
    console.error('Switch network error:', error);
    return false;
  }
};

// Convert amount to token units
export const convertToTokenUnits = async (amount) => {
  try {
    const contract = getContract();
    const decimals = safeParseInt(await contract.methods.decimals().call());
    const amountInUnits = Math.floor(Number(amount) * Math.pow(10, decimals));
    console.log(`Converted ${amount} to ${amountInUnits} token units`);
    return amountInUnits.toString();
  } catch (error) {
    console.error('Conversion error:', error);
    throw error;
  }
};

// Parse contract errors
export const parseContractError = (error) => {
  console.error('Contract error:', error);
  
  if (error.code === 4001) {
    return 'Transaction rejected by user';
  }
  
  if (error.message) {
    const revertMatch = error.message.match(/execution reverted: ([^"]+)/);
    if (revertMatch) {
      return revertMatch[1];
    }
    
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient ETH for gas fees';
    }
    
    if (error.message.includes('not whitelisted')) {
      return 'You are not whitelisted for this action';
    }
  }
  
  return error.message || 'Transaction failed';
};

// Check user roles
export const getUserRoles = async (address) => {
  try {
    console.log(`🔍 Checking roles for ${address}`);
    
    const contract = getContract();
    const [whitelistStatus, adminStatus] = await Promise.all([
      contract.methods.whitelist(address).call(),
      contract.methods.admins(address).call()
    ]);
    
    const roles = {
      isAdmin: Boolean(adminStatus),
      canMint: Boolean(whitelistStatus.canMint),
      canBurn: Boolean(whitelistStatus.canBurn),
      isWhitelisted: Boolean(whitelistStatus.canMint || whitelistStatus.canBurn)
    };
    
    console.log('User roles:', roles);
    return roles;
  } catch (error) {
    console.error('Role check error:', error);
    return {
      isAdmin: false,
      canMint: false,
      canBurn: false,
      isWhitelisted: false
    };
  }
};

// Get token balance
export const getTokenBalance = async (address) => {
  try {
    const contract = getContract();
    const balance = await contract.methods.balanceOf(address).call();
    const decimals = safeParseInt(await contract.methods.decimals().call());
    const formatted = safeParseFloat(balance, decimals).toFixed(2);
    console.log(`Balance for ${address}: ${formatted} INRT`);
    return formatted;
  } catch (error) {
    console.error('Balance fetch error:', error);
    return '0.00';
  }
};

// Test contract connection
export const testContractConnection = async () => {
  try {
    const contract = getContract();
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.methods.name().call(),
      contract.methods.symbol().call(),
      contract.methods.decimals().call(),
      contract.methods.totalSupply().call()
    ]);
    
    const networkInfo = await getNetworkInfo();
    
    const supplyFormatted = safeParseFloat(totalSupply, safeParseInt(decimals)).toFixed(2);
    
    return {
      success: true,
      contract: { 
        name, 
        symbol, 
        decimals: safeParseInt(decimals),
        totalSupply: supplyFormatted
      },
      network: networkInfo,
      account: getCurrentAccount()
    };
  } catch (error) {
    console.error('Test contract error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};



// Also add this function for getting account from MetaMask directly:
export const getAccountFromMetaMask = async () => {
  if (!window.ethereum) return null;
  
  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_accounts' 
    });
    return accounts[0] || null;
  } catch (error) {
    console.error('Error getting account from MetaMask:', error);
    return null;
  }
};