import React from 'react'
import CertificateForm from '../../components/CertificateForm'

const IssueCertificate = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Issue New Certificate
          </h1>
          <p className="mt-4 text-xl text-gray-300 max-w-2xl mx-auto">
            Create and issue a new blockchain-based certificate with secure verification and permanent storage
          </p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-gray-700/50">
          <CertificateForm />
        </div>
      </div>
    </div>
  )
}

export default IssueCertificate