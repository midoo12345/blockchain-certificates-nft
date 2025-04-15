import React from 'react';

const HowItWorks = () => {
    return (
        <section className="py-16 lg:py-24  bg-gradient-to-br to-[#110728]  from-[#09042c]">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl  ">
                        How Certificate NFTs Work
                    </h2>
                    <p className="max-w-lg mx-auto mt-4 text-base leading-relaxed text-gray-300">
                        Create, verify, and share blockchain-backed certificates in three simple steps. Our platform makes credential management secure and transparent.
                    </p>
                </div>

                <div className="relative mt-16 lg:mt-24">
                    {/* Connection line */}
                    <div className="absolute inset-x-0 hidden md:block top-12 md:px-20 lg:px-28 xl:px-44">
                        <svg className="w-full" viewBox="0 0 900 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 21C40.6667 9.66666 188.4 -8.80001 448 21C707.6 50.8 862.667 31.3333 898 21"
                                stroke="url(#paint0_linear)" strokeWidth="3" strokeDasharray="8 8" />
                            <defs>
                                <linearGradient id="paint0_linear" x1="2" y1="21" x2="898" y2="21" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#bb3bf6" stopOpacity="0.2" />
                                    <stop offset="0.5" stopColor="#977aff" />
                                    <stop offset="1" stopColor="#3B82F6" stopOpacity="0.2" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <div className="relative grid grid-cols-1 gap-y-12 md:grid-cols-3 gap-x-12 ">
                        {/* Step 1 */}
                        <div className="relative flex flex-col items-center">
                            <div className="flex items-center justify-center w-16 h-20 bg-violet-600   rounded-full shadow-lg shadow-violet-600/30">
                                <span className="text-2xl font-bold text-white">1</span>
                            </div>
                            <div className="p-6 mt-10 bg-violet-600/10 rounded-md text-center h-full">
                                <div className="flex justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold leading-tight text-white">Connect Your Wallet</h3>
                                <p className="mt-4 text-gray-300">
                                    Link your Ethereum wallet to access our platform and get ready to create or receive verifiable digital certificates as NFTs.
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative flex flex-col items-center">
                            <div className="flex items-center justify-center w-16 h-20 bg-violet-600 rounded-full shadow-lg shadow-violet-600/30">
                                <span className="text-2xl font-bold text-white">2</span>
                            </div>
                            <div className="p-6 mt-10 bg-violet-600/10 rounded-md text-center h-full">
                                <div className="flex justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold leading-tight text-white">Create Certificate</h3>
                                <p className="mt-4 text-gray-300">
                                    Design your certificate with our intuitive interface. Add recipient details, achievements, credentials, and customize the appearance.
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative flex flex-col items-center">
                            <div className="flex items-center justify-center w-16 h-20 bg-violet-600 rounded-full shadow-lg shadow-violet-600/30">
                                <span className="text-2xl font-bold text-white">3</span>
                            </div>
                            <div className="p-6 mt-10  bg-violet-600/10 rounded-md text-center h-full">
                                <div className="flex justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold leading-tight text-white">Mint & Share</h3>
                                <p className="mt-4 text-gray-300">
                                    Mint your certificate as an NFT on the blockchain. Once minted, it can be easily shared, verified, and displayed in digital wallets.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom features section */}
                    <div className="grid grid-cols-1 gap-y-8 mt-16 md:grid-cols-2 lg:grid-cols-4 gap-x-6">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center w-10 h-10 bg-violet-600 rounded-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h4 className="text-base font-semibold text-white">Secure & Tamper-proof</h4>
                                <p className="mt-1 text-sm text-gray-300">Blockchain technology ensures your certificates cannot be forged or altered.</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center w-10 h-10 bg-violet-600 rounded-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h4 className="text-base font-semibold text-white">Globally Accessible</h4>
                                <p className="mt-1 text-sm text-gray-300">Access and verify certificates from anywhere in the world, anytime.</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center w-10 h-10 bg-violet-600 rounded-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h4 className="text-base font-semibold text-white">Instant Verification</h4>
                                <p className="mt-1 text-sm text-gray-300">Verify certificates instantly with our built-in blockchain verification system.</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center w-10 h-10 bg-violet-600 rounded-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h4 className="text-base font-semibold text-white">Digital Ownership</h4>
                                <p className="mt-1 text-sm text-gray-300">Recipients truly own their certificates as digital assets on the blockchain.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;