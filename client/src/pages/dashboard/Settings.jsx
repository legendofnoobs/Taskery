import { useState } from 'react';

// Import the new components
import SettingsNav from '../../components/settings/SettingsNav';
import ProfileSettings from '../../components/settings/ProfileSettings';
import SecuritySettings from '../../components/settings/SecuritySettings';
import NotificationSettings from '../../components/settings/NotificationSettings';
import SettingsLayout from '../../components/settings/SettingsLayout'; // If you chose to create it

const Settings = () => {
    // State to manage the active settings section
    const [activeSetting, setActiveSetting] = useState('profile'); // Default to 'profile'

    // Helper function to render content based on activeSetting
    const renderSettingsContent = () => {
        switch (activeSetting) {
            case 'profile':
                return <ProfileSettings />;
            case 'security':
                return <SecuritySettings />;
            case 'notifications':
                return <NotificationSettings />;
            default:
                return null;
        }
    };

    return (
        <SettingsLayout> {/* Use the layout component */}
            {/* Sidebar Navigation for Settings */}
            <SettingsNav activeSetting={activeSetting} setActiveSetting={setActiveSetting} />

            {/* Main Content Area for Settings */}
            <div className="md:w-3/4">
                {renderSettingsContent()}
            </div>
        </SettingsLayout>
    );
}

export default Settings;