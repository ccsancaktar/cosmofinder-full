import React from 'react';
import { View } from 'react-native';
import { useNotification } from '../context/NotificationContext';
import Toast from './Toast';
import CustomAlert from './CustomAlert';

const NotificationContainer = () => {
  const { toast, alert, hideToast, hideAlert } = useNotification();

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'box-none' }}>
      {/* Toast Notification */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onHide={hideToast}
      />

      {/* Custom Alert Modal */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={alert.onConfirm}
        onCancel={alert.onCancel}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
        showCancel={alert.showCancel}
      />
    </View>
  );
};

export default NotificationContainer;
