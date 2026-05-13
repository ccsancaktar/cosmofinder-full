import React, { useMemo, useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

const DEFAULT_TIME = new Date(2000, 0, 1, 12, 0, 0, 0);

function parseTimeString(value) {
  if (!value || typeof value !== 'string') {
    return new Date(DEFAULT_TIME);
  }

  const [hours, minutes] = value.split(':').map((part) => parseInt(part, 10));
  const safeHours = Number.isNaN(hours) ? 12 : hours;
  const safeMinutes = Number.isNaN(minutes) ? 0 : minutes;
  const date = new Date(2000, 0, 1, safeHours, safeMinutes, 0, 0);

  return date;
}

function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export default function TimePickerField({
  value,
  onChange,
  placeholder,
  title,
  cancelLabel,
  confirmLabel,
  locale = 'tr_TR',
  disabled = false,
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(parseTimeString(value));

  const displayValue = useMemo(() => value || placeholder, [placeholder, value]);

  const openPicker = () => {
    if (disabled) return;
    setTempDate(parseTimeString(value));
    setShowPicker(true);
  };

  const closePicker = () => setShowPicker(false);

  const handleAndroidChange = (_, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      onChange(formatTime(selectedDate));
    }
  };

  const handleIosChange = (_, selectedDate) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const confirmIosValue = () => {
    onChange(formatTime(tempDate));
    closePicker();
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.field, disabled && styles.fieldDisabled]}
        onPress={openPicker}
        activeOpacity={0.85}
        disabled={disabled}
      >
        <Text style={[styles.fieldText, !value && styles.placeholderText]}>{displayValue}</Text>
        <Ionicons name="time-outline" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      {Platform.OS === 'ios' ? (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={closePicker}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={closePicker}>
                  <Text style={styles.modalButton}>{cancelLabel}</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{title}</Text>
                <TouchableOpacity onPress={confirmIosValue}>
                  <Text style={styles.modalButton}>{confirmLabel}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={tempDate}
                  mode="time"
                  display="spinner"
                  onChange={handleIosChange}
                  textColor="#FFFFFF"
                  themeVariant="dark"
                  locale={locale}
                  minuteInterval={1}
                  is24Hour
                />
              </View>
            </View>
          </View>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={tempDate}
            mode="time"
            display="default"
            is24Hour
            onChange={handleAndroidChange}
            locale={locale}
          />
        )
      )}
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(197, 161, 0, 0.2)',
  },
  fieldDisabled: {
    opacity: 0.6,
  },
  fieldText: {
    fontSize: 17,
    color: '#FFFFFF',
  },
  placeholderText: {
    color: '#999999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0D0B1F',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#C5A100',
  },
  modalButton: {
    fontSize: 16,
    color: '#C5A100',
    fontWeight: '600',
  },
  pickerContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#0D0B1F',
  },
});
