import React from 'react';
import HeroImage from '../../assets/hero.svg';

const HowItWorks = () => {
    const steps = [
        {
            number: "01",
            title: "Connect Your Wallet",
            description: "Link your Ethereum wallet to start creating and managing blockchain-verified certificates",
            gradient: "from-blue-400 to-purple-400",
            bgColor: "bg-blue-500/10",
            textColor: "text-blue-400",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
            )
        },
        {
            number: "02",
            title: "Design Certificate",
            description: "Create beautiful certificates with our intuitive editor, add recipient details and customize the design",
            gradient: "from-purple-400 to-indigo-400",
            bgColor: "bg-purple-500/10",
            textColor: "text-purple-400",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            )
        },
        {
            number: "03",
            title: "Mint & Share",
            description: "Mint your certificate as an NFT on the blockchain and share it with recipients instantly",
            gradient: "from-indigo-400 to-blue-400",
            bgColor: "bg-indigo-500/10",
            textColor: "text-indigo-400",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    ];

    return (
        <section className="py-24   relative overflow-hidden">
            <img
                src={HeroImage}
                alt="Hero background"
                className="absolute top-0 left-0 w-full h-full object-cover opacity-60"
            />

            <div className="max-w-4xl mx-auto text-center mb-20 relative z-10">
                <h2 className="text-5xl font-bold leading-tight pb-4 bg-gradient-to-r from-blue-300 via-purple-300 to-indigo-300 text-transparent bg-clip-text">
                    How It Works
                </h2>
                <p className="max-w-2xl mx-auto text-lg leading-relaxed text-gray-300 backdrop-blur-sm px-4">
                    Transform your certificates into verifiable digital assets on the blockchain in three simple steps
                </p>
            </div>

            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
                    {/* Connecting line */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20"></div>

                    {/* Steps */}
                    {steps.map((step, index) => (
                        <div key={index} className="group relative  ">
                            <div className="relative p-8  ring-1 ring-gray-800/50 rounded-sm backdrop-blur-xl 
                           transition-all duration-300 hover:ring-purple-500/50 
                           hover:transform hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10">
                                <div className="flex items-center justify-between mb-6">
                                    <span className={`text-5xl font-bold bg-gradient-to-r ${step.gradient} text-transparent bg-clip-text`}>
                                        {step.number}
                                    </span>
                                    <div className={`w-12 h-12 rounded-full ${step.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <div className={step.textColor}>
                                            {step.icon}
                                        </div>
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors">
                                    {step.title}
                                </h3>
                                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;