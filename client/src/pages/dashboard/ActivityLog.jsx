import { useEffect, useState } from 'react';
import { ArrowLeft, FileClock, Trash2 } from 'lucide-react'; // Import Trash2 for delete all icon
import axios from 'axios';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal'; // Ensure this path is correct
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false); // New state for delete all confirmation
    const [deletingAllLogs, setDeletingAllLogs] = useState(false); // State to indicate deletion in progress

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchActivityLogs = async () => {
            setLoading(true);
            setError(null);
            try {
                if (!token) {
                    setError('Authentication token not found. Please log in.');
                    setLoading(false);
                    return;
                }

                // Fetch logs from the backend
                const res = await axios.get(`${API_URL}/activity-logs`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLogs(res.data);
            } catch (err) {
                console.error('Failed to fetch activity logs:', err);
                setError(err.response?.data?.message || 'Failed to fetch activity logs.');
            } finally {
                setLoading(false);
            }
        };

        fetchActivityLogs();
    }, [token]); // Re-fetch if token changes (e.g., after login/logout)

    // Handler to confirm deletion of all logs
    const confirmDeleteAllLogs = () => {
        setShowDeleteAllModal(true);
    };

    // Handler for actual deletion of all logs after confirmation
    const handleDeleteAllLogsConfirmed = async () => {
        setDeletingAllLogs(true);
        setError(null); // Clear previous errors
        try {
            if (!token) {
                setError('Authentication token not found. Please log in.');
                setDeletingAllLogs(false);
                setShowDeleteAllModal(false);
                return;
            }

            await axios.delete(`${API_URL}/activity-logs/delete-logs`, { // Assuming this new endpoint
                headers: { Authorization: `Bearer ${token}` }
            });

            setLogs([]); // Clear logs from state immediately
            toast.success('Deleted All Logs!')
            setShowDeleteAllModal(false); // Close the modal
            setDeletingAllLogs(false);
            // Optionally, re-fetch to ensure backend state is reflected, though clearing locally is often enough for "delete all"
            // fetchActivityLogs();
        } catch (err) {
            console.error('Failed to delete all activity logs:', err);
            setError(err.response?.data?.message || 'Failed to delete all activity logs.');
            setDeletingAllLogs(false);
            setShowDeleteAllModal(false); // Close modal even on error
        }
    };

    return (
        <div className="md:ml-72 mt-8 px-4 py-6">
            <div className="fixed top-0 left-0 right-0 md:left-72 z-10 bg-gray-100/50 px-4 py-6 flex items-center justify-between backdrop-blur-md">
                <div className='flex items-center gap-2'>
                    <button className="p-1 rounded-full hover:bg-gray-200 transition-colors mr-2 block md:hidden" aria-label="Back to Projects">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="flex items-center gap-2 text-2xl font-bold">
                        <FileClock className="w-6 h-6" /> Activity Log
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

            {loading ? (
                <div className="text-gray-500 text-lg pt-10">Loading activity logs...</div>
            ) : error ? (
                <div className="text-red-500 text-lg pt-10">{error}</div>
            ) : logs.length === 0 ? (
                <div className="text-gray-400 italic text-lg pt-10">No activity logs found.</div>
            ) : (
                <div className="space-y-4 pt-10">
                    {logs.map((log) => (
                        <div key={log._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <p className="text-gray-800 text-base font-semibold mb-1">
                                {log.action}
                                {log.entityType && <span className="text-sm text-gray-600 ml-2">({log.entityType})</span>}
                            </p>
                            {log.details && <p className="text-gray-700 text-sm mb-1">{log.details}</p>}
                            <p className="text-gray-500 text-xs">
                                <span className="font-medium">Time of Action:</span> {new Date(log.createdAt).toLocaleString()}
                            </p>
                            {log.entityId && (
                                <p className="text-gray-500 text-xs">
                                    <span className="font-medium">Entity ID:</span> {log.entityId}
                                </p>
                            )}
                            {log.user && (
                                <p className="text-gray-500 text-xs">
                                    <span className="font-medium">User:</span> {log.user.email || log.user.username || log.user._id}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Delete All Logs Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteAllModal}
                onClose={() => {
                    setShowDeleteAllModal(false);
                    setDeletingAllLogs(false); // Reset deleting state on close
                }}
                onConfirm={handleDeleteAllLogsConfirmed}
                title="Delete All Activity Logs"
                message="Are you sure you want to delete ALL of your activity logs? This action cannot be undone."
            />
        </div>
    );
};

export default ActivityLog;
