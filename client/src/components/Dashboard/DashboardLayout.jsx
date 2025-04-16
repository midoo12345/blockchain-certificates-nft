import React from 'react';
import { Outlet } from "react-router-dom";
import Navbar from '../Shared/Navbar';
import Sidebar from '../Shared/Sidebar';

const DashboardLayout = () => {
    return (
        <div className="min-h-screen bg-gray-950">
            <div className="sticky top-0 z-50">
                <Navbar />
            </div>

            <div className="flex">
                <div className="flex-none">
                    <Sidebar />
                </div>
                <div className="flex-grow p-6 transition-all duration-300">
                    <div className="  rounded-lg shadow-md p-6">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;