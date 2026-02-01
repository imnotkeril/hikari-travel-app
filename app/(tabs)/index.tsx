import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, Animated, Image, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, MapPin, Bell, User, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { topPlaces } from '@/mocks/places';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH;

export default function HomeScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % topPlaces.length;
      setActiveIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * CARD_WIDTH,
        animated: true,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  console.log('HomeScreen rendering, topPlaces:', topPlaces.length);



  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          {
            useNativeDriver: false,
            listener: (event: any) => {
              const offsetX = event.nativeEvent.contentOffset.x;
              const index = Math.round(offsetX / CARD_WIDTH);
              setActiveIndex(index);
            },
          }
        )}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {topPlaces.map((place) => (
          <TouchableOpacity 
            key={place.id} 
            style={styles.card}
            activeOpacity={0.95}
            onPress={() => router.push({ pathname: '/place/[id]', params: { id: place.id } })}
          >
            <Image source={{ uri: place.images[0] }} style={styles.image} />
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
              style={styles.gradient}
            />
            
            <Animated.View style={[styles.topBar, { opacity: fadeAnim }]}>
              <TouchableOpacity 
                style={styles.iconButton}
                activeOpacity={0.7}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/notifications');
                }}
              >
                <View style={styles.iconButtonInner}>
                  <Bell size={22} color={Colors.snowWhite} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton}
                activeOpacity={0.7}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/profile');
                }}
              >
                <View style={styles.iconButtonInner}>
                  <User size={22} color={Colors.snowWhite} />
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={[styles.infoCard, {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }]}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{place.name}</Text>
              </View>
              <View style={styles.ratingRow}>
                <View style={styles.ratingBadge}>
                  <Star size={14} color={Colors.warning} fill={Colors.warning} />
                  <Text style={styles.ratingText}>{place.rating}</Text>
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.category}>{place.category}</Text>
                </View>
                <View style={styles.locationBadge}>
                  <MapPin size={12} color={Colors.snowWhite} />
                  <Text style={styles.location}>{place.ward}</Text>
                </View>
              </View>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        {topPlaces.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeIndex === index && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    width: CARD_WIDTH,
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  topBar: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoCard: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  nameRow: {
    marginBottom: 12,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: Colors.snowWhite,
    flex: 1,
    marginRight: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.snowWhite,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 80, 122, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  category: {
    fontSize: 13,
    color: Colors.snowWhite,
    fontWeight: '600',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(43, 109, 159, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  location: {
    fontSize: 13,
    color: Colors.snowWhite,
    fontWeight: '600',
  },
  pagination: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeDot: {
    width: 28,
    backgroundColor: Colors.snowWhite,
    shadowColor: Colors.snowWhite,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
});
