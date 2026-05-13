import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const CustomAlert = ({ 
  visible, 
  title, 
  message, 
  type = 'info',
  onConfirm, 
  onCancel,
  confirmText = 'Tamam',
  cancelText = 'İptal',
  showCancel = false
}) => {
  const getAlertStyle = () => {
    switch (type) {
      case 'success':
        return { 
          accent: '#C5A100',
          icon: 'checkmark-circle',
          iconColor: '#E9C15F',
          titleColor: '#F7E3A1',
        };
      case 'error':
        return { 
          accent: '#A94442',
          icon: 'alert-circle',
          iconColor: '#F2A7A0',
          titleColor: '#F8C8C2',
        };
      case 'warning':
        return { 
          accent: '#C58B17',
          icon: 'warning',
          iconColor: '#F0C674',
          titleColor: '#F6D98D',
        };
      default:
        return { 
          accent: '#7667C8',
          icon: 'information-circle',
          iconColor: '#D0C7FF',
          titleColor: '#E3DDFF',
        };
    }
  };

  const alertStyle = getAlertStyle();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <LinearGradient
          colors={['rgba(13,11,31,0.98)', 'rgba(27,27,47,0.99)', 'rgba(42,42,63,0.99)']}
          style={styles.alertContainer}
        >
          <View style={[styles.alertAccent, { backgroundColor: alertStyle.accent }]} />
          <View style={styles.iconContainer}>
            <Ionicons name={alertStyle.icon} size={48} color={alertStyle.iconColor} />
          </View>
          
          <Text style={[styles.title, { color: alertStyle.titleColor }]}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            {showCancel && (
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 5, 16, 0.86)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  alertContainer: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: 26,
    padding: 26,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.12)',
    overflow: 'hidden',
  },
  alertAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#C5A100',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    minWidth: 100,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#0D0B1F',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CustomAlert;
