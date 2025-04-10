'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function NotificationToast({ 
  show, 
  message, 
  type = 'success', 
  onClose,
  autoHideDuration = 3000
}) {
  // Auto-hide the notification after specified duration
  useEffect(() => {
    if (show && autoHideDuration !== null) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [show, autoHideDuration, onClose]);

  if (!show) return null;

  // Define styles based on notification type
  const typeStyles = {
    success: "bg-green-100 border-green-400 text-green-700",
    error: "bg-red-100 border-red-400 text-red-700",
    warning: "bg-yellow-100 border-yellow-400 text-yellow-700",
    info: "bg-blue-100 border-blue-400 text-blue-700",
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div className={`fixed bottom-4 right-4 ${style} px-4 py-3 rounded shadow-md flex items-center justify-between z-50`}>
      <div className="flex items-center">
        {type === 'success' && <span className="check-icon mr-2">✓</span>}
        {type === 'error' && <span className="error-icon mr-2">✕</span>}
        {type === 'warning' && <span className="warning-icon mr-2">⚠</span>}
        {type === 'info' && <span className="info-icon mr-2">ℹ</span>}
        {message}
      </div>
      {onClose && (
        <button 
          onClick={onClose} 
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}