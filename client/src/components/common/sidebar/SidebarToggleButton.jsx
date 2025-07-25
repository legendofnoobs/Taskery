import React from 'react';
import { Menu, X } from 'lucide-react';

const SidebarToggleButton = ({ isOpen, toggleSidebar }) => {
    return (
        <button
            className="md:hidden fixed top-5 left-4 z-50 bg-white text-black dark:bg-zinc-700 dark:text-white p-2 rounded shadow-md"
            onClick={toggleSidebar}
        >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
    );
};

export default SidebarToggleButton;
