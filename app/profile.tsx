import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, User, Mail, MapPin, Settings, Heart, Bookmark, LogOut, ChevronRight, Bell, Globe, Shield, HelpCircle, Lock, Moon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }}
      ]
    );
  };

  const MenuItem = ({ icon: Icon, title, subtitle, onPress, showChevron = true }: any) => (
    <TouchableOpacity 
      style={styles.menuItem}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconContainer}>
        <Icon size={22} color={Colors.sakuraPink} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {showChevron && <ChevronRight size={20} color={Colors.textSecondary} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#FFE5EC', '#F0F4FF', '#E8F5F7']}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.settingsButton} />
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[Colors.sakuraPink, '#FF6B9D']}
                style={styles.avatarGradient}
              >
                <User size={40} color={Colors.snowWhite} />
              </LinearGradient>
            </View>
            <Text style={styles.userName}>Tokyo Explorer</Text>
            <Text style={styles.userEmail}>explorer@tokyo.jp</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Tours</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>48</Text>
                <Text style={styles.statLabel}>Saved</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>156</Text>
                <Text style={styles.statLabel}>Visited</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.menuContainer}>
              <MenuItem 
                icon={User}
                title="Edit Profile"
                subtitle="Change your name"
                onPress={() => {}}
              />
              <MenuItem 
                icon={Mail}
                title="Email"
                subtitle="explorer@tokyo.jp"
                onPress={() => {}}
              />
              <MenuItem 
                icon={Lock}
                title="Password"
                subtitle="Change your password"
                onPress={() => {}}
              />
              <MenuItem 
                icon={MapPin}
                title="Location"
                subtitle="Add your hotel or accommodation address"
                onPress={() => {}}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Activity</Text>
            <View style={styles.menuContainer}>
              <MenuItem 
                icon={Heart}
                title="Favorites"
                subtitle="Your favorite places"
                onPress={() => {}}
              />
              <MenuItem 
                icon={Bookmark}
                title="Purchased Tours"
                subtitle="Tours you have purchased"
                onPress={() => {}}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.menuContainer}>
              <View style={styles.menuItem}>
                <View style={styles.menuIconContainer}>
                  <Bell size={22} color={Colors.sakuraPink} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>Notifications</Text>
                  <Text style={styles.menuSubtitle}>Push notifications & updates</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={(value) => {
                    setNotificationsEnabled(value);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  trackColor={{ false: Colors.border, true: Colors.sakuraPink }}
                  thumbColor={Colors.snowWhite}
                />
              </View>
              <View style={styles.menuItem}>
                <View style={styles.menuIconContainer}>
                  <Moon size={22} color={Colors.sakuraPink} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>Dark Mode</Text>
                  <Text style={styles.menuSubtitle}>Switch between light and dark theme</Text>
                </View>
                <Switch
                  value={darkModeEnabled}
                  onValueChange={(value) => {
                    setDarkModeEnabled(value);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  trackColor={{ false: Colors.border, true: Colors.sakuraPink }}
                  thumbColor={Colors.snowWhite}
                />
              </View>
              <MenuItem 
                icon={Globe}
                title="Language"
                subtitle="English"
                onPress={() => {}}
              />
              <MenuItem 
                icon={Shield}
                title="Privacy"
                subtitle="Manage your privacy settings"
                onPress={() => {}}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            <View style={styles.menuContainer}>
              <MenuItem 
                icon={HelpCircle}
                title="Help Center"
                subtitle="Get help and support"
                onPress={() => {}}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LogOut size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: Colors.snowWhite,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.sakuraPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.sakuraPink,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuContainer: {
    backgroundColor: Colors.snowWhite,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 80, 122, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.snowWhite,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.error,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
  bottomPadding: {
    height: 40,
  },
});
