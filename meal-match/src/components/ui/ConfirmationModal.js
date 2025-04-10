export default function ConfirmationModal({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    confirmButtonClass = "bg-red-500 hover:bg-red-600 text-white",
  }) {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-xl font-medium mb-4">{title}</h3>
          <p className="mb-6">{message}</p>
          <div className="flex justify-end gap-3">
            <button 
              onClick={onCancel} 
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm} 
              className={`px-4 py-2 ${confirmButtonClass} rounded-md transition-colors`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  }