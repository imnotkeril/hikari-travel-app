import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, MapPin, Calendar, Clock, DollarSign, Map, Navigation } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useQuery } from '@tanstack/react-query';
import { getEvents } from '@/lib/api';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const eventsQuery = useQuery({
    queryKey: ['events'],
    queryFn: () => getEvents(),
  });
  const event = eventsQuery.data?.find(e => e.id === id);

  const handleOpenMap = () => {
    router.push({ pathname: '/(tabs)/map', params: { selectedPlaceId: id } });
  };

  if (eventsQuery.isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Colors.textSecondary }}>Event not found</Text>
      </View>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: event.image }} style={styles.headerImage} />
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
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>{event.name}</Text>
            <View style={styles.tagContainer}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{event.type}</Text>
              </View>
              <View style={styles.tag}>
                <MapPin size={14} color={Colors.textSecondary} />
                <Text style={styles.tagText}>{event.ward}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Details</Text>
            
            <View style={styles.detailRow}>
              <Calendar size={20} color={Colors.sakuraPink} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>
                  {formatDate(event.startDate)} - {formatDate(event.endDate)}
                </Text>
              </View>
            </View>

            {event.startTime && (
              <View style={styles.detailRow}>
                <Clock size={20} color={Colors.sakuraPink} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Time</Text>
                  <Text style={styles.detailValue}>
                    {event.startTime} - {event.endTime || 'Late'}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.detailRow}>
              <DollarSign size={20} color={Colors.sakuraPink} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Admission</Text>
                <Text style={styles.detailValue}>
                  {event.admissionFee === 0 ? 'Free Entry' : `¥${event.admissionFee.toLocaleString()}`}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <MapPin size={20} color={Colors.sakuraPink} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{event.address}</Text>
              </View>
            </View>
          </View>

          {event.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About This Event</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.footerButton, styles.footerButtonPrimary]}
          onPress={handleOpenMap}
        >
          <Map size={20} color={Colors.snowWhite} />
          <Text style={styles.footerButtonText}>View on Map</Text>
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
    height: 300,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  bottomPadding: {
    height: 100,
  },
  footer: {
    padding: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: Colors.textSecondary,
    borderRadius: 12,
    gap: 8,
  },
  footerButtonPrimary: {
    backgroundColor: Colors.sakuraPink,
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.snowWhite,
  },
});
