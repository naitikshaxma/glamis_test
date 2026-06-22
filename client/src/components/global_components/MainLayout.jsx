import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { SidebarContext } from "../../hooks/SideBarContextHook";
import logo from "../../assets/logo.png";

// Portal shell: fixed Sidebar + offset content. When the sidebar is collapsed,
// a top bar with horizontal nav is shown. Extracted from App.jsx so the
// pre-interview lobby can reuse the exact same portal chrome.
// eslint-disable-next-line react/prop-types
const MainLayout = ({ children, locked = false }) => {
    const { isOpen, toggleSidebar } = useContext(SidebarContext);
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const navItems = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Profile', href: '/profile' },
        { name: 'My Interviews', href: '/myInterview' },
        { name: 'History', href: '/history' },
        { name: 'Feedback', href: '/feedback' },
        { name: 'Our Team', href: '/team' }
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar locked={locked} />
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'ml-[16.5rem]' : 'ml-0'}`}>
                {!isOpen && (
                    <div className="h-16 px-6 bg-white shadow-sm flex items-center justify-between border-b border-gray-200 sticky top-0 z-30">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleSidebar}
                                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors focus:outline-none"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            </button>
                            <div className="flex items-center gap-3">
                                <img src={logo} alt="GLAMIS Logo" className="h-9 w-9 object-contain" />
                                <div className="text-left">
                                    <h2 className="font-bold text-gray-800 leading-tight text-sm">
                                        GLAMIS
                                    </h2>
                                    <p className="text-gray-500 text-[10px] font-medium tracking-wide">
                                        Student Portal
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Horizontal Nav Links */}
                        <div className="flex items-center gap-1">
                            {navItems.map((item, idx) => (
                                locked ? (
                                    <span
                                        key={idx}
                                        title="Finish or exit your interview to navigate"
                                        className="px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap text-gray-400 opacity-50 cursor-not-allowed"
                                    >
                                        {item.name}
                                    </span>
                                ) : (
                                    <Link
                                        to={item.href}
                                        key={idx}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                                            isActive(item.href)
                                                ? 'bg-green-50 text-green-700 font-semibold'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        {item.name}
                                    </Link>
                                )
                            ))}
                        </div>
                    </div>
                )}
                <div className="flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
