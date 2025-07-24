import { useEffect, useState } from 'react';
import { FileClock, Trash2 } from 'lucide-react'; // Import Trash2 for delete all icon
import axios from 'axios';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal'; // Ensure this path is correct

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
            <div className="flex items-center justify-between mb-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold">
                    <FileClock className="w-6 h-6" /> Activity Log
                </h1>
                {logs.length > 0 && ( // Only show delete all button if there are logs
                    <button
                        onClick={confirmDeleteAllLogs}
                        disabled={deletingAllLogs || loading}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        {deletingAllLogs ? 'Deleting...' : 'Delete All Logs'}
                    </button>
                )}
            </div>

            {loading ? (
                <div className="text-gray-500 text-lg">Loading activity logs...</div>
            ) : error ? (
                <div className="text-red-500 text-lg">{error}</div>
            ) : logs.length === 0 ? (
                <div className="text-gray-400 italic text-lg">No activity logs found.</div>
            ) : (
                <div className="space-y-4">
                    {logs.map((log) => (
                        <div key={log._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <p className="text-gray-800 text-base font-semibold mb-1">
                                {log.action}
                                {log.entityType && <span className="text-sm text-gray-600 ml-2">({log.entityType})</span>}
                            </p>
                            {log.details && <p className="text-gray-700 text-sm mb-1">{log.details}</p>}
                            <p className="text-gray-500 text-xs">
                                <span className="font-medium">Timestamp:</span> {new Date(log.createdAt).toLocaleString()}
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
