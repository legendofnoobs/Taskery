import React from 'react';
import usePasswordSecurity from '../../hooks/usePasswordSecurity';

const SecuritySettings = () => {
    const {
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmNewPassword,
        setConfirmNewPassword,
        loadingPassword,
        passwordError,
        handlePasswordChange
    } = usePasswordSecurity();

    return (
        <div className="bg-white dark:bg-zinc-800 dark:text-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
            <p className="text-gray-700 dark:text-white mb-4">Manage your account security.</p>

            {passwordError && <p className="text-red-500">{passwordError}</p>}

            <form className="space-y-4" onSubmit={handlePasswordChange}>
                <div>
                    <label htmlFor="currentPassword" className="block text-sm dark:text-white font-medium text-gray-700">Current Password</label>
                    <input
                        type="password"
                        id="currentPassword"
                        className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                        className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                        className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
};

export default SecuritySettings;