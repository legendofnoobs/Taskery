/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { Cog, User, Shield, Bell } from 'lucide-react'; // Import additional icons
import axios from 'axios'; // Import axios for API calls
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Settings = () => {
    // State to manage the active settings section
    const [activeSetting, setActiveSetting] = useState('profile'); // Default to 'profile'

    // State for user profile data
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        avatarUrl: ''
    });
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [profileError, setProfileError] = useState(null);
    const [profileMessage, setProfileMessage] = useState(null); // For success/error messages after update

    // States for password change
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState(null);
    const [passwordMessage, setPasswordMessage] = useState(null);

    const token = localStorage.getItem('token'); // Get token from localStorage

    // Fetch user profile data on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            setLoadingProfile(true);
            setProfileError(null);
            try {
                if (!token) {
                    setProfileError('Authentication token not found. Please log in.');
                    setLoadingProfile(false);
                    return;
                }
                const res = await axios.get(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfileData({
                    firstName: res.data.firstName || '',
                    lastName: res.data.lastName || '',
                    email: res.data.email || '',
                    avatarUrl: res.data.avatarUrl || ''
                });
            } catch (err) {
                console.error('Failed to fetch profile:', err);
                setProfileError(err.response?.data?.message || 'Failed to load profile data.');
            } finally {
                setLoadingProfile(false);
            }
        };
        fetchProfile();
    }, [token]); // Re-fetch if token changes

    // Handle profile form changes
    const handleProfileChange = (e) => {
        const { id, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    // Handle profile form submission
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoadingProfile(true);
        setProfileError(null);
        setProfileMessage(null);

        try {
            if (!token) {
                setProfileError('Authentication token not found. Please log in.');
                setLoadingProfile(false);
                return;
            }

            const res = await axios.put(`${API_URL}/auth/me`, profileData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // setProfileMessage(res.data.message || 'Profile updated successfully!');
            // Update profileData with the response to ensure consistency if backend sends back updated user
            setProfileData(prev => ({
                ...prev,
                firstName: res.data.user.firstName,
                lastName: res.data.user.lastName,
                email: res.data.user.email,
                avatarUrl: res.data.user.avatarUrl
            }));
            toast.success("Profile Updated!")
        } catch (err) {
            console.error('Failed to update profile:', err);
            setProfileError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoadingProfile(false);
        }
    };

    // Handle password change form submission
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setLoadingPassword(true);
        setPasswordError(null);
        setPasswordMessage(null);

        if (newPassword !== confirmNewPassword) {
            setPasswordError('New password and confirmation do not match.');
            setLoadingPassword(false);
            return;
        }

        try {
            if (!token) {
                setPasswordError('Authentication token not found. Please log in.');
                setLoadingPassword(false);
                return;
            }

            const res = await axios.put(`${API_URL}/auth/me`, {
                currentPassword, // You might need to adjust your backend to accept currentPassword for validation
                password: newPassword // The backend expects 'password' for the new password
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // setPasswordMessage(res.data.message || 'Password updated successfully!');
            toast.success("Password Updated!")
            // Clear password fields on success
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err) {
            console.error('Failed to change password:', err);
            setPasswordError(err.response?.data?.message || 'Failed to change password. Please check your current password.');
        } finally {
            setLoadingPassword(false);
        }
    };


    // Helper function to render content based on activeSetting
    const renderSettingsContent = () => {
        switch (activeSetting) {
            case 'profile':
                return (
                    <div className="bg-white dark:bg-zinc-800 dark:text-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
                        <p className="text-gray-700 mb-4 dark:text-white">Manage your public profile information.</p>

                        {loadingProfile && <p className="text-gray-500">Loading profile...</p>}
                        {profileError && <p className="text-red-500">{profileError}</p>}
                        {profileMessage && <p className="text-green-600">{profileMessage}</p>}

                        {!loadingProfile && (
                            <form className="space-y-4" onSubmit={handleProfileSubmit}>
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-white">First Name</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        className="mt-1 block w-full border dark:border-zinc-700 border-gray-300 rounded-md shadow-sm p-2"
                                        placeholder="Your First Name"
                                        value={profileData.firstName}
                                        onChange={handleProfileChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-white">Last Name</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        className="mt-1 block w-full border dark:border-zinc-700 border-gray-300 rounded-md shadow-sm p-2"
                                        placeholder="Your Last Name"
                                        value={profileData.lastName}
                                        onChange={handleProfileChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-white">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="mt-1 block w-full border dark:border-zinc-700 border-gray-300 rounded-md shadow-sm p-2"
                                        placeholder="your@example.com"
                                        value={profileData.email}
                                        onChange={handleProfileChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 dark:text-white">Avatar URL</label>
                                    <input
                                        type="text"
                                        id="avatarUrl"
                                        className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2"
                                        placeholder="https://example.com/avatar.jpg"
                                        value={profileData.avatarUrl}
                                        onChange={handleProfileChange}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    disabled={loadingProfile}
                                >
                                    {loadingProfile ? 'Saving...' : 'Save Profile'}
                                </button>
                            </form>
                        )}
                    </div>
                );
            case 'security':
                return (
                    <div className="bg-white dark:bg-zinc-800 dark:text-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
                        <p className="text-gray-700 dark:text-white mb-4">Manage your account security.</p>

                        {passwordError && <p className="text-red-500">{passwordError}</p>}
                        {passwordMessage && <p className="text-green-600">{passwordMessage}</p>}

                        <form className="space-y-4" onSubmit={handlePasswordChange}>
                            <div>
                                <label htmlFor="currentPassword" className="block text-sm dark:text-white font-medium text-gray-700">Current Password</label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="newPassword" className="block text-sm dark:text-white font-medium text-gray-700">New Password</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmNewPassword" className="block text-sm dark:text-white font-medium text-gray-700">Confirm New Password</label>
                                <input
                                    type="password"
                                    id="confirmNewPassword"
                                    className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                                disabled={loadingPassword}
                            >
                                {loadingPassword ? 'Changing...' : 'Change Password'}
                            </button>
                        </form>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="bg-white dark:bg-zinc-800 dark:text-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
                        <p className="text-gray-700 dark:text-white mb-4">Control how you receive notifications.</p>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input type="checkbox" id="emailNotifications" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                <label htmlFor="emailNotifications" className="ml-2 dark:text-white block text-sm text-gray-900">Email notifications</label>
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" id="pushNotifications" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                <label htmlFor="pushNotifications" className="ml-2 dark:text-white block text-sm text-gray-900">Push notifications</label>
                            </div>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Save Notification Preferences
                            </button>
                            <p className="text-gray-500 text-sm mt-2">to be added later</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="md:ml-72 mt-8 px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold"><Cog className="w-6 h-6" /> Settings</h1>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation for Settings */}
                <div className="md:w-1/4 bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-sm h-fit min-h-fit">
                    <nav className="space-y-2">
                        <button
                            onClick={() => setActiveSetting('profile')}
                            className={`flex items-center gap-2 w-full text-left px-4 py-2 rounded-md transition-colors ${activeSetting === 'profile' ? 'bg-blue-100 text-blue-700 dark:bg-zinc-700 dark:text-white font-semibold' : 'text-gray-700 hover:bg-gray-300'}`}
                        >
                            <User className="w-5 h-5" /> Profile
                        </button>
                        <button
                            onClick={() => setActiveSetting('security')}
                            className={`flex items-center gap-2 w-full text-left px-4 py-2 rounded-md transition-colors ${activeSetting === 'security' ? 'bg-blue-100 text-blue-700 dark:bg-zinc-700 dark:text-white font-semibold' : 'text-gray-700 hover:bg-gray-300'}`}
                        >
                            <Shield className="w-5 h-5" /> Security
                        </button>
                        <button
                            onClick={() => setActiveSetting('notifications')}
                            className={`flex items-center gap-2 w-full text-left px-4 py-2 rounded-md transition-colors ${activeSetting === 'notifications' ? 'bg-blue-100 text-blue-700 dark:bg-zinc-700 dark:text-white font-semibold' : 'text-gray-700 hover:bg-gray-300'}`}
                        >
                            <Bell className="w-5 h-5" /> Notifications
                        </button>
                    </nav>
                </div>

                {/* Main Content Area for Settings */}
                <div className="md:w-3/4">
                    {renderSettingsContent()}
                </div>
            </div>
        </div>
    );
}

export default Settings;
