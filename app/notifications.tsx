import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, Bell, MapPin, Gift, Calendar, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

interface Notification {
  id: string;
  type: 'tour' | 'place' | 'system' | 'offer';
  title: string;
  message: string;
  time: string;
  read: boolean;
  image?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'tour',
    title: 'New Tour Created',
    message: 'Your custom tour "Tokyo Night Life" has been created successfully!',
    time: '5 min ago',
    read: false,
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
  },
  {
    id: '2',
    type: 'offer',
    title: 'Special Offer',
    message: '20% off on guided tours this weekend. Book now!',
    time: '2 hours ago',
    read: false,
  },
  {
    id: '3',
    type: 'place',
    title: 'Place Recommendation',
    message: 'Based on your interests, you might love Meiji Shrine',
    time: '1 day ago',
    read: true,
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400',
  },
  {
    id: '4',
    type: 'system',
    title: 'Tour Reminder',
    message: 'Your tour "Classic Tokyo 3-day" starts tomorrow at 9:00 AM',
    time: '1 day ago',
    read: true,
  },
  {
    id: '5',
    type: 'place',
    title: 'New Attraction Added',
    message: 'TeamLab Borderless has reopened. Check it out!',
    time: '2 days ago',
    read: true,
    image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400',
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'tour':
        return Calendar;
      case 'place':
        return MapPin;
      case 'offer':
        return Gift;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'tour':
        return Colors.sakuraPink;
      case 'place':
        return Colors.fujiBlue;
      case 'offer':
        return Colors.warning;
      default:
        return Colors.textSecondary;
    }
  };

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
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity 
              style={styles.markAllButton}
              onPress={markAllAsRead}
              activeOpacity={0.7}
            >
              <Check size={20} color={Colors.sakuraPink} />
            </TouchableOpacity>
          )}
          {unreadCount === 0 && <View style={styles.placeholder} />}
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const iconColor = getNotificationColor(notification.type);

            return (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationCard,
                  !notification.read && styles.notificationCardUnread
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  markAsRead(notification.id);
                }}
                activeOpacity={0.7}
              >
                {!notification.read && <View style={styles.unreadDot} />}
                
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
                      <Icon size={20} color={iconColor} />
                    </View>
                    
                    {notification.image && (
                      <Image 
                        source={{ uri: notification.image }} 
                        style={styles.notificationImage}
                      />
                    )}
                  </View>

                  <View style={styles.notificationBody}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {notifications.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Bell size={48} color={Colors.textSecondary} />
              </View>
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptyMessage}>
                You&apos;re all caught up! Check back later for updates.
              </Text>
            </View>
          )}

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
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  badge: {
    backgroundColor: Colors.sakuraPink,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.snowWhite,
  },
  markAllButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 80, 122, 0.1)',
    borderRadius: 10,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  notificationCard: {
    backgroundColor: Colors.snowWhite,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  notificationCardUnread: {
    backgroundColor: '#FFF8FA',
    borderWidth: 1,
    borderColor: 'rgba(255, 80, 122, 0.2)',
  },
  unreadDot: {
    position: 'absolute',
    top: 20,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.sakuraPink,
  },
  notificationContent: {
    flexDirection: 'row',
    gap: 12,
  },
  notificationHeader: {
    gap: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  notificationBody: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  bottomPadding: {
    height: 40,
  },
});
