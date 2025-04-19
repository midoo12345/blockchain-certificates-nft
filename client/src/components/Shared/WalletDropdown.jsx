import React from 'react';
import {
  ArrowsRightLeftIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

function WalletDropdown({ account, isAdmin, isInstitution, onSwitchAccount, onDisconnect }) {
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="absolute right-0 mt-2 w-72 rounded-xl overflow-hidden backdrop-blur-xl border border-gray-700/50 shadow-2xl shadow-black/50 transform transition-all duration-200 ease-out">
      <div className="bg-gray-900/95 p-4">
        {/* Account Header */}
        <div className="mb-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/30">
          <div className="text-sm text-gray-400 mb-1">Connected Account</div>
          <div className="font-mono text-violet-100 break-all">
            {account}
          </div>
        </div>

        {/* Role Badge */}
        {(isAdmin || isInstitution) && (
          <div className="mb-3">
            <span className={`inline-block text-xs px-3 py-1 rounded-full ${
              isAdmin 
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }`}>
              {isAdmin ? 'Admin Access' : 'Institution Access'}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-1">
          <button
            onClick={onSwitchAccount}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
          >
            <ArrowsRightLeftIcon className="h-5 w-5 text-gray-400" />
            <span>Switch Account</span>
          </button>
          
          <button
            onClick={onDisconnect}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Disconnect</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default WalletDropdown; 