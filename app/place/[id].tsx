import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, MapPin, Star, Map, Plus, Train } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useTourCreation } from '@/contexts/TourCreationContext';
import { calculateDistance } from '@/backend/services/distance-calculator';
import { trpc } from '@/lib/trpc';
import { useUser } from '@/contexts/UserContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const { selectionMode, selectedPlaces, togglePlaceSelection } = useTourCreation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const attractionQuery = trpc.attractions.getById.useQuery(
    { id: id as string },
    { enabled: !!id }
  );
  const cafeQuery = trpc.cafes.getById.useQuery(
    { id: id as string },
    { enabled: !!id && !attractionQuery.data && !attractionQuery.isLoading }
  );

  const nearbyAttractionsQuery = trpc.attractions.getAll.useQuery({
    userLocation: user.location,
  });
  const nearbyCafesQuery = trpc.cafes.getAll.useQuery({
    userLocation: user.location,
  });

  const place = attractionQuery.data || cafeQuery.data;
  
  const isSelected = selectedPlaces.includes(id as string);

  const nearbyPlaces = useMemo(() => {
    if (!place) return [];
    
    const allPlaces = [
      ...(nearbyAttractionsQuery.data || []),
      ...(nearbyCafesQuery.data || []),
    ];
    
    const placesWithDistance = allPlaces
      .filter(p => p.id !== id && p.ward === place.ward)
      .map(p => {
        const distanceInfo = calculateDistance(place.coordinates, p.coordinates);
        return {
          ...p,
          distanceKm: distanceInfo.distance,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 3);
    
    return placesWithDistance;
  }, [id, place, nearbyAttractionsQuery.data, nearbyCafesQuery.data]);

  if (attractionQuery.isLoading || cafeQuery.isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  if (!place) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Colors.textSecondary }}>Place not found</Text>
      </View>
    );
  }

  const handleAddToTour = () => {
    if (selectionMode) {
      togglePlaceSelection(id as string);
    } else {
      Alert.alert('Add to Tour', 'Start creating a tour first to add places');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setCurrentImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {place.images && place.images.length > 0 ? (
              place.images.map((image, index) => (
                <Image 
                  key={index} 
                  source={{ uri: image }} 
                  style={styles.headerImage}
                  contentFit="cover"
                  transition={200}
                />
              ))
            ) : (
              <View style={[styles.headerImage, { backgroundColor: Colors.surface }]} />
            )}
          </ScrollView>
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageGradient}
          />
          <SafeAreaView edges={['top']} style={styles.topBar}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={Colors.snowWhite} />
            </TouchableOpacity>
          </SafeAreaView>
          
          {place.images.length > 1 && (
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {currentImageIndex + 1} / {place.images.length}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>{place.name}</Text>
            <View style={styles.ratingContainer}>
              <Star size={20} color={Colors.warning} fill={Colors.warning} />
              <Text style={styles.rating}>{place.rating}</Text>
              <Text style={styles.ratingCount}>({place.reviewCount || 0} reviews)</Text>
            </View>
            <View style={styles.tagContainer}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{place.category}</Text>
              </View>
              <View style={styles.tag}>
                <MapPin size={14} color={Colors.textSecondary} />
                <Text style={styles.tagText}>{place.ward}</Text>
              </View>
            </View>
          </View>

          {place.nearestStation && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📍 Location & Transport</Text>
              <View style={styles.infoBox}>
                <MapPin size={18} color={Colors.textSecondary} />
                <Text style={styles.infoText}>{place.ward}, Tokyo</Text>
              </View>
              <View style={styles.infoBox}>
                <Train size={18} color={Colors.sakuraPink} />
                <Text style={styles.infoText}>{place.nearestStation}</Text>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏰ Opening Hours</Text>
            <Text style={styles.infoText}>9:00 AM - 6:00 PM</Text>
            <View style={styles.openBadge}>
              <View style={styles.openDot} />
              <Text style={styles.openText}>Open now</Text>
            </View>
          </View>

          {place.admissionFee !== undefined && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💴 Admission</Text>
              <Text style={styles.priceText}>
                {place.admissionFee === 0 ? 'Free entry' : `¥${place.admissionFee.toLocaleString()}`}
              </Text>
            </View>
          )}

          {place.priceLevel && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💴 Price Level</Text>
              <Text style={styles.priceText}>{'¥'.repeat(place.priceLevel)}</Text>
            </View>
          )}

          {place.avgVisitDuration && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⏱️ Recommended Duration</Text>
              <Text style={styles.infoText}>
                {place.avgVisitDuration < 60 
                  ? `${place.avgVisitDuration} minutes`
                  : `${Math.floor(place.avgVisitDuration / 60)} - ${Math.ceil(place.avgVisitDuration / 60)} hours`
                }
              </Text>
            </View>
          )}

          {place.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{place.description}</Text>
            </View>
          )}

          {place.cuisineTypes && place.cuisineTypes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🍽️ Cuisine</Text>
              <View style={styles.cuisineContainer}>
                {place.cuisineTypes.map((cuisine, index) => (
                  <View key={index} style={styles.cuisineTag}>
                    <Text style={styles.cuisineText}>{cuisine}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💬 Reviews</Text>
            <View style={styles.reviewPreview}>
              <View style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>Sarah T.</Text>
                  <View style={styles.reviewStars}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} color={Colors.warning} fill={Colors.warning} />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewText}>Amazing experience! A must-visit in Tokyo.</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See all {place.reviewCount || 0} reviews</Text>
            </TouchableOpacity>
          </View>

          {nearbyPlaces.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🗺️ Nearby Attractions</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.nearbyScroll}>
                {nearbyPlaces.map((nearbyPlace) => (
                  <TouchableOpacity
                    key={nearbyPlace.id}
                    style={styles.nearbyCard}
                    onPress={() => router.push({ pathname: '/place/[id]', params: { id: nearbyPlace.id } })}
                  >
                    <Image 
                      source={{ uri: nearbyPlace.images?.[0] || '' }} 
                      style={styles.nearbyImage}
                      contentFit="cover"
                      transition={200}
                    />
                    <Text style={styles.nearbyName} numberOfLines={1}>{nearbyPlace.name}</Text>
                    <View style={styles.nearbyInfo}>
                      <View style={styles.nearbyRating}>
                        <Star size={12} color={Colors.warning} fill={Colors.warning} />
                        <Text style={styles.nearbyRatingText}>{nearbyPlace.rating}</Text>
                      </View>
                      <Text style={styles.nearbyDistance}>
                        {nearbyPlace.distanceKm < 1 
                          ? `${Math.round(nearbyPlace.distanceKm * 1000)}m`
                          : `${nearbyPlace.distanceKm.toFixed(1)}km`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton}>
          <Map size={20} color={Colors.snowWhite} />
          <Text style={styles.footerButtonText}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.footerButton, styles.footerButtonPrimary, isSelected && styles.footerButtonSelected]}
          onPress={handleAddToTour}
        >
          <Plus size={20} color={Colors.snowWhite} />
          <Text style={styles.footerButtonText}>{isSelected ? 'Added' : 'Add to Tour'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 350,
    position: 'relative',
  },
  headerImage: {
    width: SCREEN_WIDTH,
    height: 350,
  },
  imageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  imageCounterText: {
    color: Colors.snowWhite,
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rating: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 6,
  },
  ratingCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  tagText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  openBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  openDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginRight: 6,
  },
  openText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '600',
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  cuisineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cuisineTag: {
    backgroundColor: Colors.sakuraPink,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cuisineText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.snowWhite,
  },
  bottomPadding: {
    height: 100,
  },
  reviewPreview: {
    gap: 12,
  },
  reviewItem: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  seeAllButton: {
    marginTop: 12,
  },
  seeAllText: {
    fontSize: 16,
    color: Colors.sakuraPink,
    fontWeight: '600',
  },
  nearbyScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  nearbyCard: {
    width: 140,
    marginRight: 12,
  },
  nearbyImage: {
    width: 140,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  nearbyName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  nearbyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nearbyRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nearbyRatingText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  nearbyDistance: {
    fontSize: 11,
    color: Colors.sakuraPink,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.textSecondary,
    borderRadius: 8,
    gap: 6,
  },
  footerButtonPrimary: {
    backgroundColor: Colors.sakuraPink,
  },
  footerButtonSelected: {
    backgroundColor: Colors.success,
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.snowWhite,
  },
});
