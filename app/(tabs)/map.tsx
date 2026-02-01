import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Navigation, Route, X, MapPinned, Coffee } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { attractions, restaurants, cafes } from '@/mocks/places';
import { useTourCreation } from '@/contexts/TourCreationContext';

export default function MapScreen() {
  const [showAttractions, setShowAttractions] = useState(true);
  const [showRestaurants, setShowRestaurants] = useState(true);
  const [showTourRoute, setShowTourRoute] = useState(false);
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const { getActiveTour } = useTourCreation();
  
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
              pinColor={Colors.fujiBlue}
              onCalloutPress={() =>
                router.push({ pathname: '/place/[id]', params: { id: place.id } })
              }
            />
          ))}
        {showRestaurants &&
          [...restaurants, ...cafes]
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
              pinColor={Colors.sakuraPink}
              onCalloutPress={() =>
                router.push({ pathname: '/place/[id]', params: { id: place.id } })
              }
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

            <TouchableOpacity style={styles.locationButton} activeOpacity={0.8}>
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
          <View style={styles.routePanel}>
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
    bottom: 90,
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
});
