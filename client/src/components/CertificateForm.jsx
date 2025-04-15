import React, { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import contractAddress from '../config/contractAddress.json';
import contractABI from '../config/abi.json';
import { uploadToIPFS, addToMFS } from '../utils/ipfs';
import { validateEthereumAddress, validateGrade } from '../utils/validation';
import LoadingSpinner from './Shard/LoadingSpinner';
import './CertificateForm.css';

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
    <div className="certificate-form">
      <h2>Issue New Certificate</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="form-group">
        <label className="form-label">Student Address:</label>
        <input
          type="text"
          name="studentAddress"
          value={formData.studentAddress}
          onChange={handleInputChange}
          placeholder="0x..."
          disabled={loading}
          className={`form-input ${validationErrors.studentAddress && touchedFields.studentAddress ? 'is-invalid' : ''}`}
        />
        {validationErrors.studentAddress && touchedFields.studentAddress && (
          <div className="form-feedback is-invalid">{validationErrors.studentAddress}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Course:</label>
        <select
          name="courseId"
          value={formData.courseId}
          onChange={handleInputChange}
          disabled={loading || loadingCourses}
          className={`form-input ${validationErrors.courseId && touchedFields.courseId ? 'is-invalid' : ''}`}
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
          <div className="form-feedback is-invalid">{validationErrors.courseId}</div>
        )}
        {loadingCourses && (
          <div className="loading-courses">
            <LoadingSpinner size="small" />
            <span>Loading courses...</span>
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Grade:</label>
        <input
          type="text"
          name="grade"
          value={formData.grade}
          onChange={handleInputChange}
          placeholder="A, B, C, D, F"
          disabled={loading}
          className={`form-input ${validationErrors.grade && touchedFields.grade ? 'is-invalid' : ''}`}
        />
        {validationErrors.grade && touchedFields.grade && (
          <div className="form-feedback is-invalid">{validationErrors.grade}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Certificate Title:</label>
        <input
          type="text"
          name="certificateData"
          value={formData.certificateData}
          onChange={handleInputChange}
          placeholder="e.g. Computer Science Degree"
          disabled={loading}
          className={`form-input ${validationErrors.certificateData && touchedFields.certificateData ? 'is-invalid' : ''}`}
        />
        {validationErrors.certificateData && touchedFields.certificateData && (
          <div className="form-feedback is-invalid">{validationErrors.certificateData}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Certificate Image:</label>
        <div className="form-file">
          <input
            type="file"
            id="certificate-image"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={loading}
            className={`form-file-input ${validationErrors.certificateImage && touchedFields.certificateImage ? 'is-invalid' : ''}`}
          />
          <label htmlFor="certificate-image" className="form-file-label">
            {certificateImage?.name || "Select Image (PNG/JPG/GIF, max 5MB)"}
          </label>
        </div>
        {validationErrors.certificateImage && touchedFields.certificateImage && (
          <div className="form-feedback is-invalid">{validationErrors.certificateImage}</div>
        )}
      </div>

      {imagePreview && (
        <div className="image-preview">
          <img src={imagePreview} alt="Certificate preview" />
        </div>
      )}

      {loading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <div className="progress-text">
            {uploadProgress < 50 ? 'Uploading image...' :
              uploadProgress < 80 ? 'Processing metadata...' :
                'Minting certificate...'}
          </div>
        </div>
      )}

      <div className="form-actions">
        <button
          onClick={mintCertificate}
          disabled={loading}
          className="btn submit-btn"
        >
          {loading ? 'Processing...' : 'Mint Certificate'}
        </button>
      </div>

      {metadataCID && imageCID && (
        <div className="ipfs-links">
          <p className="success-message">✅ Successfully saved to IPFS!</p>

          <div className="ipfs-link">
            <a
              href={`${LOCAL_GATEWAY}/ipfs/${metadataCID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              View Metadata
            </a>
          </div>

          <div className="ipfs-link">
            <a
              href={`${LOCAL_GATEWAY}/ipfs/${imageCID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              View Image
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default CertificateForm;
