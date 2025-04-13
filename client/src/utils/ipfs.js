// IPFS file handling utilities
// We'll use a combination of approaches to make this work

// Primary IPFS API endpoint (localhost)
const IPFS_API = 'http://127.0.0.1:5006/api/v0';

// Public gateway as fallback (for viewing files)
const PUBLIC_GATEWAY = 'https://ipfs.io/ipfs';
const LOCAL_GATEWAY = 'http://127.0.0.1:8084/ipfs';

/**
 * Helper function to perform API requests with retry
 */
const callIpfsApi = async (endpoint, options = {}, retries = 3) => {
  let attempt = 0;
  
  while (attempt < retries) {
    try {
      const xhr = new XMLHttpRequest();
      const url = `${IPFS_API}/${endpoint}`;
      
      return new Promise((resolve, reject) => {
        xhr.open(options.method || 'POST', url);
        
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              // Try to parse as JSON first
              const contentType = xhr.getResponseHeader('Content-Type');
              if (contentType && contentType.includes('application/json')) {
                const json = JSON.parse(xhr.responseText);
                resolve(json);
              } else {
                // Return as text if not JSON
                resolve(xhr.responseText);
              }
            } catch (error) {
              // If JSON parsing fails, return as text
              resolve(xhr.responseText);
            }
          } else {
            reject(new Error(`HTTP error: ${xhr.status} ${xhr.statusText || ''}`));
          }
        };
        
        xhr.onerror = function() {
          reject(new Error('Network error'));
        };
        
        if (options.onProgress && xhr.upload) {
          xhr.upload.onprogress = options.onProgress;
        }
        
        xhr.send(options.body);
      });
    } catch (error) {
      attempt++;
      if (attempt >= retries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

/**
 * Upload a file or data to IPFS
 * @param {File|Blob} file - The file to upload
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<string>} - CID of the uploaded file
 */
export const uploadToIPFS = async (file, onProgress = () => {}) => {
  try {
    console.log(`Uploading file to IPFS: ${file.name || 'unnamed file'}`);
    
    // Create FormData with the file
    const formData = new FormData();
    formData.append('file', file);
    
    const progressHandler = (event) => {
      if (event.lengthComputable) {
        const progress = event.loaded / event.total;
        onProgress(progress);
      }
    };
    
    const response = await callIpfsApi('add?pin=true', {
      method: 'POST',
      body: formData,
      onProgress: progressHandler
    });
    
    const cid = response.Hash;
    console.log(`File uploaded to IPFS with CID: ${cid}`);
    
    onProgress(1.0); // Mark as complete
    return cid;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw new Error(`IPFS upload failed: ${error.message}`);
  }
};

/**
 * Add a file to IPFS MFS (Mutable File System)
 * @param {string} cid - The CID of the file
 * @param {string} filename - The filename to use in MFS
 * @returns {Promise<boolean>} - Whether the operation succeeded
 */
export const addToMFS = async (cid, filename) => {
  try {
    console.log(`Adding file to MFS: ${filename}`);
    
    // First, ensure the directory exists
    try {
      await callIpfsApi('files/mkdir?arg=/my-certificates&parents=true', {
        method: 'POST'
      });
      console.log("Created or verified /my-certificates directory in MFS");
    } catch (dirError) {
      console.warn("Failed to create MFS directory, but continuing:", dirError.message);
    }
    
    // Clean up the filename
    const cleanFilename = filename.replace(/\s+/g, '_');
    const encodedFilename = encodeURIComponent(cleanFilename);
    
    // Copy the file to MFS
    const endpoint = `files/cp?arg=/ipfs/${cid}&arg=/my-certificates/${encodedFilename}`;
    await callIpfsApi(endpoint, { method: 'POST' });
    
    console.log(`File added to MFS: /my-certificates/${cleanFilename}`);
    console.log(`You can view it in IPFS Desktop under Files > /my-certificates/${cleanFilename}`);
    
    return true;
  } catch (error) {
    console.warn("Failed to add file to MFS:", error.message);
    console.log("This is non-critical - the file is still available via its CID");
    return false;
  }
};

/**
 * Get a URL for an IPFS resource that works in the browser
 * @param {string} cid - The CID of the file
 * @returns {string} - URL to access the file
 */
export const getIpfsUrl = (cid) => {
  if (!cid) return '';
  
  // Try local gateway first, fallback to public
  return `${LOCAL_GATEWAY}/${cid}`;
}; 