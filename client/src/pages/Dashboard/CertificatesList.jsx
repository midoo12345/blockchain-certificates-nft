import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import contractAddress from '../../config/contractAddress.json';
import contractABI from '../../config/abi.json';
import { FaEye, FaFileAlt, FaSpinner } from 'react-icons/fa';
import PINATA_CONFIG from '../../config/pinata';

const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzJkM2Q0MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2YzcyN2QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';

const CertificatesList = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showMetadata, setShowMetadata] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    initializeContract();
  }, []);

  const initializeContract = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Ethereum provider is not available');
      }

      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(
        contractAddress.CertificateNFT,
        contractABI.CertificateNFT,
        provider
      );

      setContract(contract);
      fetchCertificates(contract);
    } catch (err) {
      console.error('Error initializing contract:', err);
      setError(`Failed to initialize contract: ${err.message}`);
      setLoading(false);
    }
  };

  const fetchCertificates = async (contractInstance) => {
    try {
      setLoading(true);
      setError('');

      if (!window.ethereum) {
        throw new Error('Ethereum provider is not available');
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();

      const balance = await contractInstance.balanceOf(account);
      const certs = [];

      for (let i = 0; i < balance; i++) {
        const tokenId = await contractInstance.tokenOfOwnerByIndex(account, i);
        const certificateData = await fetchCertificateData(contractInstance, tokenId);
        if (certificateData) {
          certs.push(certificateData);
        }
      }

      setCertificates(certs);
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError(`Failed to fetch certificates: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificateData = async (contractInstance, tokenId) => {
    try {
      console.log(`Fetching data for token ID ${tokenId}:`);
      
      // Get certificate data from contract
      const cert = await contractInstance.getCertificate(tokenId);
      console.log(`Certificate data from contract:`, {
        student: cert[0],
        institution: cert[1],
        courseId: cert[2].toString(),
        completionDate: new Date(Number(cert[3]) * 1000).toLocaleDateString(),
        grade: Number(cert[4]),
        isVerified: cert[5],
        isRevoked: cert[6],
        revocationReason: cert[7],
        version: cert[8],
        lastUpdateDate: cert[9],
        updateReason: cert[10]
      });

      // Get token URI and certificate hash
      let tokenURI = await contractInstance.tokenURI(tokenId);
      console.log(`Token URI for ${tokenId}:`, tokenURI);

      // If tokenURI is empty, try using certificateHash from contract data
      if (!tokenURI || tokenURI === '') {
        // Get certificate hash from contract data (stored in academicCertificates)
        const certData = await contractInstance.academicCertificates(tokenId);
        if (certData && certData.certificateHash) {
          tokenURI = certData.certificateHash;
          console.log(`Using certificateHash as fallback for token ${tokenId}:`, tokenURI);
        }
      }

      // If we have a tokenURI or certificateHash, fetch the metadata
      let metadata = null;
      let imageCID = null;
      let imageUrl = null;

      if (tokenURI && tokenURI !== '') {
        // Remove ipfs:// prefix if present
        const metadataCID = tokenURI.startsWith('ipfs://') ? tokenURI.slice(7) : tokenURI;
        console.log(`Fetching metadata from CID: ${metadataCID}`);
        
        try {
          // Fetch metadata from Pinata
          const ipfsUrl = `https://${PINATA_CONFIG.gateway}/ipfs/${metadataCID}`;
          console.log(`Fetching from IPFS URL: ${ipfsUrl}`);
          
          const response = await fetch(ipfsUrl);
          if (response.ok) {
            metadata = await response.json();
            console.log(`Metadata for token ${tokenId}:`, metadata);
            
            // Get image CID from metadata
            if (metadata.image) {
              imageCID = metadata.image.startsWith('ipfs://') ? 
                metadata.image.slice(7) : metadata.image;
              imageUrl = `https://${PINATA_CONFIG.gateway}/ipfs/${imageCID}`;
              console.log(`Image URL constructed: ${imageUrl}`);
            } else {
              console.log('No image field found in metadata');
            }
          } else {
            console.error(`Failed to fetch metadata: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          console.error(`Error fetching metadata for token ${tokenId}:`, error);
        }
      } else {
        console.log(`No tokenURI or certificateHash found for token ${tokenId}`);
      }

      // Get the certificate hash from contract data
      const certData = await contractInstance.academicCertificates(tokenId);
      const certificateHash = certData.certificateHash || '';

      // Return all the data we've gathered
      const certificateData = {
        tokenId,
        tokenURI: tokenURI || '',
        certificateHash,
        metadataCID: tokenURI && tokenURI !== '' ? 
          (tokenURI.startsWith('ipfs://') ? tokenURI.slice(7) : tokenURI) : null,
        imageCID,
        imageUrl,
        metadata,
        // Include additional certificate data
        student: cert[0],
        institution: cert[1],
        courseId: cert[2].toString(),
        completionDate: new Date(Number(cert[3]) * 1000).toLocaleDateString(),
        grade: Number(cert[4]),
        isVerified: cert[5],
        isRevoked: cert[6],
        revocationReason: cert[7],
        version: cert[8],
        lastUpdateDate: cert[9],
        updateReason: cert[10]
      };

      console.log(`Certificate ${tokenId} final data:`, certificateData);
      return certificateData;
    } catch (error) {
      console.error(`Error fetching certificate ${tokenId}:`, error);
      return null;
    }
  };

  const formatGrade = (grade) => {
    if (grade >= 90) return 'A';
    if (grade >= 80) return 'B';
    if (grade >= 70) return 'C';
    if (grade >= 60) return 'D';
    return 'F';
  };

  const handleViewMetadata = (certificate) => {
    setSelectedCertificate(certificate);
    setShowMetadata(true);
    setShowImage(false);
  };

  const handleViewImage = (certificate) => {
    setImageLoading(true);
    setSelectedCertificate(certificate);
    setShowImage(true);
    setShowMetadata(false);
  };

  const closeModal = () => {
    setShowMetadata(false);
    setShowImage(false);
    setSelectedCertificate(null);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = (e) => {
    console.error('Image failed to load');
    setImageLoading(false);
    e.target.onerror = null;
    e.target.src = placeholderImage;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <FaSpinner className="animate-spin text-4xl text-blue-500" />
    </div>
  );

  if (error) return (
    <div className="text-red-500 text-center p-4 bg-red-100 rounded-lg mx-4">
      {error}
    </div>
  );

  return (
    <div className="mt-28 text-white p-6">
      <h2 className="text-3xl font-bold mb-8 text-center">My Certificates</h2>

      {certificates.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <p className="text-xl">You don't have any certificates yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {certificates.map((certificate) => (
            <div key={certificate.id} className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-blue-400">{certificate.courseName}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${certificate.isRevoked ? 'bg-red-500' :
                  certificate.isVerified ? 'bg-green-500' : 'bg-yellow-500'
                  }`}>
                  {certificate.isRevoked ? 'Revoked' : certificate.isVerified ? 'Verified' : 'Pending'}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <p className="flex items-center">
                  <span className="text-gray-400 w-32">Student:</span>
                  <span className="truncate">{certificate.student}</span>
                </p>
                <p className="flex items-center">
                  <span className="text-gray-400 w-32">Institution:</span>
                  <span className="truncate">{certificate.institution}</span>
                </p>
                <p className="flex items-center">
                  <span className="text-gray-400 w-32">Completion Date:</span>
                  <span>{certificate.completionDate}</span>
                </p>
                <p className="flex items-center">
                  <span className="text-gray-400 w-32">Grade:</span>
                  <span className="font-semibold">
                    {formatGrade(certificate.grade)} ({certificate.grade}%)
                  </span>
                </p>
                {certificate.revocationReason && (
                  <p className="flex items-center">
                    <span className="text-gray-400 w-32">Revocation Reason:</span>
                    <span className="text-red-400">{certificate.revocationReason}</span>
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleViewMetadata(certificate)}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-300"
                >
                  <FaFileAlt className="mr-2" />
                  View Metadata
                </button>
                <button
                  onClick={() => handleViewImage(certificate)}
                  className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-300"
                >
                  <FaEye className="mr-2" />
                  View Image
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metadata Modal */}
      {showMetadata && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4 text-blue-400">Certificate Metadata</h3>
            <div className="space-y-3">
              <p><span className="text-gray-400">Token ID:</span> {selectedCertificate.id}</p>
              <p><span className="text-gray-400">Course Name:</span> {selectedCertificate.courseName}</p>
              <p><span className="text-gray-400">Student Address:</span> {selectedCertificate.student}</p>
              <p><span className="text-gray-400">Institution Address:</span> {selectedCertificate.institution}</p>
              <p><span className="text-gray-400">Course ID:</span> {selectedCertificate.courseId}</p>
              <p><span className="text-gray-400">Completion Date:</span> {selectedCertificate.completionDate}</p>
              <p><span className="text-gray-400">Grade:</span> {formatGrade(selectedCertificate.grade)} ({selectedCertificate.grade}%)</p>
              <p><span className="text-gray-400">Status:</span> {selectedCertificate.isRevoked ? 'Revoked' : selectedCertificate.isVerified ? 'Verified' : 'Pending'}</p>
              {selectedCertificate.imageCID && (
                <p><span className="text-gray-400">Image CID:</span> {selectedCertificate.imageCID}</p>
              )}
              {selectedCertificate.revocationReason && (
                <p><span className="text-gray-400">Revocation Reason:</span> {selectedCertificate.revocationReason}</p>
              )}
              {selectedCertificate.metadata && (
                <>
                  <p><span className="text-gray-400">Name:</span> {selectedCertificate.metadata.name}</p>
                  <p><span className="text-gray-400">Description:</span> {selectedCertificate.metadata.description}</p>
                  {selectedCertificate.metadata.attributes && selectedCertificate.metadata.attributes.map((attr, index) => (
                    <p key={index}>
                      <span className="text-gray-400">{attr.trait_type}:</span> {attr.value}
                    </p>
                  ))}
                </>
              )}
            </div>
            <button
              onClick={closeModal}
              className="mt-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImage && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full">
            <h3 className="text-2xl font-bold mb-4 text-blue-400">Certificate Image</h3>
            <div className="relative flex justify-center">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50">
                  <FaSpinner className="animate-spin text-4xl text-blue-500" />
                </div>
              )}
              <img
                src={selectedCertificate.imageUrl || placeholderImage}
                alt={`Certificate ${selectedCertificate.id}`}
                className="max-w-full h-auto rounded-lg shadow-xl"
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ maxHeight: '70vh' }}
              />
            </div>
            <div className="mt-6 flex justify-between items-center">
              <span className="text-sm text-gray-400">
                Certificate ID: {selectedCertificate.id}
                {selectedCertificate.imageCID && (
                  <> | CID: {selectedCertificate.imageCID}</>
                )}
              </span>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatesList;