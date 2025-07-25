import useProfileSettings from '../../hooks/useProfileSettings';

const ProfileSettings = () => {
    const {
        profileData,
        loadingProfile,
        profileError,
        handleProfileChange,
        handleProfileSubmit
    } = useProfileSettings();

    return (
        <div className="bg-white dark:bg-zinc-800 dark:text-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
            <p className="text-gray-700 mb-4 dark:text-white">Manage your public profile information.</p>

            {loadingProfile && <p className="text-gray-500">Loading profile...</p>}
            {profileError && <p className="text-red-500">{profileError}</p>}

            {!loadingProfile && (
                <form className="space-y-4" onSubmit={handleProfileSubmit}>
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-white">First Name</label>
                        <input
                            type="text"
                            id="firstName"
                            className="mt-1 block w-full border dark:border-zinc-700 border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                            className="mt-1 block w-full border dark:border-zinc-700 border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                            className="mt-1 block w-full border dark:border-zinc-700 border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                            className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
};

export default ProfileSettings;