import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import NotificationContainer from '../components/NotificationContainer';
import { navigationRef } from './navigationService';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import OnboardingWelcomeScreen from '../screens/Onboarding/OnboardingWelcomeScreen';
import OnboardingDetailsScreen from '../screens/Onboarding/OnboardingDetailsScreen';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import YildiznameScreen from '../screens/Yildizname/YildiznameScreen';
import ResultScreen from '../screens/Yildizname/YildiznameResultScreen';
import RuneScreen from '../screens/Rune/RuneScreen';
import RuneResultScreen from '../screens/Rune/RuneResultScreen';
import ChineseScreen from '../screens/Chinese/ChineseScreen';
import ChineseResultScreen from '../screens/Chinese/ChineseResultScreen';
import YildiznameBilgiScreen from '../screens/Yildizname/YildiznameBilgiScreen';
import RuneBilgiScreen from '../screens/Rune/RuneBilgiScreen';
import ChineseBilgiScreen from '../screens/Chinese/ChineseBilgiScreen';
import CoffeeScreen from '../screens/Coffee/CoffeeScreen';
import CoffeeResultScreen from '../screens/Coffee/CoffeeResultScreen';
import CoffeeBilgiScreen from '../screens/Coffee/CoffeeBilgiScreen';
import TarotScreen from '../screens/Tarot/TarotScreen';
import TarotBilgiScreen from '../screens/Tarot/TarotBilgiScreen';
import TarotFormScreen from '../screens/Tarot/TarotFormScreen';
import TarotSelectionScreen from '../screens/Tarot/TarotSelectionScreen';
import TarotResultScreen from '../screens/Tarot/TarotResultScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/Profile/ChangePasswordScreen';
import ReadingHistoryScreen from '../screens/Profile/ReadingHistoryScreen';
import ReadingDetailScreen from '../screens/Profile/ReadingDetailScreen';
import NotificationSettingsScreen from '../screens/Profile/NotificationSettingsScreen';
import DailyScreen from '../screens/Daily/DailyScreen';
import DailyResultScreen from '../screens/Daily/DailyResultScreen';
import DailyBilgiScreen from '../screens/Daily/DailyBilgiScreen';
import KabalaScreen from '../screens/Kabala/KabalaScreen';
import KabalaResultScreen from '../screens/Kabala/KabalaResultScreen';
import KabalaBilgiScreen from '../screens/Kabala/KabalaBilgiScreen';
import NumerologyScreen from '../screens/Numerology/NumerologyScreen';
import NumerologyResultScreen from '../screens/Numerology/NumerologyResultScreen';
import NumerologyBilgiScreen from '../screens/Numerology/NumerologyBilgiScreen';
import CompatibilityScreen from '../screens/Compatibility/CompatibilityScreen';
import CompatibilityResultScreen from '../screens/Compatibility/CompatibilityResultScreen';
import CompatibilityBilgiScreen from '../screens/Compatibility/CompatibilityBilgiScreen';
import AngelNumbersScreen from '../screens/AngelNumbers/AngelNumbersScreen';
import AngelNumbersResultScreen from '../screens/AngelNumbers/AngelNumbersResultScreen';
import AngelNumbersBilgiScreen from '../screens/AngelNumbers/AngelNumbersBilgiScreen';

// Token Screens
import TokenBalanceScreen from '../screens/Token/TokenBalanceScreen';
import TokenPurchaseScreen from '../screens/Token/TokenPurchaseScreen';
import TokenHistoryScreen from '../screens/Token/TokenHistoryScreen';

// Premium Screens
import PremiumScreen from '../screens/Premium/PremiumScreen';

const Stack = createStackNavigator();
const appNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0D0B1F',
    card: '#0D0B1F',
    border: '#0D0B1F',
    primary: '#C5A100',
    text: '#FFFFFF',
  },
};

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#C5A100" />
    </View>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, initializing, user } = useAuth();
  const needsOnboarding = isAuthenticated && user?.onboarding_completed === false;
  const navigatorKey = isAuthenticated ? (needsOnboarding ? 'authenticated-onboarding' : 'authenticated-app') : 'guest';

  if (initializing) {
    return <LoadingScreen />;
  }

    return (
    <>
      <NavigationContainer ref={navigationRef} theme={appNavigationTheme}>
        <Stack.Navigator
          key={navigatorKey}
          initialRouteName={isAuthenticated ? (needsOnboarding ? 'OnboardingWelcome' : 'Ana Sayfa') : 'Ana Sayfa'}
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#0D0B1F' },
          }}
        >
          {/* Ana Sayfa her zaman erişilebilir */}
          <Stack.Screen name="Ana Sayfa" component={HomeScreen} />
          
          {/* Bilgi sayfaları her zaman erişilebilir */}
          <Stack.Screen name="Yıldızname Bilgi" component={YildiznameBilgiScreen} />
          <Stack.Screen name="Rün Bilgi" component={RuneBilgiScreen} />
          <Stack.Screen name="Çin Bilgi" component={ChineseBilgiScreen} />
          <Stack.Screen name="Kahve Bilgi" component={CoffeeBilgiScreen} />
          <Stack.Screen name="TarotBilgi" component={TarotBilgiScreen} />
          <Stack.Screen name="Kabala Bilgi" component={KabalaBilgiScreen} />
          <Stack.Screen name="DailyBilgi" component={DailyBilgiScreen} />
          <Stack.Screen name="Numerology Bilgi" component={NumerologyBilgiScreen} />
          <Stack.Screen name="Compatibility Bilgi" component={CompatibilityBilgiScreen} />
          <Stack.Screen name="Angel Numbers Bilgi" component={AngelNumbersBilgiScreen} />
          
          {/* Auth ekranları */}
          {!isAuthenticated ? (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            </>
          ) : null}
          
          {/* Fal ekranları - sadece authenticated kullanıcılar için */}
          {isAuthenticated ? (
            <>
              {needsOnboarding ? (
                <>
                  <Stack.Screen name="OnboardingWelcome" component={OnboardingWelcomeScreen} />
                  <Stack.Screen name="OnboardingDetails" component={OnboardingDetailsScreen} />
                </>
              ) : (
                <>
                  <Stack.Screen name="Profile" component={ProfileScreen} />
                  <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                  <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
                  <Stack.Screen name="ReadingHistory" component={ReadingHistoryScreen} />
                  <Stack.Screen name="ReadingDetail" component={ReadingDetailScreen} />
                  <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
                  <Stack.Screen name="Yıldızname" component={YildiznameScreen} />
                  <Stack.Screen name="Sonuç" component={ResultScreen} />
                  <Stack.Screen name="Rune" component={RuneScreen} />
                  <Stack.Screen name="Rune Sonuç" component={RuneResultScreen} />
                  <Stack.Screen name="Chinese" component={ChineseScreen} />
                  <Stack.Screen name="Chinese Sonuç" component={ChineseResultScreen} />
                  <Stack.Screen name="Kahve" component={CoffeeScreen} />
                  <Stack.Screen name="Kahve Sonuç" component={CoffeeResultScreen} />
                  <Stack.Screen name="Tarot" component={TarotScreen} />
                  <Stack.Screen name="TarotForm" component={TarotFormScreen} />
                  <Stack.Screen name="TarotSelection" component={TarotSelectionScreen} />
                  <Stack.Screen name="TarotResult" component={TarotResultScreen} />
                  <Stack.Screen name="Daily" component={DailyScreen} />
                  <Stack.Screen name="Daily Sonuç" component={DailyResultScreen} />
                  <Stack.Screen name="Kabala" component={KabalaScreen} />
                  <Stack.Screen name="Kabala Sonuç" component={KabalaResultScreen} />
                  <Stack.Screen name="Numerology" component={NumerologyScreen} />
                  <Stack.Screen name="Numerology Sonuç" component={NumerologyResultScreen} />
                  <Stack.Screen name="Compatibility" component={CompatibilityScreen} />
                  <Stack.Screen name="Compatibility Sonuç" component={CompatibilityResultScreen} />
                  <Stack.Screen name="Angel Numbers" component={AngelNumbersScreen} />
                  <Stack.Screen name="Angel Numbers Sonuç" component={AngelNumbersResultScreen} />
                  
                  {/* Token Screens */}
                  <Stack.Screen name="TokenBalance" component={TokenBalanceScreen} />
                  <Stack.Screen name="TokenPurchase" component={TokenPurchaseScreen} />
                  <Stack.Screen name="TokenHistory" component={TokenHistoryScreen} />
                  
                  {/* Premium Screens */}
                  <Stack.Screen name="Premium" component={PremiumScreen} />
                </>
              )}
            </>
          ) : null}
        </Stack.Navigator>
      </NavigationContainer>
      
      {/* Notification Container - Tüm ekranların üstünde */}
      <NotificationContainer />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0B1F',
  },
}); 
