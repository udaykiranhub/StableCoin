// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
/**
 * @title INRT - Stable Digital Token for INR Pegging
 * @dev B.Tech Final Year Project - Blockchain-based Stable Token System
 * @dev ERC20 token with whitelisted minting and burning
 * @dev 1 INRT Token = 1 Indian Rupee
 */
contract INRT is ERC20, Ownable, Pausable {
    // Token configuration
    uint8 private constant _DECIMALS = 2; // 2 decimals like INR (₹100.00)
    
    // Reserve tracking (INR in smallest unit: 1 token = 100 base units)
    uint256 public totalReserve;
    mapping(address => uint256) public userReserves;
    
    // Whitelist for minting and burning
    struct WhitelistStatus {
        bool canMint;
        bool canBurn;
    }
    
    mapping(address => WhitelistStatus) public whitelist;
    address[] public whitelistedAddresses;
    
    // Payment tracking - Prevent duplicate payments
    mapping(string => bool) public processedPayments;
    
    // Tax configuration - Only for large transactions
    struct TaxConfig {
        uint256 taxRate; // Basis points (100 = 1%)
        address taxWallet;
        bool taxEnabled;
        uint256 taxThreshold; // Amount above which tax applies (in tokens)
    }
    TaxConfig public taxConfig;
    
    // Transaction limits (in tokens, where 1 token = 1 INR)
    uint256 public maxTransferAmount = 100000; // 100,000 INR (100,000 tokens)
    uint256 public minTransferAmount = 1;       // 1 INR (1 token) - Changed from 100
    
    // Admin management
    mapping(address => bool) public admins;
    
    // Events for transparency
    event TokensMinted(address indexed to, uint256 amount, string paymentId);
    event TokensBurned(address indexed from, uint256 amount);
    event TaxCollected(address indexed from, uint256 amount, uint256 taxRate);
    event ReserveUpdated(uint256 newReserve);
    event WhitelistUpdated(address indexed account, bool canMint, bool canBurn);
    event AdminUpdated(address indexed admin, bool isAdmin);
    event PaymentProcessed(string paymentId, address indexed user, uint256 amount);
    
    // Constructor with proper initialization
    constructor() ERC20("Indian Rupee Token", "INRT") Ownable(msg.sender) {
        // Set initial whitelist status for deployer
        whitelist[msg.sender] = WhitelistStatus({
            canMint: true,
            canBurn: true
        });
        whitelistedAddresses.push(msg.sender);
        
        // Set as admin
        admins[msg.sender] = true;
        
        // Default tax configuration
        // 1% tax only for transactions above 5 lakhs (5,00,000 INR)
        taxConfig = TaxConfig({
            taxRate: 100, // 100 basis points = 1%
            taxWallet: msg.sender,
            taxEnabled: true,
            taxThreshold: 500000 // 5,00,000 INR (500,000 tokens)
        });
    }
    
    // ============ MODIFIERS ============
    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == owner(), "Only admin can call");
        _;
    }
    
    modifier onlyWhitelistedMinter() {
        require(whitelist[msg.sender].canMint, "Not whitelisted for minting");
        _;
    }
    
    modifier onlyWhitelistedBurner() {
        require(whitelist[msg.sender].canBurn, "Not whitelisted for burning");
        _;
    }
    
    // ============ OVERRIDES ============
    
    /**
     * @dev Returns the number of decimals used
     */
    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }
    
    /**
     * @dev Override transfer to include conditional tax deduction
     */
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        _transferWithConditionalTax(msg.sender, to, amount);
        return true;
    }
    
    /**
     * @dev Override transferFrom to include conditional tax deduction
     */
    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transferWithConditionalTax(from, to, amount);
        return true;
    }
    
    // ============ TOKEN FUNCTIONS ============
    
    /**
     * @dev Mint tokens after verified payment (Only whitelisted)
     * @param to Recipient address
     * @param amount Amount in tokens (1 token = 1 INR)
     * @param paymentId Unique payment ID from gateway (Razorpay/Stripe order ID)
     */
    function mintTokens(
        address to, 
        uint256 amount, 
        string memory paymentId
    ) external onlyWhitelistedMinter whenNotPaused {
        require(to != address(0), "INRT: mint to zero address");
        require(amount > 0, "INRT: amount must be positive");
        require(!processedPayments[paymentId], "INRT: payment already processed");
        
        // Mark payment as processed
        processedPayments[paymentId] = true;
        
        // Calculate reserve amount (amount * 100 for base units)
        uint256 reserveAmount = amount * 10**decimals();
        
        // Update reserve
        userReserves[to] += reserveAmount;
        totalReserve += reserveAmount;
        
        // Mint tokens (ERC20 handles decimals internally)
        _mint(to, amount);
        
        emit TokensMinted(to, amount, paymentId);
        emit PaymentProcessed(paymentId, to, amount);
        emit ReserveUpdated(totalReserve);
    }
    
    /**
     * @dev Burn tokens from any address (Only whitelisted burner)
     * Simple burn function - no redemption ID needed
     * @param from Address to burn tokens from
     * @param amount Amount to burn in tokens (1 token = 1 INR)
     */
    function burnTokens(
        address from, 
        uint256 amount
    ) external onlyWhitelistedBurner whenNotPaused {
        require(from != address(0), "INRT: burn from zero address");
        require(amount > 0, "INRT: amount must be positive");
        require(balanceOf(from) >= amount, "INRT: insufficient balance");
        
        // Calculate reserve amount
        uint256 reserveAmount = amount * 10**decimals();
        
        // Update reserve
        require(userReserves[from] >= reserveAmount, "INRT: insufficient reserve");
        userReserves[from] -= reserveAmount;
        totalReserve -= reserveAmount;
        
        // Burn tokens
        _burn(from, amount);
        
        emit TokensBurned(from, amount);
        emit ReserveUpdated(totalReserve);
    }
    
    /**
     * @dev User can burn their own tokens (for voluntary burning)
     * @param amount Amount to burn in tokens (1 token = 1 INR)
     */
    function burnMyTokens(uint256 amount) external whenNotPaused {
        require(amount > 0, "INRT: amount must be positive");
        require(balanceOf(msg.sender) >= amount, "INRT: insufficient balance");
        
        // Calculate reserve amount
        uint256 reserveAmount = amount * 10**decimals();
        
        // Update reserve
        require(userReserves[msg.sender] >= reserveAmount, "INRT: insufficient reserve");
        userReserves[msg.sender] -= reserveAmount;
        totalReserve -= reserveAmount;
        
        // Burn tokens
        _burn(msg.sender, amount);
        
        emit TokensBurned(msg.sender, amount);
        emit ReserveUpdated(totalReserve);
    }
    
    /**
     * @dev Internal transfer with conditional tax (tax only above threshold)
     */
    function _transferWithConditionalTax(address from, address to, uint256 amount) internal {
        require(to != address(0), "INRT: transfer to zero address");
        require(amount >= minTransferAmount, "INRT: below minimum transfer");
        require(amount <= maxTransferAmount, "INRT: exceeds maximum transfer");
        
        uint256 taxAmount = 0;
        uint256 transferAmount = amount;
        
        // Apply tax ONLY if:
        // 1. Tax is enabled
        // 2. Transaction amount is above tax threshold (5 lakhs)
        // 3. Tax rate is > 0
        // 4. Tax wallet is valid
        if (taxConfig.taxEnabled && 
            amount >= taxConfig.taxThreshold && 
            taxConfig.taxRate > 0 && 
            taxConfig.taxWallet != address(0)) {
            
            taxAmount = (amount * taxConfig.taxRate) / 10000; // Basis points calculation
            transferAmount = amount - taxAmount;
            
            // Ensure tax is valid
            require(taxAmount > 0, "INRT: tax calculation error");
            
            // Transfer tax to tax wallet
            _transfer(from, taxConfig.taxWallet, taxAmount);
            emit TaxCollected(from, taxAmount, taxConfig.taxRate);
        }
        
        // Transfer remaining amount
        _transfer(from, to, transferAmount);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update whitelist status for an address
     */
    function updateWhitelist(
        address account, 
        bool canMint, 
        bool canBurn
    ) external onlyAdmin {
        require(account != address(0), "INRT: invalid address");
        
        // Add to whitelisted addresses list if not already present
        if (!whitelist[account].canMint && !whitelist[account].canBurn) {
            whitelistedAddresses.push(account);
        }
        
        whitelist[account] = WhitelistStatus({
            canMint: canMint,
            canBurn: canBurn
        });
        
        emit WhitelistUpdated(account, canMint, canBurn);
    }
    
    /**
     * @dev Remove address from whitelist
     */
    function removeFromWhitelist(address account) external onlyAdmin {
        require(account != address(0), "INRT: invalid address");
        
        delete whitelist[account];
        emit WhitelistUpdated(account, false, false);
    }
    
    /**
     * @dev Add or remove admin
     */
    function updateAdmin(address account, bool isAdmin) external onlyOwner {
        require(account != address(0), "INRT: invalid address");
        admins[account] = isAdmin;
        emit AdminUpdated(account, isAdmin);
    }
    
    /**
     * @dev Update tax configuration
     */
    function updateTaxConfig(
        uint256 rate, 
        address wallet, 
        bool enabled,
        uint256 threshold
    ) external onlyAdmin {
        require(rate <= 500, "INRT: tax rate too high (max 5%)"); // Max 5%
        require(wallet != address(0), "INRT: invalid tax wallet");
        require(threshold >= 0, "INRT: threshold cannot be negative");
        
        taxConfig.taxRate = rate;
        taxConfig.taxWallet = wallet;
        taxConfig.taxEnabled = enabled;
        taxConfig.taxThreshold = threshold;
    }
    
    /**
     * @dev Update transfer limits (in tokens, 1 token = 1 INR)
     */
    function updateTransferLimits(uint256 min, uint256 max) external onlyAdmin {
        require(min >= 1, "INRT: minimum must be at least 1 token (1 INR)");
        require(max > min, "INRT: maximum must be greater than minimum");
        
        minTransferAmount = min;      // Example: 1 token = ₹1
        maxTransferAmount = max;      // Example: 100000 tokens = ₹100,000
    }
    
    /**
     * @dev Emergency pause all transfers
     */
    function emergencyPause() external onlyAdmin {
        _pause();
    }
    
    /**
     * @dev Unpause transfers
     */
    function emergencyUnpause() external onlyAdmin {
        _unpause();
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Check if payment ID is already processed
     */
    function isPaymentProcessed(string memory paymentId) public view returns (bool) {
        return processedPayments[paymentId];
    }
    
    /**
     * @dev Get tax threshold in INR format
     */
    function getTaxThresholdInINR() public view returns (string memory) {
        return string(abi.encodePacked(_formatNumber(taxConfig.taxThreshold), " INR"));
    }
    
    /**
     * @dev Check if transaction would be taxed
     */
    function wouldBeTaxed(uint256 amount) public view returns (bool) {
        return taxConfig.taxEnabled && 
               amount >= taxConfig.taxThreshold && 
               taxConfig.taxRate > 0;
    }
    
    /**
     * @dev Calculate tax for a given amount
     */
    function calculateTax(uint256 amount) public view returns (uint256) {
        if (!wouldBeTaxed(amount)) {
            return 0;
        }
        return (amount * taxConfig.taxRate) / 10000;
    }
    
    /**
     * @dev Get balance in human readable INR format
     */
    function getBalanceInINR(address account) public view returns (string memory) {
        uint256 balance = balanceOf(account);
        return string(abi.encodePacked(_formatNumber(balance), " INR"));
    }
    
    /**
     * @dev Get total supply in INR format
     */
    function getTotalSupplyInINR() public view returns (string memory) {
        return string(abi.encodePacked(_formatNumber(totalSupply()), " INR"));
    }
    
    /**
     * @dev Get total reserve in INR format
     */
    function getTotalReserveInINR() public view returns (string memory) {
        uint256 reserveInTokens = totalReserve / 10**decimals();
        return string(abi.encodePacked(_formatNumber(reserveInTokens), " INR"));
    }
    
    /**
     * @dev Check if supply matches reserve (1:1 peg)
     */
    function verifyPeg() public view returns (bool) {
        uint256 supplyInBase = totalSupply() * 10**decimals();
        return supplyInBase == totalReserve;
    }
    
    /**
     * @dev Get all whitelisted addresses
     */
    function getAllWhitelisted() public view returns (address[] memory) {
        return whitelistedAddresses;
    }
    
    /**
     * @dev Get user's reserve in INR
     */
    function getUserReserveInINR(address account) public view returns (string memory) {
        uint256 reserveInTokens = userReserves[account] / 10**decimals();
        return string(abi.encodePacked(_formatNumber(reserveInTokens), " INR"));
    }
    
    /**
     * @dev Internal function to format number with commas
     */
    function _formatNumber(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        
        string memory numStr = _uintToString(value);
        bytes memory b = bytes(numStr);
        bytes memory result = new bytes(b.length + (b.length - 1) / 3);
        
        uint256 i = 0;
        uint256 j = 0;
        
        for (i = 0; i < b.length; i++) {
            result[j++] = b[i];
            if (i < b.length - 1 && (b.length - i - 1) % 3 == 0) {
                result[j++] = ',';
            }
        }
        
        return string(result);
    }
    
    /**
     * @dev Internal function to convert uint to string
     */
    function _uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        
        uint256 temp = value;
        uint256 digits;
        
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + (value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }
    
    /**
     * @dev Prevent direct ETH transfers
     */
    receive() external payable {
        revert("INRT: direct ETH transfers not allowed");
    }
}