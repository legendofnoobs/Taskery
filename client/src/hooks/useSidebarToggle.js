import { useState } from 'react';

const useSidebarToggle = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(prev => !prev);
    };

    const closeSidebar = () => {
        setIsOpen(false);
    };

    return { isOpen, toggleSidebar, closeSidebar };
};

export default useSidebarToggle;