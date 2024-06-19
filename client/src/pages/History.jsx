import React, { useState } from 'react'
import Sidebar from '../components/global_components/Sidebar';
import Table from '../components/history/Table';
import Pagination from '../components/history/Pagination';

function History() {
    const [activeLink, setActiveLink] = useState('profile');

    const handleSidebarLinkClick = (link) => {
        setActiveLink(link);
    };

    return (
        <div className="flex h-screen">
            <Sidebar onLinkClick={handleSidebarLinkClick} activeLink={activeLink} />
            <div className="flex flex-col w-full p-6 bg-white shadow-md rounded-lg">
                <h1 className="text-2xl font-semibold mb-4">History</h1>
                <div className="w-11/12 overflow-hidden mt-5">
                    <Table />
                </div>
                <div className="flex justify-end mt-8 w-11/12">
                    <Pagination />
                </div>
            </div>
        </div>
    )
}

export default History