import React from 'react';
import { User, Shield, Bell } from 'lucide-react';

const SettingsNav = ({ activeSetting, setActiveSetting }) => {
    const navItems = [
        { name: 'Profile', icon: User, key: 'profile' },
        { name: 'Security', icon: Shield, key: 'security' },
        { name: 'Notifications', icon: Bell, key: 'notifications' },
    ];

    return (
        <div className="md:w-1/4 bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-sm h-fit min-h-fit">
            <nav className="space-y-2">
                {navItems.map((item) => (
                    <button
                        key={item.key}
                        onClick={() => setActiveSetting(item.key)}
                        className={`flex items-center gap-2 w-full text-left px-4 py-2 rounded-full transition-colors ${
                            activeSetting === item.key
                                ? 'bg-blue-300 text-blue-800 dark:bg-zinc-700 dark:text-white font-semibold'
                                : ' hover:bg-blue-200 dark:hover:text-white dark:hover:bg-zinc-700'
                        }`}
                    >
                        <item.icon className="w-5 h-5" /> {item.name}
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default SettingsNav;