import { Cog } from 'lucide-react';

const SettingsLayout = ({ children }) => {
    return (
        <div className="md:ml-72 mt-8 px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold"><Cog className="w-6 h-6" /> Settings</h1>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
                {children}
            </div>
        </div>
    );
};

export default SettingsLayout;