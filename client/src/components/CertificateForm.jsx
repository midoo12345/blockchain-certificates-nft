import React, { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import contractAddress from '../config/contractAddress.json';
import contractABI from '../config/abi.json';
import { uploadToIPFS, addToMFS } from '../utils/ipfs';
import { validateEthereumAddress, validateGrade } from '../utils/validation';
import LoadingSpinner from '../components/Shared/LoadingSpinner';

const LOCAL_GATEWAY = 'http://localhost:8084';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const COURSES_CACHE_KEY = 'courses_cache';

function CertificateForm() {
  const [formData, setFormData] = useState({
    studentAddress: '',
    courseId: '',
    grade: '',
    certificateData: '',
  });
  const [certificateImage, setCertificateImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [metadataCID, setMetadataCID] = useState(null);
  const [imageCID, setImageCID] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Load courses when component mounts
  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch courses from cache or contract
  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);

      // First try to get from cache
      const cachedData = localStorage.getItem(COURSES_CACHE_KEY);
      if (cachedData) {
        try {
          const { data, timestamp } = JSON.parse(cachedData);
          // Use cache if it's less than 5 minutes old
          if (Date.now() - timestamp < 5 * 60 * 1000 && Array.isArray(data) && data.length > 0) {
            setCourses(data);
            setLoadingCourses(false);
            return;
          }
        } catch (e) {
          console.error('Error parsing cached course data:', e);
        }
      }

      // If no valid cache, fetch from blockchain
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress.CertificateNFT,
        contractABI.CertificateNFT,
        provider
      );

      // Get all courses
      const uniqueCourseIds = new Set();
      const allCourses = [];

      // Try to get courses from existing certificates
      const totalCertificates = Number(await contract.totalSupply());
      const maxToCheck = Math.min(totalCertificates, 100);

      for (let i = 0; i < maxToCheck; i++) {
        try {
          const tokenId = await contract.tokenByIndex(i);
          const cert = await contract.getCertificate(tokenId);
          uniqueCourseIds.add(cert[2].toString());
        } catch (err) {
          // Skip errors
        }
      }

      // Also check for courses without certificates
      for (let i = 1; i <= 100; i++) {
        try {
          const courseName = await contract.getCourseName(i.toString());
          if (courseName && courseName.trim()) {
            uniqueCourseIds.add(i.toString());
          }
        } catch (err) {
          // Skip errors
        }
      }

      // Get course names
      for (const courseId of uniqueCourseIds) {
        try {
          const courseName = await contract.getCourseName(courseId);
          if (courseName && courseName.trim()) {
            allCourses.push({
              id: courseId,
              name: courseName
            });
          }
        } catch (err) {
          // Skip errors
        }
      }

      // Sort by ID
      allCourses.sort((a, b) => Number(a.id) - Number(b.id));

      setCourses(allCourses);

      // Update cache
      localStorage.setItem(COURSES_CACHE_KEY, JSON.stringify({
        data: allCourses,
        timestamp: Date.now()
      }));

    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'studentAddress':
        error = validateEthereumAddress(value);
        break;
      case 'grade':
        error = validateGrade(value);
        break;
      case 'courseId':
        if (!value) {
          error = 'Course is required';
        }
        break;
      case 'certificateData':
        if (!value.trim()) {
          error = 'Certificate title is required';
        } else if (value.length < 3) {
          error = 'Certificate title must be at least 3 characters long';
        }
        break;
      default:
        // No validation needed for other fields
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setValidationErrors(prev => ({
        ...prev,
        certificateImage: 'Invalid file type. Please upload a JPEG, PNG, or GIF image.'
      }));
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setValidationErrors(prev => ({
        ...prev,
        certificateImage: 'File size too large. Maximum size is 5MB.'
      }));
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    setCertificateImage(file);
    setValidationErrors(prev => ({
      ...prev,
      certificateImage: ''
    }));
    setTouchedFields(prev => ({
      ...prev,
      certificateImage: true
    }));
  }, []);

  const mintCertificate = async () => {
    try {
      // Mark all fields as touched
      setTouchedFields({
        studentAddress: true,
        courseId: true,
        grade: true,
        certificateData: true
      });

      if (!validateForm()) {
        setError('Please fix the validation errors before proceeding');
        return;
      }

      setLoading(true);
      setError('');
      setSuccess('');
      setMetadataCID(null);
      setImageCID(null);
      setUploadProgress(0);

      // 1. Upload image to IPFS with progress tracking
      setUploadProgress(10);
      const imageCID = await uploadToIPFS(certificateImage, (progress) => {
        setUploadProgress(10 + (progress * 0.4)); // 10-50% for image upload
      });
      setImageCID(imageCID);
      setUploadProgress(50);

      // 2. Add image to MFS - this is now optional and won't break the flow if it fails
      setUploadProgress(60);
      try {
        await addToMFS(imageCID, certificateImage.name);
      } catch (mfsError) {
        console.warn("MFS operation failed but continuing with minting:", mfsError);
        // Continue with the process - MFS operations are not critical
      }
      setUploadProgress(70);

      // 3. Create and upload metadata
      setUploadProgress(80);
      const metadata = {
        name: formData.certificateData,
        description: "Academic Certificate",
        image: imageCID,
        attributes: [{
          trait_type: "Course ID",
          value: formData.courseId
        }, {
          trait_type: "Grade",
          value: formData.grade
        }, {
          trait_type: "Issue Date",
          value: new Date().toISOString()
        }]
      };

      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      const metadataCID = await uploadToIPFS(metadataBlob, (progress) => {
        setUploadProgress(80 + (progress * 0.2)); // 80-100% for metadata upload
      });
      setMetadataCID(metadataCID);
      setUploadProgress(100);

      // 4. Add metadata to MFS - this is now optional and won't break the flow if it fails
      const metadataFileName = `${formData.certificateData.replace(/\s+/g, '_')}.json`;
      try {
        await addToMFS(metadataCID, metadataFileName);
      } catch (mfsError) {
        console.warn("Metadata MFS operation failed but continuing with minting:", mfsError);
        // Continue with the process - MFS operations are not critical
      }

      // 5. Mint the certificate on blockchain
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress.CertificateNFT,
        contractABI.CertificateNFT,
        signer
      );

      const tx = await contract.issueCertificate(
        formData.studentAddress,
        formData.courseId,
        formData.grade,
        `ipfs://${metadataCID}`
      );
      await tx.wait();

      setSuccess('Certificate issued successfully!');

      // Reset form
      setFormData({
        studentAddress: '',
        courseId: '',
        grade: '',
        certificateData: '',
      });
      setCertificateImage(null);
      setImagePreview(null);
      setUploadProgress(0);

    } catch (error) {
      console.error("Minting error:", error);
      if (error.message.includes('IPFS')) {
        setError('Failed to connect to IPFS. Please try again later.');
      } else if (error.message.includes('user rejected')) {
        setError('Transaction was rejected by user');
      } else {
        setError(error.message || "Failed to issue certificate");
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validate all fields
    Object.keys(formData).forEach(field => {
      validateField(field, formData[field]);
      if (validationErrors[field]) {
        isValid = false;
      }
    });

    // Validate image
    if (!certificateImage) {
      errors.certificateImage = 'Please select an image';
      isValid = false;
    }

    setValidationErrors(prev => ({
      ...prev,
      ...errors
    }));

    return isValid;
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900/50 dark:text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-green-900/50 dark:text-green-400">
          {success}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Student Address
          </label>
          <input
            type="text"
            name="studentAddress"
            value={formData.studentAddress}
            onChange={handleInputChange}
            placeholder="0x..."
            disabled={loading}
            className={`w-full px-4 py-2 rounded-lg bg-gray-700 border ${validationErrors.studentAddress && touchedFields.studentAddress
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-600 focus:ring-purple-500'
              } text-white placeholder-gray-400 focus:outline-none focus:ring-2`}
          />
          {validationErrors.studentAddress && touchedFields.studentAddress && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.studentAddress}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Course
          </label>
          <select
            name="courseId"
            value={formData.courseId}
            onChange={handleInputChange}
            disabled={loading || loadingCourses}
            className={`w-full px-4 py-2 rounded-lg bg-gray-700 border ${validationErrors.courseId && touchedFields.courseId
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-600 focus:ring-purple-500'
              } text-white focus:outline-none focus:ring-2`}
          >
            <option value="">Select a course</option>
            {loadingCourses ? (
              <option disabled>Loading courses...</option>
            ) : (
              courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))
            )}
          </select>
          {validationErrors.courseId && touchedFields.courseId && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.courseId}</p>
          )}
          {loadingCourses && (
            <div className="flex items-center mt-2 text-gray-400">
              <LoadingSpinner size="small" />
              <span className="ml-2">Loading courses...</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Grade
          </label>
          <input
            type="text"
            name="grade"
            value={formData.grade}
            onChange={handleInputChange}
            placeholder="A, B, C, D, F"
            disabled={loading}
            className={`w-full px-4 py-2 rounded-lg bg-gray-700 border ${validationErrors.grade && touchedFields.grade
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-600 focus:ring-purple-500'
              } text-white placeholder-gray-400 focus:outline-none focus:ring-2`}
          />
          {validationErrors.grade && touchedFields.grade && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.grade}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Certificate Title
          </label>
          <input
            type="text"
            name="certificateData"
            value={formData.certificateData}
            onChange={handleInputChange}
            placeholder="e.g. Computer Science Degree"
            disabled={loading}
            className={`w-full px-4 py-2 rounded-lg bg-gray-700 border ${validationErrors.certificateData && touchedFields.certificateData
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-600 focus:ring-purple-500'
              } text-white placeholder-gray-400 focus:outline-none focus:ring-2`}
          />
          {validationErrors.certificateData && touchedFields.certificateData && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.certificateData}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Certificate Image
          </label>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="certificate-image"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${validationErrors.certificateImage && touchedFields.certificateImage
                  ? 'border-red-500 hover:bg-red-900/10'
                  : 'border-gray-600 hover:bg-gray-700'
                }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-4 text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG or GIF (MAX. 5MB)
                </p>
              </div>
              <input
                id="certificate-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={loading}
                className="hidden"
              />
            </label>
          </div>
          {validationErrors.certificateImage && touchedFields.certificateImage && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.certificateImage}</p>
          )}
        </div>

        {imagePreview && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Preview
            </label>
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <img
                src={imagePreview}
                alt="Certificate preview"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-400 text-center">
              {uploadProgress < 50
                ? 'Uploading image...'
                : uploadProgress < 80
                  ? 'Processing metadata...'
                  : 'Minting certificate...'}
            </p>
          </div>
        )}

        <div className="flex justify-center mt-6">
          <button
            onClick={mintCertificate}
            disabled={loading}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <LoadingSpinner size="small" className="mr-2" />
                Processing...
              </span>
            ) : (
              'Mint Certificate'
            )}
          </button>
        </div>

        {metadataCID && imageCID && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <p className="text-green-400 mb-4">✅ Successfully saved to IPFS!</p>
            <div className="flex space-x-4">
              <a
                href={`${LOCAL_GATEWAY}/ipfs/${metadataCID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
              >
                View Metadata
              </a>
              <a
                href={`${LOCAL_GATEWAY}/ipfs/${imageCID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
              >
                View Image
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CertificateForm;
