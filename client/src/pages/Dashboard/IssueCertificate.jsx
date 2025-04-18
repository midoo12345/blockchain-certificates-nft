import React from 'react'
import CertificateForm from '../../components/IssueCerificate/CertificateForm'

const IssueCertificate = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-violet-950 py-6 px-4 pb-10 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-green-300">
            Issue New Certificate
          </h1>
          <p className="mt-1 text-xl text-gray-300 max-w-2xl mx-auto">
            Create and issue a new blockchain-based certificate with secure verification and permanent storage
          </p>
        </div>
        <div className="bg-gray-800/40 backdrop-blur-lg rounded p-8 border border-gray-700/50">
          <CertificateForm />
        </div>
      </div>
    </div>
  )
}

export default IssueCertificate