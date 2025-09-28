import { Search, Inbox, FolderKanban, FileClock, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation

const SidebarNav = ({ closeSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation(); // Get the current location object

    const navItems = [
        { icon: Search, name: 'Search', path: '/dashboard/search' },
        { icon: Inbox, name: 'Inbox', path: '/dashboard/inbox' },
        { icon: FileText, name: 'Notes', path: '/dashboard/notes' },
        { icon: FolderKanban, name: 'Projects', path: '/dashboard/projects' },
        { icon: FileClock, name: 'Activity Log', path: '/dashboard/activity-log' },
    ];

    return (
        <nav className="mt-12 md:mt-0 space-y-2 text-gray-700">
            <div className='flex items-center gap-4'>
                <img src="/Designer.webp" alt="logo" className='w-16' />
                <h1 className='dark:text-white text-black font-bold text-4xl'>
                    Taskery
                </h1>
            </div>

            {/* Navigation Items with Active State */}
            {navItems.map(item => {
                // Determine if the current item's path matches the current URL path
                const isActive = location.pathname === item.path;

                return (
                    <button
                        key={item.name}
                        onClick={() => {
                            navigate(item.path);
                            closeSidebar();
                        }}
                        // Apply conditional classes based on 'isActive'
                        className={`flex items-center gap-x-3 w-full text-left px-3 py-2 rounded-full transition-colors
                            ${isActive
                                ? 'bg-blue-300 text-blue-800 dark:bg-zinc-700 dark:text-white font-semibold' // Active styles
                                : 'dark:hover:bg-zinc-700 hover:bg-blue-200 dark:text-white' // Inactive styles
                            }`
                        }
                    >
                        <item.icon /> {item.name}
                    </button>
                );
            })}
        </nav>
    );
};

export default SidebarNav;
