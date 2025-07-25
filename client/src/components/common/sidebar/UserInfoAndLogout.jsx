import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../../context/useAuth'; // Adjust path as needed
import { useNavigate } from 'react-router-dom';

const UserInfoAndLogout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="text-sm text-gray-600 dark:text-white border-t border-gray-400 dark:border-zinc-700 pt-4"> {/* Adjusted border for light theme */}
            {user && (
                <div className="mb-3 flex items-center">
                    <div>
                        <img
                            src={user.avatarUrl || `https://placehold.co/40x40/cccccc/333333?text=${user.firstName.charAt(0)}`}
                            alt="avatar"
                            className="w-10 h-10 rounded-full object-cover mr-2"
                        />
                    </div>
                    <div>
                        <div className="font-semibold">{user.firstName} {user.lastName}</div>
                        <div className="text-xs text-gray-500 dark:text-zinc-400">{user.email}</div>
                    </div>
                </div>
            )}
            <button
                className="flex items-center justify-start gap-x-3 w-full text-center px-3 py-2 rounded-full hover:bg-red-600 text-red-500 hover:text-white transition-colors"
                onClick={handleLogout}
            >
                <LogOut /> Logout
            </button>
        </div>
    );
};

export default UserInfoAndLogout;
