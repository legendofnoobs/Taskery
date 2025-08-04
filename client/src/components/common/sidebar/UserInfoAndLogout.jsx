import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Cog, Github, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../../context/useAuth'; // Adjust path as needed
import { useNavigate } from 'react-router-dom';

const UserInfoAndLogout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsDropdownOpen(false); // Close dropdown after logout
    };

    const handleSettingsClick = () => {
        navigate('/dashboard/settings');
        setIsDropdownOpen(false); // Close dropdown after navigation
    };

    const handleGithubClick = () => {
        window.open('https://github.com/legendofnoobs/Taskery', '_blank', 'noopener noreferrer');
        setIsDropdownOpen(false); // Close dropdown after opening link
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(prev => !prev);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative text-sm text-gray-600 dark:text-white border-t border-gray-400 dark:border-zinc-700 pt-4" ref={dropdownRef}>
            {user && (
                <button
                    onClick={toggleDropdown}
                    className="flex items-center justify-between w-full p-2 rounded-full hover:bg-blue-200 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <div className="flex items-center">
                        <img
                            src={user.avatarUrl || `https://placehold.co/40x40/cccccc/333333?text=${user.firstName ? user.firstName.charAt(0) : 'U'}`}
                            alt="avatar"
                            className="w-10 h-10 rounded-full object-cover mr-2"
                        />
                        <div className="text-left">
                            <div className="font-semibold">{user.firstName} {user.lastName}</div>
                            <div className="text-xs text-gray-500 dark:text-zinc-400">{user.email}</div>
                        </div>
                    </div>
                </button>
            )}

            {isDropdownOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-zinc-800 rounded-lg shadow-lg py-2 z-50 border border-gray-300 dark:border-zinc-700">
                    <button
                        onClick={handleSettingsClick}
                        className="flex items-center gap-x-3 w-full text-left px-4 py-2 text-gray-700 dark:text-white hover:bg-blue-100 dark:hover:bg-zinc-700 transition-colors"
                    >
                        <Cog size={20} /> Settings
                    </button>
                    <button
                        onClick={handleGithubClick}
                        className="flex items-center gap-x-3 w-full text-left px-4 py-2 text-gray-700 dark:text-white hover:bg-blue-100 dark:hover:bg-zinc-700 transition-colors"
                    >
                        <Github size={20} /> Leave a star
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-x-3 w-full text-left px-4 py-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                    >
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserInfoAndLogout;
