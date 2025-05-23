// components/Shared/ErrorMessage.jsx
import React from 'react';

function ErrorMessage({ message }) {
    return (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
            <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{message}</span>
            </div>
        </div>
    );
}

export default ErrorMessage;