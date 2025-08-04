import useSidebarToggle from '../../hooks/useSidebarToggle';

// Import new components
import SidebarToggleButton from './sidebar/SidebarToggleButton';
import SidebarNav from './sidebar/SidebarNav';
import FavoriteProjectsList from './sidebar/FavoriteProjectsList';
import UserInfoAndLogout from './sidebar/UserInfoAndLogout';

const Sidebar = () => {
    const { isOpen, toggleSidebar, closeSidebar } = useSidebarToggle();

    return (
        <>
            {/* Toggle Button */}
            <SidebarToggleButton isOpen={isOpen} toggleSidebar={toggleSidebar} />

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-full w-72 bg-gray-300 dark:text-white dark:bg-zinc-800 border-r border-gray-400 dark:border-zinc-700 transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
            >
                <div className="p-4 space-y-4 flex flex-col h-full justify-between">
                    <div>
                        {/* Main Navigation */}
                        <SidebarNav closeSidebar={closeSidebar} />

                        {/* Favorite Projects */}
                        <FavoriteProjectsList closeSidebar={closeSidebar} />
                    </div>

                    {/* User Info and Logout */}
                    <UserInfoAndLogout closeSidebar={closeSidebar}/>
                </div>
            </aside>

            {/* Overlay on mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 bg-opacity-30 z-30 md:hidden"
                    onClick={closeSidebar}
                />
            )}
        </>
    );
};

export default Sidebar;
