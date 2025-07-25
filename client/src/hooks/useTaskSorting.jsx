// src/hooks/useTaskSorting.jsx
import { useState, useMemo } from 'react';
import { ArrowDownWideNarrow, ArrowUpWideNarrow, AlignEndHorizontal, ArrowDownUp } from 'lucide-react';
import toast from 'react-hot-toast';

export const useTaskSorting = (tasks) => {
    const [sortOrder, setSortOrder] = useState('default');

    // Memoized function to sort tasks based on the current sortOrder
    const getSortedTasks = useMemo(() => {
        let sorted = [...tasks]; // Create a shallow copy to avoid mutating original state

        switch (sortOrder) {
            case 'priority':
                // Corrected priorityMap to use numeric keys as per your task object structure
                // 0: None, 1: Low, 2: Medium, 3: High, 4: Urgent
                // eslint-disable-next-line no-case-declarations
                const priorityMap = { 1: 1, 2: 2, 3: 3, 4: 4 };
                sorted.sort((a, b) => {
                    // Use nullish coalescing (??) to default to 0 if priority is null/undefined
                    const valA = priorityMap[a.priority ?? 0];
                    const valB = priorityMap[b.priority ?? 0];
                    return valB - valA; // Descending priority (Urgent first, then High, Medium, Low, None)
                });
                break;
            case 'dateAsc':
                sorted.sort((a, b) => {
                    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity; // Tasks without date go last
                    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
                    return dateA - dateB; // Nearest to furthest
                });
                break;
            case 'dateDesc':
                sorted.sort((a, b) => {
                    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : -Infinity; // Tasks without date go last
                    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : -Infinity;
                    return dateB - dateA; // Furthest to nearest
                });
                break;
            case 'default':
            default:
                // No specific sorting, rely on the order from the API fetch (or inherent array order)
                break;
        }
        return sorted;
    }, [tasks, sortOrder]); // Re-calculate when tasks or sortOrder changes

    // Cycles through different sort orders
    const handleSortChange = () => {
        setSortOrder(prevOrder => {
            switch (prevOrder) {
                case 'default':
                    toast.success("Sorted by priority!");
                    return 'priority';
                case 'priority':
                    toast.success("Sorted by nearest date!");
                    return 'dateAsc';
                case 'dateAsc':
                    toast.success("Sorted by furthest date!");
                    return 'dateDesc';
                case 'dateDesc':
                    toast.success("Sorted by default order!");
                    return 'default';
                default:
                    return 'default';
            }
        });
    };

    // Memoized icon for the sort button based on current sort order
    const sortIcon = useMemo(() => {
        switch (sortOrder) {
            case 'dateAsc':
                return <ArrowUpWideNarrow className="w-4 h-4 dark:text-zinc-100" />;
            case 'dateDesc':
                return <ArrowDownWideNarrow className="w-4 h-4 dark:text-zinc-100" />;
            case 'priority':
                return <AlignEndHorizontal className="w-4 h-4 dark:text-zinc-100" />;
            default:
                return <ArrowDownUp className="w-4 h-4 dark:text-zinc-100" />; // Default sort icon
        }
    }, [sortOrder]);

    // Optional: Memoized text for the sort button
    const sortButtonText = useMemo(() => {
        switch (sortOrder) {
            case 'priority':
                return 'Priority';
            case 'dateAsc':
                return 'Date (Nearest)';
            case 'dateDesc':
                return 'Date (Furthest)';
            default:
                return 'Default Order';
        }
    }, [sortOrder]);

    return {
        sortOrder,
        getSortedTasks,
        handleSortChange,
        sortIcon,
        sortButtonText
    };
};
