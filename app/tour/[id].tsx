import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, MapPin, Wallet, Clock, CheckCircle2, Edit3, Play, StopCircle, ChevronDown, ChevronUp, Footprints, Train, Car, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { TourDay } from '@/mocks/tours';
import { useTourCreation } from '@/contexts/TourCreationContext';
import { trpc } from '@/lib/trpc';
import { useUser } from '@/contexts/UserContext';
import TourEditModal from '@/components/TourEditModal';

export default function TourDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const { userTours, activateTour, deactivateTour, updateTourDays, updateTourPlaces, deleteTour } = useTourCreation();
  const [expandedDays, setExpandedDays] = useState<number[]>([0]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  
  const tourQuery = trpc.tours.getTourById.useQuery({ id: id as string });
  const attractionsQuery = trpc.attractions.getAll.useQuery();
  const cafesQuery = trpc.cafes.getAll.useQuery();
  const expandTemplateQuery = trpc.tours.expandTemplateTour.useQuery(
    { 
      templateId: id as string,
      userLocation: user.location || { lat: 35.6762, lng: 139.6503 },
      startDate: new Date().toISOString().split('T')[0]
    },
    { enabled: !!tourQuery.data && 'isTemplate' in tourQuery.data && tourQuery.data.isTemplate }
  );
  
  const allPlaces = [...(attractionsQuery.data || []), ...(cafesQuery.data || [])];
  const userTour = userTours.find((t) => t.id === id);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);
  
  if (tourQuery.isLoading || attractionsQuery.isLoading || cafesQuery.isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#F0F4FF', '#FFE5F0', '#E8F5F7']}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Loading...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }
  
  if (!tourQuery.data && !userTour) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#F0F4FF', '#FFE5F0', '#E8F5F7']}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Tour not found</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }
  
  const isUserTour = !!userTour;
  const backendTour = tourQuery.data;
  let tourData: any;
  let tourPlaces: any[] = [];
  let detailedDays: TourDay[] = [];
  
  if (isUserTour && userTour) {
    tourPlaces = allPlaces.filter(p => userTour.places.includes(p.id));
    const estimatedCost = tourPlaces.reduce((sum, p) => sum + (p.admissionFee || 0), 0);
    const totalHours = tourPlaces.reduce((sum, p) => sum + (p.avgVisitDuration || 60), 0) / 60;
    
    if (userTour.detailedDays) {
      detailedDays = userTour.detailedDays;
    } else {
      detailedDays = generateDefaultDays(tourPlaces);
    }
    
    tourData = {
      title: userTour.title,
      description: `Custom tour with ${tourPlaces.length} selected places`,
      days: Math.ceil(totalHours / 8),
      totalHours: totalHours.toFixed(1),
      places: tourPlaces.length,
      estimatedCost,
      highlights: tourPlaces.map(p => p.name),
      detailedDays,
      isActive: userTour.isActive,
    };
  } else if (backendTour) {
    if ('isTemplate' in backendTour && backendTour.isTemplate && expandTemplateQuery.data) {
      tourData = backendTour;
      detailedDays = expandTemplateQuery.data.detailedDays || [];
    } else if ('detailedDays' in backendTour) {
      tourData = backendTour;
      detailedDays = backendTour.detailedDays || [];
    } else {
      tourData = backendTour;
      detailedDays = [];
    }
  }

  const toggleDay = (dayIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  const handleActivateTour = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
    
    if (tourData.isActive) {
      Alert.alert(
        'Deactivate Tour',
        'Do you want to deactivate this tour?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Deactivate', onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            deactivateTour();
          }}
        ]
      );
    } else {
      activateTour(id as string);
      Alert.alert('Tour Activated! 🎉', 'This tour is now active. Check the map to see your route!');
    }
  };

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'walk': return <Footprints size={14} color={Colors.textSecondary} />;
      case 'metro': return <Train size={14} color={Colors.textSecondary} />;
      case 'taxi': return <Car size={14} color={Colors.textSecondary} />;
      default: return <Footprints size={14} color={Colors.textSecondary} />;
    }
  };

  const formatTime = (time: string) => {
    return time;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handleSaveTour = (title: string, days: TourDay[]) => {
    updateTourDays(id as string, days);
    
    const allPlaceIds = days.flatMap(day => day.places.map(p => p.placeId));
    updateTourPlaces(id as string, allPlaceIds);
    
    Alert.alert('Success', 'Tour updated successfully!');
  };

  const handleRemovePlace = (dayIndex: number, placeIndex: number) => {
    const newDays = [...detailedDays];
    const day = { ...newDays[dayIndex] };
    day.places = day.places.filter((_, i) => i !== placeIndex);
    
    day.totalCost = day.places.reduce((sum, tp) => {
      const place = allPlaces.find(p => p.id === tp.placeId);
      return sum + (place?.admissionFee || 0) + tp.transportCost;
    }, 0);
    day.totalDuration = day.places.reduce((sum, tp) => sum + tp.visitDuration + tp.transportDuration, 0);
    
    newDays[dayIndex] = day;
    updateTourDays(id as string, newDays);
  };

  const handleDeleteTour = () => {
    Alert.alert(
      'Delete Tour',
      `Are you sure you want to delete "${tourData.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            deleteTour(id as string);
            router.back();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#F0F4FF', '#FFE5F0', '#E8F5F7']}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tour Details</Text>
          {isUserTour ? (
            <TouchableOpacity onPress={handleDeleteTour} style={styles.deleteHeaderButton}>
              <Trash2 size={20} color={Colors.error} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <Animated.View style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}>
            <Text style={styles.tourTitle}>{tourData.title}</Text>
            <Text style={styles.description}>{tourData.description}</Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#EBF5FF' }]}>
                  <Clock size={20} color={Colors.fujiBlue} />
                </View>
                <Text style={styles.statLabel}>{tourData.days} Days</Text>
                <Text style={styles.statValue}>{tourData.totalHours}h total</Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#FFF0F0' }]}>
                  <MapPin size={20} color={Colors.sakuraPink} />
                </View>
                <Text style={styles.statLabel}>{tourData.places} Places</Text>
                <Text style={styles.statValue}>To visit</Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#F0FFF4' }]}>
                  <Wallet size={20} color={Colors.success} />
                </View>
                <Text style={styles.statLabel}>¥{tourData.estimatedCost.toLocaleString()}</Text>
                <Text style={styles.statValue}>Estimated</Text>
              </View>
            </View>
          </Animated.View>

          {detailedDays.length > 0 ? (
            <View>
              <View style={styles.daysHeader}>
                <Text style={styles.sectionTitle}>Day by Day Plan</Text>
                {isUserTour && (
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => setEditModalVisible(true)}
                  >
                    <Edit3 size={18} color={Colors.sakuraPink} />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {detailedDays.map((day, dayIndex) => (
                <View key={dayIndex} style={styles.dayCard}>
                  <TouchableOpacity 
                    style={styles.dayHeader}
                    onPress={() => toggleDay(dayIndex)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dayHeaderLeft}>
                      <Text style={styles.dayTitle}>Day {day.dayNumber}</Text>
                      {day.date && <Text style={styles.dayDate}>{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>}
                    </View>
                    <View style={styles.dayHeaderRight}>
                      <View style={styles.dayStat}>
                        <Clock size={14} color={Colors.textSecondary} />
                        <Text style={styles.dayStatText}>{formatDuration(day.totalDuration)}</Text>
                      </View>
                      <View style={styles.dayStat}>
                        <Wallet size={14} color={Colors.textSecondary} />
                        <Text style={styles.dayStatText}>¥{day.totalCost.toLocaleString()}</Text>
                      </View>
                      {expandedDays.includes(dayIndex) ? 
                        <ChevronUp size={20} color={Colors.textPrimary} /> : 
                        <ChevronDown size={20} color={Colors.textPrimary} />
                      }
                    </View>
                  </TouchableOpacity>

                  {expandedDays.includes(dayIndex) && (
                    <View style={styles.dayContent}>
                      {day.places.map((tourPlace, placeIndex) => {
                        const place = allPlaces.find(p => p.id === tourPlace.placeId);
                        if (!place) return null;

                        return (
                          <View key={placeIndex}>
                            <TouchableOpacity 
                              style={styles.timelineItem}
                              onPress={() => router.push({ pathname: '/place/[id]' as any, params: { id: place.id } })}
                              activeOpacity={0.7}
                            >
                              <View style={styles.timelineLeft}>
                                <View style={styles.timelineDot} />
                                {placeIndex < day.places.length - 1 && <View style={styles.timelineLine} />}
                              </View>
                              
                              <View style={styles.timelineContent}>
                                <View style={styles.timelineHeader}>
                                  <Text style={styles.timelineTime}>{formatTime(tourPlace.plannedTime)}</Text>
                                  <View style={styles.timelineDuration}>
                                    <Clock size={12} color={Colors.textSecondary} />
                                    <Text style={styles.timelineDurationText}>{formatDuration(tourPlace.visitDuration)}</Text>
                                  </View>
                                </View>
                                
                                <View style={styles.placeCard}>
                                  <Image source={{ uri: place.images[0] }} style={styles.smallPlaceImage} />
                                  <View style={styles.placeCardInfo}>
                                    <Text style={styles.placeCardName}>{place.name}</Text>
                                    <Text style={styles.placeCardCategory}>{place.category} • {place.ward}</Text>
                                    <View style={styles.placeCardMeta}>
                                      <Text style={styles.placeCardCost}>¥{place.admissionFee?.toLocaleString() || 'Free'}</Text>
                                    </View>
                                  </View>
                                </View>
                              </View>
                            </TouchableOpacity>

                            {placeIndex < day.places.length - 1 && (
                              <View style={styles.transportInfo}>
                                <View style={styles.transportLeft}>
                                  <View style={styles.transportDot} />
                                </View>
                                <View style={styles.transportContent}>
                                  {getTransportIcon(tourPlace.transportMode)}
                                  <Text style={styles.transportText}>
                                    {tourPlace.transportMode.charAt(0).toUpperCase() + tourPlace.transportMode.slice(1)} • {formatDuration(tourPlace.transportDuration)}
                                  </Text>
                                  {tourPlace.transportCost > 0 && (
                                    <Text style={styles.transportCost}> • ¥{tourPlace.transportCost}</Text>
                                  )}
                                </View>
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : isUserTour && tourPlaces.length > 0 ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Places in Tour</Text>
              {tourPlaces.map((place, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.placeItem}
                  onPress={() => router.push({ pathname: '/place/[id]' as any, params: { id: place.id } })}
                >
                  <Image source={{ uri: place.images[0] }} style={styles.placeImage} />
                  <View style={styles.placeInfo}>
                    <Text style={styles.placeName}>{place.name}</Text>
                    <Text style={styles.placeCategory}>{place.category} • {place.ward}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Highlights</Text>
              {tourData.highlights.map((highlight: string, index: number) => (
                <View key={index} style={styles.highlightItem}>
                  <CheckCircle2 size={20} color={Colors.success} />
                  <Text style={styles.highlightText}>{highlight}</Text>
                </View>
              ))}
            </View>
          )}

          {isUserTour && (
            <Animated.View style={[
              styles.buttonContainer,
              { opacity: fadeAnim, transform: [{ scale: buttonScale }] }
            ]}>
              <TouchableOpacity 
                style={[styles.actionButton, tourData.isActive && styles.activeButton]} 
                activeOpacity={0.8}
                onPress={handleActivateTour}
              >
                {tourData.isActive ? (
                  <>
                    <StopCircle size={20} color={Colors.snowWhite} />
                    <Text style={styles.actionButtonText}>Deactivate Tour</Text>
                  </>
                ) : (
                  <>
                    <Play size={20} color={Colors.snowWhite} />
                    <Text style={styles.actionButtonText}>Activate Tour</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.mapButton} 
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/map')}
              >
                <MapPin size={20} color={Colors.sakuraPink} />
                <Text style={styles.mapButtonText}>View on Map</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
          
          {!isUserTour && detailedDays.length > 0 && (
            <Animated.View style={[
              styles.buttonContainer,
              { opacity: fadeAnim }
            ]}>
              <TouchableOpacity 
                style={styles.actionButton} 
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/map')}
              >
                <MapPin size={20} color={Colors.snowWhite} />
                <Text style={styles.actionButtonText}>View on Map</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>

      {isUserTour && userTour && detailedDays.length > 0 && (
        <TourEditModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          tourId={id as string}
          tourTitle={userTour.title}
          detailedDays={detailedDays}
          onSave={handleSaveTour}
          onRemovePlace={handleRemovePlace}
        />
      )}
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
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  deleteHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tourTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  highlightText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  startButton: {
    height: 56,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.snowWhite,
  },
  bottomPadding: {
    height: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 12,
  },
  placeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  placeName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  placeCategory: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 80, 122, 0.1)',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.sakuraPink,
  },
  dayCard: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(43, 109, 159, 0.05)',
  },
  dayHeaderLeft: {
    flex: 1,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  dayDate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  dayHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayStatText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  dayContent: {
    padding: 16,
    paddingTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  timelineLeft: {
    width: 24,
    alignItems: 'center',
    paddingTop: 6,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.fujiBlue,
    borderWidth: 2,
    borderColor: Colors.surface,
    shadowColor: Colors.fujiBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 12,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  timelineTime: {
    fontSize: 15,
    fontWeight: 'bold' as const,
    color: Colors.textPrimary,
  },
  timelineDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timelineDurationText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  placeCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 10,
    gap: 12,
  },
  smallPlaceImage: {
    width: 70,
    height: 70,
    borderRadius: 6,
  },
  placeCardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  placeCardName: {
    fontSize: 15,
    fontWeight: 'bold' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  placeCardCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  placeCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeCardCost: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.success,
  },
  transportInfo: {
    flexDirection: 'row',
    marginLeft: 0,
    marginBottom: 8,
    marginTop: 4,
  },
  transportLeft: {
    width: 24,
    alignItems: 'center',
    paddingVertical: 4,
  },
  transportDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textTertiary,
  },
  transportContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    gap: 6,
    paddingVertical: 6,
  },
  transportText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  transportCost: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    height: 56,
    borderRadius: 10,
    backgroundColor: Colors.sakuraPink,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.sakuraPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  activeButton: {
    backgroundColor: Colors.error,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.snowWhite,
  },
  mapButton: {
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.sakuraPink,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  mapButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.sakuraPink,
  },
});

function generateDefaultDays(places: any[]): TourDay[] {
  if (places.length === 0) return [];
  
  const placesPerDay = 4;
  const days: TourDay[] = [];
  
  for (let i = 0; i < places.length; i += placesPerDay) {
    const dayPlaces = places.slice(i, i + placesPerDay);
    let currentTime = 9 * 60;
    
    const tourPlaces = dayPlaces.map((place, index) => {
      const visitDuration = place.avgVisitDuration || 60;
      const plannedHour = Math.floor(currentTime / 60);
      const plannedMin = currentTime % 60;
      const plannedTime = `${plannedHour.toString().padStart(2, '0')}:${plannedMin.toString().padStart(2, '0')}`;
      
      const transportDuration = index < dayPlaces.length - 1 ? 15 : 0;
      const transportCost = index < dayPlaces.length - 1 ? 200 : 0;
      
      currentTime += visitDuration + transportDuration;
      
      return {
        placeId: place.id,
        plannedTime,
        visitDuration,
        transportMode: 'metro' as const,
        transportDuration,
        transportCost,
      };
    });
    
    const totalCost = dayPlaces.reduce((sum, p) => sum + (p.admissionFee || 0), 0) + 
                     tourPlaces.reduce((sum, tp) => sum + tp.transportCost, 0);
    const totalDuration = tourPlaces.reduce((sum, tp) => sum + tp.visitDuration + tp.transportDuration, 0);
    
    const today = new Date();
    today.setDate(today.getDate() + Math.floor(i / placesPerDay));
    
    days.push({
      dayNumber: Math.floor(i / placesPerDay) + 1,
      date: today.toISOString().split('T')[0],
      places: tourPlaces,
      totalCost,
      totalDuration,
    });
  }
  
  return days;
}
