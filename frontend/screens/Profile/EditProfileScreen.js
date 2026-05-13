import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform,
  Modal,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import LazyImage from '../../components/LazyImage';
import TimePickerField from '../../components/TimePickerField';
import { fontStyles } from '../../utils/fontStyles';
import { useNotification } from '../../context/NotificationContext';
import * as ImagePicker from 'expo-image-picker';
import { authAPI } from '../../services/api';

export default function EditProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const { user, updateProfile, loading } = useAuth();
  const { currentLanguage } = useLanguage();
  const { showSuccess, showError } = useNotification();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    phone: user?.phone || '',
    birth_date: user?.birth_date || '',
    birth_time: user?.birth_time || '',
    birth_place: user?.birth_place || '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedImage, setSelectedImage] = useState(null);
  const pickerLocale = currentLanguage === 'de' ? 'de_DE' : currentLanguage === 'en' ? 'en_US' : 'tr_TR';

  const formatToDDMMYYYY = (value) => {
    if (!value) return '';
    if (typeof value === 'string' && value.includes('-')) {
      const [yyyy, mm, dd] = value.split('-');
      if (yyyy && mm && dd) return `${dd.padStart(2,'0')}-${mm.padStart(2,'0')}-${yyyy}`;
    }
    const dateObj = new Date(value);
    if (!isNaN(dateObj)) {
      const dd = String(dateObj.getDate()).padStart(2,'0');
      const mm = String(dateObj.getMonth() + 1).padStart(2,'0');
      const yyyy = dateObj.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    }
    return String(value);
  };



  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setSelectedDate(selectedDate);
      
      // Timezone sorununu çözmek için seçilen günü koruyarak tarih oluştur
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth(); // 0-11 arası
      const day = selectedDate.getDate();
      
      // Yerel saat diliminde tarih oluştur
      const localDate = new Date(year, month, day);
      const formattedDate = localDate.toISOString().split('T')[0];
      
      setFormData(prev => ({
        ...prev,
        birth_date: formattedDate
      }));
    }
  };

  const handleDateConfirm = () => {
    setShowDatePicker(false);
  };

  const pickImage = async () => {
    try {
      // İzin iste
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        showError(t('profile.imagePermissionDenied'));
        return;
      }

      // Resim seç
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedImage({
          uri: asset.uri,
          base64: asset.base64,
          type: asset.type,
        });
      }
    } catch (error) {
      console.error('Resim seçme hatası:', error);
      showError(t('profile.imageSelectionError'));
    }
  };

  const takePhoto = async () => {
    try {
      // Kamera izni iste
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        showError(t('profile.cameraPermissionDenied'));
        return;
      }

      // Fotoğraf çek
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedImage({
          uri: asset.uri,
          base64: asset.base64,
          type: asset.type,
        });
      }
    } catch (error) {
      console.error('Fotoğraf çekme hatası:', error);
      showError(t('profile.cameraError'));
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      t('profile.selectImage'),
      t('profile.selectImageSource'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('profile.takePhoto'),
          onPress: takePhoto,
        },
        {
          text: t('profile.chooseFromLibrary'),
          onPress: pickImage,
        },
      ]
    );
  };

  const removeImage = async () => {
    try {
      // Eğer mevcut resim varsa backend'den sil
      if (user?.profile_image && !selectedImage) {
        await authAPI.deleteProfileImage();
        showSuccess(t('profile.imageDeleted'));
      }
      
      setSelectedImage(null);
    } catch (error) {
      console.error('Resim silme hatası:', error);
      showError(t('profile.imageDeleteError'));
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };



  const handleSave = async () => {
    if (!formData.first_name.trim()) {
      showError(t('profile.firstNameRequired'));
      return;
    }

    setIsUpdating(true);
    try {
      const updateData = {
        first_name: formData.first_name.trim(),
        phone: formData.phone.trim(),
        birth_place: formData.birth_place.trim(),
      };

      if (formData.birth_date) {
        updateData.birth_date = formData.birth_date;
      }

      if (formData.birth_time) {
        updateData.birth_time = formData.birth_time;
      }

      if (formData.birth_place) {
        updateData.birth_place = formData.birth_place;
      }

      // Profil resmi varsa ayrı olarak yükle
      if (selectedImage) {
        try {
          const imageData = `data:${selectedImage.type};base64,${selectedImage.base64}`;
          const imageResult = await authAPI.uploadProfileImage(imageData);
          
          if (imageResult.data.success) {
            showSuccess(t('profile.imageUploaded'));
          }
        } catch (imageError) {
          console.error('Resim yükleme hatası:', imageError);
          showError(t('profile.imageUploadError'));
        }
      }

      const result = await updateProfile(updateData);
      
      if (result.success) {
        showSuccess(t('profile.profileUpdated'));
        setTimeout(() => navigation.goBack(), 1500);
      } else {
        showError(result.error || t('profile.updateError'));
      }
    } catch (error) {
      showError(t('profile.updateError'));
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C5A100" />
        <Text style={[styles.loadingText, fontStyles.body]}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']}
        style={styles.gradientBg}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#C5A100" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, fontStyles.headingBold]}>{t('profile.editProfile')}</Text>
            <TouchableOpacity 
              onPress={handleSave} 
              style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <Ionicons name="checkmark" size={24} color="#C5A100" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.heroCard}>
              <View style={styles.profileImageSection}>
                <View style={styles.profileImageContainer}>
                {selectedImage ? (
                  <LazyImage 
                    source={{ uri: selectedImage.uri }} 
                    style={styles.profileImage}
                    showPlaceholder={true}
                    fadeInDuration={300}
                  />
                ) : user?.profile_image ? (
                  <LazyImage 
                    source={{ uri: user.profile_image }} 
                    style={styles.profileImage}
                    showPlaceholder={true}
                    fadeInDuration={300}
                  />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Ionicons name="person" size={48} color="#C5A100" />
                  </View>
                )}
                {/* Camera Icon Overlay */}
                <TouchableOpacity style={styles.cameraIconOverlay} onPress={showImagePicker}>
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                </TouchableOpacity>
                {/* Remove Image Button */}
                {(selectedImage || user?.profile_image) && (
                  <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                    <Ionicons name="close" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, fontStyles.headingBold]}>{t('profile.personalInfo')}</Text>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, fontStyles.bodyBold]}>{t('profile.firstName')} *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.first_name}
                  onChangeText={(text) => handleInputChange('first_name', text)}
                  placeholder={t('profile.firstNamePlaceholder')}
                  placeholderTextColor="#666"
                  editable={!isUpdating}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, fontStyles.bodyBold]}>{t('profile.phone')}</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => handleInputChange('phone', text)}
                  placeholder={t('profile.phonePlaceholder')}
                  placeholderTextColor="#666"
                  keyboardType="phone-pad"
                  editable={!isUpdating}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, fontStyles.headingBold]}>{t('profile.birthInfo')}</Text>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, fontStyles.bodyBold]}>{t('profile.birthDate')}</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                  disabled={isUpdating}
                >
                  <Text style={[styles.dateButtonText, fontStyles.body]}>
                    {formData.birth_date ? formatToDDMMYYYY(formData.birth_date) : t('profile.selectBirthDate')}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, fontStyles.bodyBold]}>{t('profile.birthTime')}</Text>
                <TimePickerField
                  value={formData.birth_time}
                  placeholder={t('profile.birthTimePlaceholder')}
                  onChange={(time) => handleInputChange('birth_time', time)}
                  title={t('profile.birthTime')}
                  cancelLabel={t('common.cancel')}
                  confirmLabel={t('common.ok')}
                  locale={pickerLocale}
                  disabled={isUpdating}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, fontStyles.bodyBold]}>{t('profile.birthPlace')}</Text>
                <TextInput
                  style={styles.input}
                  value={formData.birth_place}
                  onChangeText={(text) => handleInputChange('birth_place', text)}
                  placeholder={t('profile.birthPlacePlaceholder')}
                  placeholderTextColor="#666"
                  editable={!isUpdating}
                />
              </View>
            </View>

            <View style={styles.bottomSaveContainer}>
              <TouchableOpacity 
                style={[styles.bottomSaveButton, isUpdating && styles.bottomSaveButtonDisabled]}
                onPress={handleSave}
                disabled={isUpdating}
              >
                <LinearGradient
                  colors={['#C5A100', '#B8941F']}
                  style={styles.bottomSaveButtonGradient}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="#000000" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={20} color="#000000" />
                      <Text style={styles.bottomSaveButtonText}>{t('common.save')}</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Date Picker - Platform Specific */}
        {Platform.OS === 'ios' ? (
          <Modal
            visible={showDatePicker}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={[styles.modalButton, fontStyles.body]}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                  <Text style={[styles.modalTitle, fontStyles.headingBold]}>{t('profile.selectBirthDate')}</Text>
                  <TouchableOpacity onPress={handleDateConfirm}>
                    <Text style={[styles.modalButton, fontStyles.body]}>{t('common.ok')}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    minimumDate={new Date('1945-01-01')}
                    maximumDate={new Date('2010-12-31')}
                    textColor="#FFFFFF"
                    themeVariant="dark"
                    locale={pickerLocale}
                  />
                </View>
              </View>
            </View>
          </Modal>
        ) : (
          showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date('1945-01-01')}
              maximumDate={new Date('2010-12-31')}
              textColor="#FFFFFF"
              themeVariant="dark"
              locale={pickerLocale}
            />
          )
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0B1F',
  },
  gradientBg: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0B1F',
  },
  loadingText: {
    color: '#C5A100',
    fontSize: 16,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 20,
    marginTop: 0,
  },
  backButton: {
    padding: 8,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'CinzelDecorative-Bold',
    color: '#C5A100',
  },
  saveButton: {
    padding: 8,
    marginRight: 10,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  heroCard: {
    marginTop: 8,
    marginBottom: 18,
    padding: 18,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 4,
  },
  profileImageContainer: {
    marginTop: 4,
    marginBottom: 2,
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(197, 161, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C5A100',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0D0B1F',
    elevation: Platform.OS === 'android' ? 4 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000000' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? {
      width: 0,
      height: 2,
    } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.25 : 0,
    shadowRadius: Platform.OS === 'ios' ? 3.84 : 0,
  },
  removeImageButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0D0B1F',
    elevation: Platform.OS === 'android' ? 4 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000000' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? {
      width: 0,
      height: 2,
    } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.25 : 0,
    shadowRadius: Platform.OS === 'ios' ? 3.84 : 0,
  },

  section: {
    marginBottom: 18,
    padding: 18,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#C5A100',
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '500',
    opacity: 0.72,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
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
    fontWeight: 'bold',
    color: '#C5A100',
  },
  modalButton: {
    fontSize: 16,
    color: '#C5A100',
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: '#0D0B1F',
    alignItems: 'center',
    paddingVertical: 10,
  },
  bottomSaveContainer: {
    paddingHorizontal: 0,
    paddingTop: 6,
    paddingBottom: 20,
  },
  bottomSaveButton: {
    borderRadius: 18,
    overflow: 'hidden',
    elevation: Platform.OS === 'android' ? 4 : 0,
    shadowColor: Platform.OS === 'ios' ? '#C5A100' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? {
      width: 0,
      height: 2,
    } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.25 : 0,
    shadowRadius: Platform.OS === 'ios' ? 3.84 : 0,
  },
  bottomSaveButtonDisabled: {
    opacity: 0.6,
  },
  bottomSaveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  bottomSaveButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
