// components/Certificate/CertificateImageUpload.jsx
import React from 'react';

function CertificateImageUpload({
    imagePreview,
    onImageUpload,
    loading,
    validationError,
    touched
}) {
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onImageUpload(file);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
                Certificate Image
            </label>
            <div className="relative">
                <input
                    type="file"
                    id="certificate-image"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="hidden"
                />
                <label
                    htmlFor="certificate-image"
                    className={`flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors ${validationError && touched
                        ? 'border-red-500'
                        : 'border-gray-600'
                        }`}
                >
                    {imagePreview ? (
                        <img
                            src={imagePreview}
                            alt="Certificate preview"
                            className="w-full h-full object-contain rounded-lg"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg
                                className="w-12 h-12 mb-4 text-gray-400"
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
                    )}
                </label>
            </div>
            {validationError && touched && (
                <p className="mt-2 text-sm text-red-400">{validationError}</p>
            )}
        </div>
    );
}

export default CertificateImageUpload;