import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Animated, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, MapPin, Wallet, Clock, Trash2, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import CreateTourModal from '@/components/CreateTourModal';
import { useTourCreation } from '@/contexts/TourCreationContext';
import { trpc } from '@/lib/trpc';
import { useUser } from '@/contexts/UserContext';

export default function ToursScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useUser();
  const { deleteTour } = useTourCreation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const templateToursQuery = trpc.tours.getTemplateTours.useQuery();
  const userToursQuery = trpc.tours.getUserTours.useQuery({ userId: user.id });
  const deleteTourMutation = trpc.tours.deleteTour.useMutation({
    onSuccess: () => {
      userToursQuery.refetch();
    },
  });

  const readyTours = templateToursQuery.data || [];
  const userTours = userToursQuery.data || [];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 30,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handleDeleteTour = (tourId: string, tourTitle: string) => {
    Alert.alert(
      'Delete Tour',
      `Are you sure you want to delete "${tourTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteTourMutation.mutate({ id: tourId, userId: user.id });
            deleteTour(tourId);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F0F4FF', '#FFE5F0', '#E8F5F7']}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>My Tours</Text>
          <TouchableOpacity 
              style={styles.addButton} 
              activeOpacity={0.8} 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setModalVisible(true);
              }}
            >
              <Plus size={24} color={Colors.snowWhite} />
              <Sparkles size={16} color={Colors.snowWhite} style={styles.sparkle} />
            </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={templateToursQuery.isRefetching || userToursQuery.isRefetching}
              onRefresh={() => {
                templateToursQuery.refetch();
                userToursQuery.refetch();
              }}
              tintColor={Colors.sakuraPink}
              colors={[Colors.sakuraPink]}
            />
          }
        >
          {(templateToursQuery.isLoading || userToursQuery.isLoading) ? (
            <View style={styles.section}>
              {[1, 2, 3].map(i => (
                <View key={i} style={styles.skeletonTourCard}>
                  <View style={styles.skeletonTourImage} />
                  <View style={styles.skeletonTourContent}>
                    <View style={styles.skeletonTourTitle} />
                    <View style={styles.skeletonTourText} />
                    <View style={styles.skeletonTourStats} />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <>
          {userTours.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My Custom Tours</Text>
              
              {userTours.map((tour) => {
                
                return (
                  <Animated.View
                    key={tour.id}
                    style={[
                      { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
                    ]}
                  >
                    <TouchableOpacity 
                      style={styles.tourCard} 
                      activeOpacity={0.95}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push({ pathname: '/tour/[id]' as any, params: { id: tour.id } });
                      }}
                    >
                    <View style={styles.tourImageContainer}>
                      <Image 
                        source={{ uri: tour.image || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80' }}
                        style={styles.tourImage}
                        contentFit="cover"
                        transition={200}
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.tourImageGradient}
                      >
                        <View style={styles.tourHeader}>
                          <Text style={styles.tourName}>{tour.title}</Text>
                          <TouchableOpacity 
                            style={styles.deleteButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleDeleteTour(tour.id, tour.title);
                            }}
                          >
                            <Trash2 size={18} color={Colors.error} />
                          </TouchableOpacity>
                        </View>
                      </LinearGradient>
                    </View>
                      <View style={styles.tourContent}>
                        <View style={styles.tourDetail}>
                          <MapPin size={16} color={Colors.fujiBlue} />
                          <Text style={styles.tourDetailText}>{tour.places} places</Text>
                        </View>
                        <View style={styles.tourDetail}>
                          <Wallet size={16} color={Colors.success} />
                          <Text style={styles.tourDetailText}>¥{tour.estimatedCost.toLocaleString()}</Text>
                        </View>
                        <View style={styles.tourDetail}>
                          <Clock size={16} color={Colors.sakuraPink} />
                          <Text style={styles.tourDetailText}>{tour.totalHours}h total</Text>
                        </View>
                      </View>
                  </TouchableOpacity>
                </Animated.View>
                );
              })}
            </View>
          )}
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ready Tours</Text>
            
            {readyTours.map((tour, index) => {
              const badgeColors = [
                styles.badgeBlue,
                styles.badgeGreen,
                styles.badgePurple,
                styles.badgeOrange,
                styles.badgeRed,
                styles.badgeTeal,
              ];
              
              return (
                <Animated.View
                  key={tour.id}
                  style={[
                    { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
                  ]}
                >
                  <TouchableOpacity 
                    style={styles.tourCard} 
                    activeOpacity={0.95}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push({ pathname: '/tour/[id]' as any, params: { id: tour.id } });
                    }}
                  >
                    <View style={styles.tourImageContainer}>
                      <Image 
                        source={{ uri: tour.image || '' }}
                        style={styles.tourImage}
                        contentFit="cover"
                        transition={200}
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.85)']}
                        style={styles.tourImageGradient}
                      />
                      <View style={styles.tourOverlayContent}>
                        <Text style={styles.tourName}>{tour.title}</Text>
                        <View style={[styles.badge, badgeColors[index % 6]]}>
                          <Text style={styles.badgeText}>{tour.days}D</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.tourContent}>
                      <Text style={styles.tourDescription} numberOfLines={2}>{tour.description}</Text>
                      <View style={styles.tourStats}>
                        <View style={styles.statItem}>
                          <MapPin size={14} color={Colors.fujiBlue} />
                          <Text style={styles.statText}>{tour.places}</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Wallet size={14} color={Colors.success} />
                          <Text style={styles.statText}>¥{(tour.estimatedCost / 1000).toFixed(0)}k</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Clock size={14} color={Colors.sakuraPink} />
                          <Text style={styles.statText}>{tour.totalHours}h</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
          <View style={styles.bottomPadding} />
          </>
          )}
        </ScrollView>
      </SafeAreaView>

      <CreateTourModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)}
        onEnableSelectionMode={() => router.push('/(tabs)/attractions')}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  addButton: {
    backgroundColor: Colors.sakuraPink,
    borderRadius: 24,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.sakuraPink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  sparkle: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 16,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  tourCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  tourImageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  tourImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  tourImageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  tourOverlayContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tourContent: {
    padding: 16,
    backgroundColor: Colors.surface,
  },
  tourHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tourName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.snowWhite,
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tourDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  tourStats: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeBlue: {
    backgroundColor: Colors.fujiBlue,
  },
  badgeGreen: {
    backgroundColor: Colors.success,
  },
  badgePurple: {
    backgroundColor: '#9333EA',
  },
  badgeOrange: {
    backgroundColor: '#F59E0B',
  },
  badgeRed: {
    backgroundColor: Colors.sakuraPink,
  },
  badgeTeal: {
    backgroundColor: '#14B8A6',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.snowWhite,
    textTransform: 'uppercase',
  },
  tourDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tourDetailText: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginLeft: 8,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  bottomPadding: {
    height: 100,
  },
  skeletonTourCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  skeletonTourImage: {
    width: '100%',
    height: 180,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  skeletonTourContent: {
    padding: 16,
  },
  skeletonTourTitle: {
    width: '70%',
    height: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonTourText: {
    width: '90%',
    height: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonTourStats: {
    width: '60%',
    height: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 4,
  },
});
