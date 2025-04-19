import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import contractAddress from '../../config/contractAddress.json';
import contractABI from '../../config/abi.json';
import {
  WalletIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ArrowsRightLeftIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClipboardDocumentIcon,
  SignalIcon,
} from '@heroicons/react/24/outline';

// Lazy load the dropdown component
const WalletDropdown = lazy(() => import('./WalletDropdown'));

function Navbar() {
  // Initialize state with sessionStorage data if available
  const [account, setAccount] = useState(() => {
    try {
      return sessionStorage.getItem('walletAddress') || '';
    } catch {
      return '';
    }
  });
  
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      const roles = JSON.parse(sessionStorage.getItem('walletRoles') || '{}');
      return roles.isAdmin || false;
    } catch {
      return false;
    }
  });
  
  const [isInstitution, setIsInstitution] = useState(() => {
    try {
      const roles = JSON.parse(sessionStorage.getItem('walletRoles') || '{}');
      return roles.isInstitution || false;
    } catch {
      return false;
    }
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [networkStatus, setNetworkStatus] = useState('connected'); // 'connected', 'warning', 'error'
  const [lastTransaction, setLastTransaction] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const dropdownRef = useRef(null);
  const dropdownContentRef = useRef(null);
  const location = useLocation();
  const initializationRef = useRef(false);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Format the account address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Save wallet state to sessionStorage
  const saveWalletState = (address, roles = null) => {
    try {
      if (address) {
        sessionStorage.setItem('walletAddress', address);
        if (roles) {
          sessionStorage.setItem('walletRoles', JSON.stringify(roles));
        }
      } else {
        sessionStorage.removeItem('walletAddress');
        sessionStorage.removeItem('walletRoles');
      }
    } catch (error) {
      console.error('Error saving wallet state:', error);
    }
  };

  // Check roles for the account
  const checkRoles = async (address) => {
    if (!window.ethereum || !address) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress.CertificateNFT,
        contractABI.CertificateNFT,
        provider
      );

      const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
      const INSTITUTION_ROLE = ethers.keccak256(ethers.toUtf8Bytes('INSTITUTION_ROLE'));

      const [hasAdminRole, hasInstitutionRole] = await Promise.all([
        contract.hasRole(DEFAULT_ADMIN_ROLE, address),
        contract.hasRole(INSTITUTION_ROLE, address)
      ]);

      const roles = { isAdmin: hasAdminRole, isInstitution: hasInstitutionRole };
      setIsAdmin(hasAdminRole);
      setIsInstitution(hasInstitutionRole);
      saveWalletState(address, roles);
      return roles;
    } catch (error) {
      console.error('Error checking roles:', error);
      return null;
    }
  };

  // Network and connection monitoring
  useEffect(() => {
    const checkConnection = () => {
      if (window.ethereum) {
        setNetworkStatus(window.ethereum.isConnected() ? 'connected' : 'error');
      }
    };

    window.ethereum?.on('networkChanged', checkConnection);
    window.ethereum?.on('connect', () => setNetworkStatus('connected'));
    window.ethereum?.on('disconnect', () => setNetworkStatus('error'));

    return () => {
      window.ethereum?.removeListener('networkChanged', checkConnection);
    };
  }, []);

  // Scroll handling with performance optimization
  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 0);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Touch gesture handling for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const swipeDistance = touchEndX.current - touchStartX.current;
    if (Math.abs(swipeDistance) > 50) {
      setDropdownOpen(swipeDistance < 0);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Initialize wallet connection
  useEffect(() => {
    const initializeWallet = async () => {
      if (!window.ethereum || initializationRef.current) return;
      
      initializationRef.current = true;
      
      try {
        // Check if already connected
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        
        if (accounts.length > 0) {
          const currentAccount = accounts[0];
          setAccount(currentAccount);
          await checkRoles(currentAccount);
        } else {
          // Clear session if no wallet is connected
          setAccount('');
          setIsAdmin(false);
          setIsInstitution(false);
          saveWalletState('');
        }
      } catch (error) {
        console.error('Error initializing wallet:', error);
        saveWalletState('');
      }
    };

    // Set up event listeners for wallet changes
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length > 0) {
        const newAccount = accounts[0];
        setAccount(newAccount);
        await checkRoles(newAccount);
      } else {
        setAccount('');
        setIsAdmin(false);
        setIsInstitution(false);
        saveWalletState('');
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      // Initialize wallet
      initializeWallet();
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    setIsLoading(true);
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        const newAccount = accounts[0];
        setAccount(newAccount);
        await checkRoles(newAccount);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      saveWalletState('');
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const handleDisconnect = () => {
    setAccount('');
    setIsAdmin(false);
    setIsInstitution(false);
    setDropdownOpen(false);
    setIsMobileMenuOpen(false);
    saveWalletState('');
  };

  // Switch account
  const handleSwitchAccount = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    setIsLoading(true);
    
    try {
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      });

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        const newAccount = accounts[0];
        setAccount(newAccount);
        await checkRoles(newAccount);
      }

      setDropdownOpen(false);
    } catch (error) {
      console.error('Error switching account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownContentRef.current && dropdownContentRef.current.contains(event.target)) {
        return;
      }

      if (event.target.closest('.account-address')) {
        return;
      }

      if (dropdownOpen && !dropdownRef.current?.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Copy address to clipboard with feedback
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 border-b ${
        isScrolled 
          ? 'bg-slate-950 border-slate-800/50 shadow-lg' 
          : 'bg-slate-950 border-transparent'
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-1 flex items-center justify-between">
            {/* Logo and brand section */}
            <Link 
              to="/" 
              className="group flex items-center space-x-5 text-violet-100 hover:text-violet-300 transition-colors"
              aria-label="Home"
            >
              {/* Icon with enhanced effects */}
              <div className="relative group/icon">
                <div className="relative animate-float">
                  <AcademicCapIcon className="h-12 w-12 text-violet-500 animate-icon-pulse transition-all duration-300 group-hover:text-violet-400" />
                  {/* Inner glow */}
                  <div className="absolute inset-0 bg-violet-500/40 blur-[12px] rounded-full group-hover:bg-violet-400/60 transition-all duration-300"></div>
                </div>
              </div>

              {/* Text with enhanced effects */}
              <div className="relative group/text">
                <span className="font-orbitron text-3xl font-bold bg-gradient-to-r from-violet-200 via-violet-300 to-violet-200 bg-clip-text text-transparent animate-neon-pulse">
                  Certificate NFT
                </span>
              </div>
            </Link>

            {/* Wallet section - moved to the right */}
            <div className="flex-shrink-0" ref={dropdownRef}>
              {isLoading ? (
                <div className="flex items-center space-x-3 px-5 sm:px-6 py-3 sm:py-4 bg-gray-800/50 rounded-full border border-gray-700/50">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-violet-400"></div>
                  <span className="text-gray-300 text-lg hidden sm:inline">Connecting...</span>
                </div>
              ) : account ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="group flex items-center space-x-3 sm:space-x-4 px-5 sm:px-6 py-3 sm:py-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-full transition-all duration-200 border border-gray-700/50 hover:border-violet-500/30"
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                  >
                    <div className="relative">
                      <WalletIcon className="h-6 w-6 text-violet-400" />
                      <div className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full ${
                        networkStatus === 'connected' ? 'bg-green-400' : 
                        networkStatus === 'warning' ? 'bg-yellow-400' : 
                        'bg-red-400'
                      }`}></div>
                    </div>
                    <span className="text-gray-200 text-lg hidden sm:inline font-mono group-hover:text-gray-100">
                      {formatAddress(account)}
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(account);
                        }}
                        className="ml-2 inline-flex items-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        role="button"
                        tabIndex={0}
                        aria-label="Copy address"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            copyToClipboard(account);
                          }
                        }}
                      >
                        <ClipboardDocumentIcon className="h-4 w-4 text-gray-400 hover:text-violet-400" />
                      </span>
                    </span>
                    {(isAdmin || isInstitution || (!isAdmin && !isInstitution)) && (
                      <span className={`hidden sm:inline text-sm px-3 py-1.5 rounded-full ${
                        isAdmin ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        isInstitution ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        'bg-green-500/20 text-green-300 border border-green-500/30'
                      }`}>
                        {isAdmin ? 'Admin' : isInstitution ? 'Institution' : 'User'}
                      </span>
                    )}
                  </button>

                  {/* Toast notification for copied address */}
                  <div
                    className={`absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-gray-900/95 text-gray-200 text-sm rounded-lg transition-all duration-200 backdrop-blur-lg ${
                      isCopied ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                    }`}
                    role="alert"
                  >
                    Address copied!
                  </div>

                  {/* Lazy loaded dropdown */}
                  <Suspense fallback={null}>
                    {dropdownOpen && (
                      <WalletDropdown
                        account={account}
                        isAdmin={isAdmin}
                        isInstitution={isInstitution}
                        onSwitchAccount={handleSwitchAccount}
                        onDisconnect={handleDisconnect}
                      />
                    )}
                  </Suspense>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="group relative flex items-center space-x-2 px-4 py-2.5 text-white rounded-full transition-all duration-300 bg-violet-600 hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-600/20"
                  aria-label="Connect Wallet"
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 rounded-full bg-shimmer-gradient bg-[length:200%_100%] animate-shimmer"></div>
                  
                  {/* Content */}
                  <WalletIcon className="h-5 w-5 relative z-10" />
                  <span className="text-base font-medium relative z-10">Connect Wallet</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Status Toast */}
      {lastTransaction && (
        <div 
          className={`fixed bottom-4 right-4 flex items-center space-x-2 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 backdrop-blur-lg ${
            lastTransaction.status === 'success' ? 'bg-green-900/90 text-green-100' : 'bg-red-900/90 text-red-100'
          }`}
          role="alert"
        >
          {lastTransaction.status === 'success' ? (
            <CheckCircleIcon className="h-5 w-5" />
          ) : (
            <ExclamationCircleIcon className="h-5 w-5" />
          )}
          <span>{lastTransaction.message}</span>
        </div>
      )}
    </nav>
  );
}

export default Navbar;