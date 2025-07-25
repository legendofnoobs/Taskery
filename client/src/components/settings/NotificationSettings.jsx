import React from 'react';
import useNotificationSettings from '../../hooks/useNotificationSettings';

const NotificationSettings = () => {
    const {
        emailNotifications,
        setEmailNotifications,
        pushNotifications,
        setPushNotifications,
        saveNotificationPreferences
    } = useNotificationSettings();

    return (
        <div className="bg-white dark:bg-zinc-800 dark:text-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
            <p className="text-gray-700 dark:text-white mb-4">Control how you receive notifications.</p>
            <div className="space-y-4">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="emailNotifications"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                    />
                    <label htmlFor="emailNotifications" className="ml-2 dark:text-white block text-sm text-gray-900">Email notifications</label>
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="pushNotifications"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={pushNotifications}
                        onChange={(e) => setPushNotifications(e.target.checked)}
                    />
                    <label htmlFor="pushNotifications" className="ml-2 dark:text-white block text-sm text-gray-900">Push notifications</label>
                </div>
                <button
                    type="button"
                    onClick={saveNotificationPreferences}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    Save Notification Preferences
                </button>
                <p className="text-gray-500 text-sm mt-2">to be added later</p>
            </div>
        </div>
    );
};

export default NotificationSettings;