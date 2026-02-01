import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Animated, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, SlidersHorizontal, MapPin, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import FilterModal, { FilterOptions } from '@/components/FilterModal';
import { trpc } from '@/lib/trpc';
import { useUser } from '@/contexts/UserContext';
import { calculateDistance } from '@/backend/services/distance-calculator';

export default function EventsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const router = useRouter();
  const { user } = useUser();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const eventsQuery = trpc.events.getUpcoming.useQuery();

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
  }, [fadeAnim, slideAnim]);

  const eventsRaw = eventsQuery.data || [];

  const events = eventsRaw.map(event => {
    const distanceInfo = event.coordinates 
      ? calculateDistance(user.location, event.coordinates)
      : { distance: 0, duration: 0, mode: 'walk' as const, cost: 0 };
    return {
      ...event,
      distanceKm: distanceInfo.distance,
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  const filteredEvents = events.filter((event) => {
    if (!event.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    if (filters.distance && filters.distance.length > 0) {
      const matchesDistance = filters.distance.some((d) => {
        if (d === '< 500m') return event.distanceKm < 0.5;
        if (d === '< 1km') return event.distanceKm < 1;
        if (d === '< 2km') return event.distanceKm < 2;
        if (d === '< 5km') return event.distanceKm < 5;
        if (d === '< 10km') return event.distanceKm < 10;
        return false;
      });
      if (!matchesDistance) return false;
    }
    
    if (filters.eventType && filters.eventType.length > 0) {
      if (!filters.eventType.includes(event.type)) return false;
    }
    
    if (filters.ward && filters.ward.length > 0) {
      if (!filters.ward.includes(event.ward)) return false;
    }
    
    return true;
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E8F5F7', '#FFE5F0', '#F0E8FF']}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Events</Text>
          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search events..."
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
              refreshing={eventsQuery.isRefetching}
              onRefresh={() => eventsQuery.refetch()}
              tintColor={Colors.sakuraPink}
              colors={[Colors.sakuraPink]}
            />
          }
        >
          {eventsQuery.isLoading ? (
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
          ) : eventsQuery.isError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Oops!</Text>
              <Text style={styles.errorText}>Failed to load events. Please try again.</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => eventsQuery.refetch()}
                activeOpacity={0.8}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredEvents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No events found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            </View>
          ) : filteredEvents
            .map((event, index) => (
              <Animated.View
                key={event.id}
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
                    router.push({ pathname: '/event/[id]' as any, params: { id: event.id } });
                  }}
                >
                <View style={styles.cardImageContainer}>
                  <Image 
                    source={{ uri: event.image || '' }} 
                    style={styles.cardImage}
                    contentFit="cover"
                    transition={200}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.cardGradient}
                  />
                  {index === 0 && (
                    <View style={styles.featuredBadge}>
                      <Sparkles size={14} color={Colors.snowWhite} />
                      <Text style={styles.featuredText}>Featured</Text>
                    </View>
                  )}
                  <View style={styles.cardContent}>
                    <Text style={styles.cardName}>{event.name}</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.typeText}>{event.type}</Text>
                      <Text style={styles.separator}>•</Text>
                      <MapPin size={14} color={Colors.snowWhite} />
                      <Text style={styles.location}>{event.ward}</Text>
                      <Text style={styles.separator}>•</Text>
                      <Text style={styles.distance}>
                        {event.distanceKm < 1 
                          ? `${Math.round(event.distanceKm * 1000)}m`
                          : `${event.distanceKm.toFixed(1)}km`}
                      </Text>
                      <View style={styles.feeContainer}>
                        <Text style={styles.fee}>
                          {event.admissionFee === 0 ? 'Free' : `¥${event.admissionFee.toLocaleString()}`}
                        </Text>
                      </View>
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
        type="events"
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
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
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
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
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.sakuraPink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
    shadowColor: Colors.sakuraPink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
  },
  featuredText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.snowWhite,
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
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 14,
    color: Colors.snowWhite,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  separator: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 6,
  },
  location: {
    fontSize: 14,
    color: Colors.snowWhite,
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  distance: {
    fontSize: 14,
    color: Colors.snowWhite,
    marginLeft: 4,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
