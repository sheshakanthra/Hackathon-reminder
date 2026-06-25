import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">HackReminder</span>
                    </Link>

                    {/* Desktop Menu */}
                    {user && (
                        <div className="hidden md:flex md:items-center md:space-x-8">
                            <Link to="/" className="text-gray-700 hover:text-indigo-600 font-medium text-sm transition flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 10v10a1 1 0 001 1h12a1 1 0 001-1V10M9 21h6" />
                                </svg>
                                <span>Dashboard</span>
                            </Link>
                            <Link to="/workflow" className="text-gray-700 hover:text-indigo-600 font-medium text-sm transition flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0v10" />
                                </svg>
                                <span>Workflow <span className="text-indigo-500 font-black">✦</span></span>
                            </Link>
                            <Link to="/add" className="text-gray-700 hover:text-indigo-600 font-medium text-sm transition flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Add Hackathon</span>
                            </Link>
                        </div>
                    )}

                    {/* Right Section */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                {/* User Info - Hidden on Mobile */}
                                <div className="hidden md:flex md:items-center md:space-x-3 md:border-r md:border-gray-300 md:pr-4">
                                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                </div>

                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    className="hidden md:inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-lg font-medium text-sm transition space-x-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span>Logout</span>
                                </button>

                                {/* Mobile Menu Button */}
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
                                >
                                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/login" className="text-gray-700 hover:text-indigo-600 font-medium text-sm transition">
                                    Login
                                </Link>
                                <Link to="/signup" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Menu */}
                {user && mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 py-4 space-y-3">
                        <Link
                            to="/"
                            className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded-lg transition"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/workflow"
                            className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded-lg transition"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Workflow <span className="text-indigo-500 font-black">✦</span>
                        </Link>
                        <Link
                            to="/add"
                            className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded-lg transition"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Add Hackathon
                        </Link>
                        <div className="border-t border-gray-200 pt-3">
                            <div className="px-4 py-2 mb-3">
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setMobileMenuOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium text-sm"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
