'use client';

import { useState, useCallback } from 'react';

/**
 * Custom hook for managing notifications
 * @param {Object} options - Configuration options
 * @param {number} options.autoHideDuration - Duration to show notification in ms (default: 3000)
 * @returns {Object} - Notification state and functions
 */
export default function useNotification({ autoHideDuration = 3000 } = {}) {
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: '', // 'success', 'error', 'info', etc.
  });

  // Show a notification with optional custom duration
  const showNotification = useCallback(
    (message, type = 'info', duration = autoHideDuration) => {
      setNotification({
        show: true,
        message,
        type,
      });

      // Auto-hide notification after duration
      if (duration !== null) {
        setTimeout(() => {
          setNotification((prev) => ({
            ...prev,
            show: false,
          }));
        }, duration);
      }
    },
    [autoHideDuration]
  );

  // Hide the notification manually
  const hideNotification = useCallback(() => {
    setNotification((prev) => ({
      ...prev,
      show: false,
    }));
  }, []);

  return {
    notification,
    showNotification,
    hideNotification,
  };
}