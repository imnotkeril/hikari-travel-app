import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Linking, Platform } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navigation, Route, X, MapPinned, Coffee, Star, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/colors';
import { useQuery } from '@tanstack/react-query';
import { getAttractions, getCafes } from '@/lib/api';
import { useUser } from '@/contexts/UserContext';
import { useTourCreation } from '@/contexts/TourCreationContext';

// Import react-native-maps (mock on web, real on native)
// Metro resolver will automatically use mock on web platform
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;
let PROVIDER_DEFAULT: any = null;

try {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  Polyline = maps.Polyline;
  PROVIDER_DEFAULT = maps.PROVIDER_DEFAULT;
} catch (e) {
  console.warn('react-native-maps not available');
}

export default function MapScreen() {
  const [showAttractions, setShowAttractions] = useState(true);
  const [showRestaurants, setShowRestaurants] = useState(true);
  const [showTourRoute, setShowTourRoute] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  const mapRef = useRef<MapView>(null);
  const { getActiveTour } = useTourCreation();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  
  const attractionsQuery = useQuery({
    queryKey: ['attractions', user.location],
    queryFn: () => getAttractions(user.location),
  });
  const cafesQuery = useQuery({
    queryKey: ['cafes', user.location],
    queryFn: () => getCafes(user.location),
  });
  
  const attractions = attractionsQuery.data || [];
  const cafes = cafesQuery.data || [];
  const restaurants = cafes.filter(c => c.type === 'restaurant');
  
  const activeTour = getActiveTour();
  const tourPlaces = activeTour 
    ? attractions.filter(p => activeTour.places.includes(p.id))
    : [];
  
  const tourCoordinates = tourPlaces.map(place => ({
    latitude: place.coordinates.lat,
    longitude: place.coordinates.lng,
  }));

  useEffect(() => {
    if (activeTour && tourCoordinates.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(tourCoordinates, {
        edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
        animated: true,
      });
      setShowTourRoute(true);
    }
  }, [activeTour]);

  useEffect(() => {
    if (params.selectedPlaceId) {
      const allPlaces = [...attractions, ...restaurants, ...cafes];
      const place = allPlaces.find(p => p.id === params.selectedPlaceId);
      if (place && mapRef.current) {
        setSelectedPlace(place);
        setTimeout(() => {
          mapRef.current?.animateToRegion({
            latitude: place.coordinates.lat,
            longitude: place.coordinates.lng,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }, 1000);
        }, 100);
      }
    }
  }, [params.selectedPlaceId, attractions, restaurants, cafes]);

  const handleOpenGoogleMaps = () => {
    if (!selectedPlace) return;
    
    const { lat, lng } = selectedPlace.coordinates;
    const label = encodeURIComponent(selectedPlace.name);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    
    Linking.openURL(url);
  };

  // Web fallback - maps don't work on web
  if (Platform.OS === 'web' || !MapView) {
    return (
      <View style={styles.container}>
        <View style={[styles.map, { justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surface }]}>
          <Text style={{ fontSize: 18, color: Colors.textPrimary, marginBottom: 10 }}>🗺️ Map View</Text>
          <Text style={{ fontSize: 14, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 40 }}>
            Interactive maps are available on iOS and Android.{'\n'}
            On web, use the list view to browse places.
          </Text>
          <ScrollView style={{ marginTop: 20, width: '100%', paddingHorizontal: 20 }}>
            {attractions.slice(0, 5).map((place) => (
              <TouchableOpacity
                key={place.id}
                style={styles.placeCard}
                onPress={() => router.push({ pathname: '/place/[id]', params: { id: place.id } })}
              >
                <Text style={styles.placeName}>{place.name}</Text>
                <Text style={styles.placeCategory}>{place.category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: 35.6762,
          longitude: 139.6503,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {activeTour && showTourRoute && tourCoordinates.length > 1 && (
          <Polyline
            coordinates={tourCoordinates}
            strokeColor={Colors.sakuraPink}
            strokeWidth={3}
            lineDashPattern={[1]}
          />
        )}
        
        {activeTour && tourPlaces.map((place, index) => (
          <Marker
            key={`tour-${place.id}`}
            coordinate={{
              latitude: place.coordinates.lat,
              longitude: place.coordinates.lng,
            }}
            title={place.name}
            description={`Stop ${index + 1}`}
            pinColor="#FFD700"
            onCalloutPress={() =>
              router.push({ pathname: '/place/[id]', params: { id: place.id } })
            }
          >
            <View style={styles.tourMarker}>
              <Text style={styles.tourMarkerText}>{index + 1}</Text>
            </View>
          </Marker>
        ))}
        
        {showAttractions &&
          attractions
          .filter(place => !tourPlaces.find(tp => tp.id === place.id))
          .map((place) => (
            <Marker
              key={place.id}
              coordinate={{
                latitude: place.coordinates.lat,
                longitude: place.coordinates.lng,
              }}
              title={place.name}
              description={place.category}
              pinColor={selectedPlace?.id === place.id ? '#FFD700' : Colors.fujiBlue}
              onPress={() => setSelectedPlace(place)}
            />
          ))}
        {showRestaurants &&
          cafes
          .filter(place => !tourPlaces.find(tp => tp.id === place.id))
          .map((place) => (
            <Marker
              key={place.id}
              coordinate={{
                latitude: place.coordinates.lat,
                longitude: place.coordinates.lng,
              }}
              title={place.name}
              description={place.category}
              pinColor={selectedPlace?.id === place.id ? '#FFD700' : Colors.sakuraPink}
              onPress={() => setSelectedPlace(place)}
            />
          ))}
      </MapView>

      <SafeAreaView style={styles.overlay} edges={['top']} pointerEvents="box-none">
        <View style={styles.header}>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[
                styles.iconButton,
                showAttractions && styles.iconButtonActive
              ]}
              activeOpacity={0.8}
              onPress={() => setShowAttractions(!showAttractions)}
            >
              <MapPinned 
                size={20} 
                color={showAttractions ? Colors.snowWhite : Colors.textPrimary} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.iconButton,
                showRestaurants && styles.iconButtonActive
              ]}
              activeOpacity={0.8}
              onPress={() => setShowRestaurants(!showRestaurants)}
            >
              <Coffee 
                size={20} 
                color={showRestaurants ? Colors.snowWhite : Colors.textPrimary} 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.locationButton} 
              activeOpacity={0.8}
              onPress={() => {
                if (mapRef.current) {
                  mapRef.current.animateToRegion({
                    latitude: 35.6762,
                    longitude: 139.6503,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                  }, 1000);
                }
              }}
            >
              <Navigation size={20} color={Colors.snowWhite} />
            </TouchableOpacity>
          </View>
        </View>

        {activeTour && (
          <View style={styles.activeTourBanner}>
            <View style={styles.activeTourContent}>
              <Route size={20} color={Colors.snowWhite} />
              <View style={styles.activeTourInfo}>
                <Text style={styles.activeTourTitle}>{activeTour.title}</Text>
                <Text style={styles.activeTourSubtitle}>{tourPlaces.length} places • Active Route</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTourRoute(!showTourRoute)}
            >
              {showTourRoute ? (
                <X size={20} color={Colors.snowWhite} />
              ) : (
                <Route size={20} color={Colors.snowWhite} />
              )}
            </TouchableOpacity>
          </View>
        )}

        {activeTour && showTourRoute && activeTour.detailedDays && activeTour.detailedDays[0] && (
          <View style={[styles.routePanel, { bottom: 90 + insets.bottom }]}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.routeList}
            >
              {activeTour.detailedDays[0].places.map((tourPlace, index) => {
                const place = attractions.find(p => p.id === tourPlace.placeId);
                if (!place) return null;
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.routeCard}
                    onPress={() => {
                      router.push({ pathname: '/place/[id]', params: { id: place.id } });
                    }}
                  >
                    <View style={styles.routeNumber}>
                      <Text style={styles.routeNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.routeCardTitle} numberOfLines={2}>{place.name}</Text>
                    <Text style={styles.routeCardTime}>{tourPlace.plannedTime}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {selectedPlace && (
          <View style={[styles.selectedPlaceCard, { bottom: 90 + insets.bottom }]}>
            <TouchableOpacity 
              style={styles.closeCardButton}
              onPress={() => setSelectedPlace(null)}
            >
              <X size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.directionsIconButton}
              activeOpacity={0.8}
              onPress={handleOpenGoogleMaps}
            >
              <MapPin size={20} color={Colors.snowWhite} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cardContent}
              onPress={() => router.push({ pathname: '/place/[id]', params: { id: selectedPlace.id } })}
            >
              <Image 
                source={{ uri: selectedPlace.images?.[0] || selectedPlace.image || '' }} 
                style={styles.selectedPlaceImage}
                contentFit="cover"
              />
              <View style={styles.selectedPlaceInfo}>
                <Text style={styles.selectedPlaceName} numberOfLines={2}>{selectedPlace.name}</Text>
                <View style={styles.selectedPlaceRating}>
                  <Star size={14} color={Colors.warning} fill={Colors.warning} />
                  <Text style={styles.selectedPlaceRatingText}>{selectedPlace.rating}</Text>
                  <Text style={styles.selectedPlaceCategory}>• {selectedPlace.category}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconButtonActive: {
    backgroundColor: Colors.sakuraPink,
  },
  locationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.sakuraPink,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.sakuraPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  tourMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.snowWhite,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  tourMarkerText: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: Colors.textPrimary,
  },
  activeTourBanner: {
    position: 'absolute',
    top: 90,
    left: 20,
    right: 20,
    backgroundColor: Colors.sakuraPink,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  activeTourContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activeTourInfo: {
    flex: 1,
  },
  activeTourTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.snowWhite,
    marginBottom: 2,
  },
  activeTourSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routePanel: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  routeList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  routeCard: {
    width: 140,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  routeNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.fujiBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeNumberText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: Colors.snowWhite,
  },
  routeCardTitle: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
    height: 36,
  },
  routeCardTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  selectedPlaceCard: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  closeCardButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  directionsIconButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.sakuraPink,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.sakuraPink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  cardContent: {
    flexDirection: 'row',
  },
  selectedPlaceImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
  },
  selectedPlaceInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  selectedPlaceName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  selectedPlaceRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectedPlaceRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  selectedPlaceCategory: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  // Web fallback styles
  placeCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  placeCategory: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
