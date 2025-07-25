// src/components/common/DeleteConfirmationModal.jsx
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
            <div className="dark:bg-zinc-800 bg-zinc-100 rounded-lg p-6 w-full max-w-sm relative shadow-xl">
                <h2 className="text-xl font-semibold mb-4 text-red-500">{title || "Confirm Deletion"}</h2>
                <p className="dark:text-white mb-6">{message || "Are you sure you want to delete this item? This action cannot be undone."}</p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded bg-zinc-400 dark:bg-zinc-700 text-white hover:bg-zinc-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;