import { useState } from 'react';
import { FileClock, Trash2, ArrowLeft } from 'lucide-react'; // Import Trash2 for delete all icon, ArrowLeft for back button
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal'; // Ensure this path is correct
import { useActivityLogs } from '../../hooks/useActivityLogs'; // Import the new hook

const ActivityLog = () => {
    // Use the custom hook for activity log data and API interactions
    const {
        logs,
        loading,
        error,
        deletingAllLogs,
        handleDeleteAllLogsConfirmed,
    } = useActivityLogs();

    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false); // State for delete all confirmation

    // Handler to confirm deletion of all logs
    const confirmDeleteAllLogs = () => {
        setShowDeleteAllModal(true);
    };

    // Handler for actual deletion of all logs after confirmation
    const onDeleteAllConfirmed = async () => {
        const success = await handleDeleteAllLogsConfirmed();
        if (success) {
            setShowDeleteAllModal(false); // Close the modal only on success
        }
        // Error handling is managed within the hook, so no need to set error here
    };

    return (
        <div className="md:ml-72 mt-8 px-4 py-6">
            <div className="fixed top-0 left-0 right-0 md:left-72 z-10 bg-transparent px-4 py-6 flex items-center justify-between backdrop-blur-md">
                <div className='flex items-center gap-2'>
                    <button className="p-1 rounded-full hover:bg-gray-200 transition-colors mr-2 block md:hidden" aria-label="Back to Projects">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-white">
                        <FileClock className="w-6 h-6 text-gray-800 dark:text-white" /> Activity Log
                    </h1>
                </div>
                {logs.length > 0 && ( // Only show delete all button if there are logs
                    <button
                        onClick={confirmDeleteAllLogs}
                        disabled={deletingAllLogs || loading}
                        className="flex items-center gap-2 bg-red-600 text-white px-2 py-2 rounded-full hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        {/* {deletingAllLogs ? 'Deleting...' : 'Delete All Logs'} */}
                    </button>
                )}
            </div>

            {/* Spacer div to prevent content from being hidden behind the fixed header */}
            <div className="pt-10"> {/* Adjusted padding based on the fixed header's height */}
                {loading ? (
                    <div className="text-gray-500 text-lg">Loading activity logs...</div>
                ) : error ? (
                    <div className="text-red-500 text-lg">{error}</div>
                ) : logs.length === 0 ? (
                    <div className="text-gray-400 italic text-lg">No activity logs found.</div>
                ) : (
                    <div className="space-y-4">
                        {logs.map((log) => (
                            <div key={log._id} className="dark:bg-zinc-800 bg-white p-4 rounded-lg shadow-sm dark:border dark:border-zinc-700">
                                <p className="dark:text-white text-base font-semibold mb-1">
                                    {log.action}
                                    {log.entityType && <span className="text-sm dark:text-white ml-2">({log.entityType})</span>}
                                </p>
                                {log.details && <p className="dark:text-white text-sm mb-1">{log.details}</p>}
                                <p className="dark:text-white text-xs">
                                    <span className="font-medium">Time of Action:</span> {new Date(log.createdAt).toLocaleString()}
                                </p>
                                {log.entityId && (
                                    <p className="dark:text-white text-xs">
                                        <span className="font-medium">Entity ID:</span> {log.entityId}
                                    </p>
                                )}
                                {log.user && (
                                    <p className="dark:text-white text-xs">
                                        <span className="font-medium">User:</span> {log.user.email || log.user.username || log.user._id}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete All Logs Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteAllModal}
                onClose={() => {
                    setShowDeleteAllModal(false);
                    // No need to reset deletingAllLogs here, as the hook manages it
                }}
                onConfirm={onDeleteAllConfirmed}
                title="Delete All Activity Logs"
                message="Are you sure you want to delete ALL of your activity logs? This action cannot be undone."
            />
        </div>
    );
};

export default ActivityLog;
