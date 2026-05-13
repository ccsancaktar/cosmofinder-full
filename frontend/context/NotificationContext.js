import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success',
    duration: 3000
  });

  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    onCancel: null,
    confirmText: 'Tamam',
    cancelText: 'İptal',
    showCancel: false
  });

  // Toast gösterme fonksiyonu
  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({
      visible: true,
      message,
      type,
      duration
    });
  };

  // Toast gizleme fonksiyonu
  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Alert gösterme fonksiyonu
  const showAlert = (title, message, type = 'info', options = {}) => {
    setAlert({
      visible: true,
      title,
      message,
      type,
      onConfirm: options.onConfirm || (() => hideAlert()),
      onCancel: options.onCancel || (() => hideAlert()),
      confirmText: options.confirmText || 'Tamam',
      cancelText: options.cancelText || 'İptal',
      showCancel: options.showCancel || false
    });
  };

  // Alert gizleme fonksiyonu
  const hideAlert = () => {
    setAlert(prev => ({ ...prev, visible: false }));
  };

  // Başarı mesajı için kısayol
  const showSuccess = (message, duration = 3000) => {
    showToast(message, 'success', duration);
  };

  // Hata mesajı için kısayol
  const showError = (message, duration = 3000) => {
    showToast(message, 'error', duration);
  };

  // Uyarı mesajı için kısayol
  const showWarning = (message, duration = 3000) => {
    showToast(message, 'warning', duration);
  };

  // Bilgi mesajı için kısayol
  const showInfo = (message, duration = 3000) => {
    showToast(message, 'info', duration);
  };

  // Onay modal'ı için kısayol
  const showConfirm = (title, message, onConfirm, onCancel = null, type = 'warning') => {
    showAlert(title, message, type, {
      onConfirm: () => {
        onConfirm();
        hideAlert();
      },
      onCancel: onCancel ? () => {
        onCancel();
        hideAlert();
      } : () => hideAlert(),
      showCancel: true,
      confirmText: 'Evet',
      cancelText: 'Hayır'
    });
  };

  const value = {
    toast,
    alert,
    showToast,
    hideToast,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
