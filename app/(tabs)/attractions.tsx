import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Animated, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, SlidersHorizontal, Star, MapPin, CheckCircle2, Circle, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import FilterModal, { FilterOptions } from '@/components/FilterModal';
import { useTourCreation } from '@/contexts/TourCreationContext';
import { trpc } from '@/lib/trpc';
import { useUser } from '@/contexts/UserContext';
import { calculateDistance } from '@/backend/services/distance-calculator';

export default function AttractionsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const router = useRouter();
  const { user } = useUser();
  const { selectionMode, selectedPlaces, togglePlaceSelection, createTour } = useTourCreation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const attractionsQuery = trpc.attractions.getAll.useQuery({
    userLocation: user.location,
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 30,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {};
  }, [fadeAnim, slideAnim]);

  const attractionsRaw = attractionsQuery.data || [];

  const attractions = attractionsRaw.map(place => {
    const distanceInfo = place.coordinates 
      ? calculateDistance(user.location, place.coordinates)
      : { distance: 0, duration: 0, mode: 'walk' as const, cost: 0 };
    return {
      ...place,
      distanceKm: distanceInfo.distance,
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  const filteredAttractions = attractions.filter((place) => {
    if (!place.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    if (filters.distance && filters.distance.length > 0) {
      const matchesDistance = filters.distance.some((d) => {
        if (d === '< 500m') return place.distanceKm < 0.5;
        if (d === '< 1km') return place.distanceKm < 1;
        if (d === '< 2km') return place.distanceKm < 2;
        if (d === '< 5km') return place.distanceKm < 5;
        if (d === '< 10km') return place.distanceKm < 10;
        return false;
      });
      if (!matchesDistance) return false;
    }
    
    if (filters.rating && filters.rating.length > 0) {
      const rating = place.rating;
      const matchesRating = filters.rating.some((r) => {
        if (r === '5.0') return rating === 5.0;
        if (r === '4.5-4.9') return rating >= 4.5 && rating < 5.0;
        if (r === '4.0-4.4') return rating >= 4.0 && rating < 4.5;
        if (r === '3.0-3.9') return rating >= 3.0 && rating < 4.0;
        return false;
      });
      if (!matchesRating) return false;
    }
    
    if (filters.category && filters.category.length > 0) {
      if (!filters.category.includes(place.category)) return false;
    }
    
    if (filters.ward && filters.ward.length > 0) {
      if (!filters.ward.includes(place.ward)) return false;
    }
    
    return true;
  });

  const toggleSelection = (placeId: string) => {
    togglePlaceSelection(placeId);
  };

  const handleCreateTour = () => {
    createTour();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFE5EC', '#F0F4FF', '#E8F5F7']}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Attractions</Text>
            {selectionMode && selectedPlaces.length > 0 && (
              <TouchableOpacity 
                style={styles.createTourButton} 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  handleCreateTour();
                }}
                activeOpacity={0.8}
              >
                <Sparkles size={16} color={Colors.snowWhite} />
                <Text style={styles.createTourText}>Create Tour ({selectedPlaces.length})</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search attractions..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity 
              style={styles.filterButton} 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFilterModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <SlidersHorizontal size={20} color={Colors.sakuraPink} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={attractionsQuery.isRefetching}
              onRefresh={() => attractionsQuery.refetch()}
              tintColor={Colors.sakuraPink}
              colors={[Colors.sakuraPink]}
            />
          }
        >
          {attractionsQuery.isLoading ? (
            <View>
              {[1, 2, 3, 4].map(i => (
                <View key={i} style={styles.skeletonCard}>
                  <View style={styles.skeletonImage} />
                  <View style={styles.skeletonContent}>
                    <View style={styles.skeletonTitle} />
                    <View style={styles.skeletonText} />
                  </View>
                </View>
              ))}
            </View>
          ) : attractionsQuery.isError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Oops!</Text>
              <Text style={styles.errorText}>Failed to load attractions. Please try again.</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => attractionsQuery.refetch()}
                activeOpacity={0.8}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredAttractions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No attractions found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            </View>
          ) : filteredAttractions
            .map((place, index) => (
              <Animated.View
                key={place.id}
                style={[
                  styles.cardWrapper,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 50],
                          outputRange: [0, 50],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <TouchableOpacity 
                  style={styles.card} 
                  activeOpacity={0.95}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (selectionMode) {
                      toggleSelection(place.id);
                    } else {
                      router.push({ pathname: '/place/[id]', params: { id: place.id } });
                    }
                  }}
                >
                <View style={styles.cardImageContainer}>
                  <Image 
                    source={{ uri: place.images?.[0] || '' }} 
                    style={styles.cardImage}
                    contentFit="cover"
                    transition={200}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.cardGradient}
                  />
                  {selectionMode && (
                    <View style={styles.checkboxContainer}>
                      {selectedPlaces.includes(place.id) ? (
                        <CheckCircle2 size={28} color={Colors.sakuraPink} fill={Colors.sakuraPink} />
                      ) : (
                        <Circle size={28} color={Colors.snowWhite} />
                      )}
                    </View>
                  )}
                  <View style={styles.cardContent}>
                    <Text style={styles.cardName}>{place.name}</Text>
                    <View style={styles.ratingRow}>
                      <Star size={16} color={Colors.warning} fill={Colors.warning} />
                      <Text style={styles.rating}>{place.rating}</Text>
                      <Text style={styles.separator}>•</Text>
                      <Text style={styles.category}>{place.category}</Text>
                      <Text style={styles.separator}>•</Text>
                      <MapPin size={14} color={Colors.snowWhite} />
                      <Text style={styles.location}>{place.ward}</Text>
                      <Text style={styles.separator}>•</Text>
                      <Text style={styles.distance}>
                        {place.distanceKm < 1 
                          ? `${Math.round(place.distanceKm * 1000)}m`
                          : `${place.distanceKm.toFixed(1)}km`}
                      </Text>
                      {place.admissionFee !== undefined && (
                        <View style={styles.feeContainer}>
                          <Text style={styles.fee}>
                            {place.admissionFee === 0 ? 'Free' : `¥${place.admissionFee.toLocaleString()}`}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
            ))}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        type="attractions"
        filters={filters}
        onApply={setFilters}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  createTourButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.sakuraPink,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: Colors.sakuraPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createTourText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.snowWhite,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  filterButton: {
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 16,
  },
  cardWrapper: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  card: {
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderRadius: 16,
  },
  cardImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  checkboxContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.snowWhite,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.snowWhite,
    marginLeft: 6,
  },
  separator: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 6,
  },
  category: {
    fontSize: 14,
    color: Colors.snowWhite,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: Colors.snowWhite,
    marginLeft: 4,
  },
  distance: {
    fontSize: 14,
    color: Colors.snowWhite,
    marginLeft: 4,
    fontWeight: '600',
  },
  feeContainer: {
    backgroundColor: Colors.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 6,
    borderRadius: 8,
  },
  fee: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.snowWhite,
  },
  bottomPadding: {
    height: 100,
  },
  skeletonCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  skeletonImage: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  skeletonContent: {
    padding: 16,
  },
  skeletonTitle: {
    width: '60%',
    height: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonText: {
    width: '80%',
    height: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 4,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.sakuraPink,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.snowWhite,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
