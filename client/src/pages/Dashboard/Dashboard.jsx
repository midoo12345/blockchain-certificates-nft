import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import contractAddress from '../../config/contractAddress.json';
import contractABI from '../../config/abi.json';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInstitution, setIsInstitution] = useState(false);
  const [stats, setStats] = useState({
    totalCertificates: 0,
    myCertificates: 0,
    issuedCertificates: 0,
    totalInstitutions: 0
  });

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

      setIsAdmin(hasAdminRole);
      setIsInstitution(hasInstitutionRole);
    } catch (error) {
      console.error('Error checking roles:', error);
    }
  };

  // Fetch dashboard statistics
  const fetchStats = async () => {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress.CertificateNFT,
        contractABI.CertificateNFT,
        provider
      );

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) return;

      const currentAccount = accounts[0];
      await checkRoles(currentAccount);

      // Fetch statistics
      const [totalCertificates, myCertificates, issuedCertificates, totalInstitutions] = await Promise.all([
        contract.totalSupply(),
        contract.balanceOf(currentAccount),
        isInstitution ? contract.getIssuedCertificatesCount(currentAccount) : 0,
        isAdmin ? contract.getInstitutionsCount() : 0
      ]);

      setStats({
        totalCertificates: totalCertificates.toString(),
        myCertificates: myCertificates.toString(),
        issuedCertificates: issuedCertificates.toString(),
        totalInstitutions: totalInstitutions.toString()
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', fetchStats);
      return () => {
        window.ethereum.removeListener('accountsChanged', fetchStats);
      };
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="medium" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-gray-200 p-6">
      <div className="max-w-7xl mx-auto space-y-8 mt-3">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-800 rounded p-8 shadow-lg border border-purple-500/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-white">Certificate NFT Dashboard</h1>
              <p className="text-purple-200 text-lg">
                {isAdmin ? 'Administrator Portal' :
                  isInstitution ? 'Institution Management Portal' :
                    'Certificate Holder Portal'}
              </p>
            </div>
            <div className="mt-4 md:mt-0 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
              <span className="text-purple-200">Role: </span>
              <span className="font-medium text-white">
                {isAdmin ? 'Administrator' : isInstitution ? 'Institution' : 'User'}
              </span>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Certificates */}
          <div className="bg-gray-800 rounded  shadow-lg p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-purple-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-900/60 p-3 rounded">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm font-medium">Total Certificates</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stats.totalCertificates}</h3>
              </div>
            </div>
            <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* My Certificates */}
          <div className="bg-gray-800 rounded shadow-lg p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-blue-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-900/60 p-3 rounded-lg">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm font-medium">My Certificates</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stats.myCertificates}</h3>
              </div>
            </div>
            <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, (stats.myCertificates / Math.max(1, stats.totalCertificates)) * 100)}%` }}></div>
            </div>
          </div>

          {/* Issued Certificates (for institutions) */}
          {isInstitution && (
            <div className="bg-gray-800 rounded shadow-lg p-6 border border-gray-700 hover:border-teal-500/50 transition-all duration-300 hover:shadow-teal-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-teal-900/60 p-3 rounded-lg">
                  <svg className="w-7 h-7 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm font-medium">Issued Certificates</p>
                  <h3 className="text-3xl font-bold text-white mt-1">{stats.issuedCertificates}</h3>
                </div>
              </div>
              <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: `${Math.min(100, (stats.issuedCertificates / Math.max(1, stats.totalCertificates)) * 100)}%` }}></div>
              </div>
            </div>
          )}

          {/* Total Institutions (for admin) */}
          {isAdmin && (
            <div className="bg-gray-800 rounded  shadow-lg p-6 border border-gray-700 hover:border-pink-500/50 transition-all duration-300 hover:shadow-pink-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-pink-900/60 p-3 rounded-lg">
                  <svg className="w-7 h-7 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm font-medium">Total Institutions</p>
                  <h3 className="text-3xl font-bold text-white mt-1">{stats.totalInstitutions}</h3>
                </div>
              </div>
              <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
                <div className="bg-pink-500 h-full rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900 rounded shadow-lg p-6 border border-violet-500/30">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* View Certificates - Available to all */}
            <Link
              to="/dashboard/certificates"
              className="group flex flex-col items-center p-5 bg-gray-900 hover:bg-gray-800 rounded transition-all duration-300 border border-gray-700 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className="bg-purple-900/40 p-3 rounded-lg mb-3 group-hover:bg-purple-800/60 transition-colors duration-300">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-gray-300 group-hover:text-white font-medium">View Certificates</span>
            </Link>

            {/* Issue Certificate - For institutions */}
            {isInstitution && (
              <Link
                to="/dashboard/issue"
                className="group flex flex-col items-center p-5 bg-gray-900 hover:bg-gray-800 rounded transition-all duration-300 border border-gray-700 hover:border-teal-500 hover:shadow-lg hover:shadow-teal-500/10"
              >
                <div className="bg-teal-900/40 p-3 rounded mb-3 group-hover:bg-teal-800/60 transition-colors duration-300">
                  <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="text-gray-300 group-hover:text-white font-medium">Issue Certificate</span>
              </Link>
            )}

            {/* Verify Certificate - For institutions */}
            {isInstitution && (
              <Link
                to="/dashboard/verify"
                className="group flex flex-col items-center p-5 bg-gray-900 hover:bg-gray-800 rounded transition-all duration-300 border border-gray-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="bg-blue-900/40 p-3 rounded mb-3 group-hover:bg-blue-800/60 transition-colors duration-300">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-gray-300 group-hover:text-white font-medium">Verify Certificate</span>
              </Link>
            )}

            {/* Manage Institutions - For admin */}
            {isAdmin && (
              <Link
                to="/dashboard/institutions"
                className="group flex flex-col items-center p-5 bg-gray-900 hover:bg-gray-800 rounded transition-all duration-300 border border-gray-700 hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/10"
              >
                <div className="bg-pink-900/40 p-3 rounded-lg mb-3 group-hover:bg-pink-800/60 transition-colors duration-300">
                  <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="text-gray-300 group-hover:text-white font-medium">Manage Institutions</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;