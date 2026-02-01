import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

export interface FilterOptions {
  rating?: string[];
  category?: string[];
  ward?: string[];
  priceRange?: string[];
  cuisineType?: string[];
  priceLevel?: string[];
  features?: string[];
  eventType?: string[];
  date?: string[];
  distance?: string[];
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'attractions' | 'cafe' | 'events';
  filters: FilterOptions;
  onApply: (filters: FilterOptions) => void;
}

const RATING_OPTIONS = ['5.0', '4.5-4.9', '4.0-4.4', '3.0-3.9'];
const ATTRACTION_CATEGORIES = ['Temple', 'Shrine', 'Museum', 'Park', 'Observation Deck', 'Shopping District', 'Historic Site'];
const WARDS = ['Shibuya', 'Shinjuku', 'Asakusa', 'Ginza', 'Harajuku', 'Akihabara', 'Roppongi', 'Ueno', 'Odaiba'];
const PRICE_RANGES = ['Free', '¥1-500', '¥500-1000', '¥1000-2000', '¥2000+'];
const CUISINE_TYPES = ['Japanese', 'Sushi', 'Ramen', 'Italian', 'Chinese', 'Korean', 'Western'];
const PRICE_LEVELS = ['¥ Budget', '¥¥ Mid-range', '¥¥¥ High-end', '¥¥¥¥ Luxury'];
const FEATURES = ['English menu', 'Vegetarian options', 'Open now'];
const EVENT_TYPES = ['Festival', 'Exhibition', 'Concert', 'Fireworks', 'Sports Event', 'Market'];
const DATE_OPTIONS = ['Today', 'This weekend', 'This week', 'This month'];
const DISTANCE_OPTIONS = ['< 500m', '< 1km', '< 2km', '< 5km', '< 10km'];

export default function FilterModal({ visible, onClose, type, filters, onApply }: FilterModalProps) {
  const [selectedFilters, setSelectedFilters] = useState<FilterOptions>(filters);

  const toggleFilter = (category: keyof FilterOptions, value: string) => {
    const current = selectedFilters[category] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    
    setSelectedFilters({ ...selectedFilters, [category]: updated });
  };

  const isSelected = (category: keyof FilterOptions, value: string) => {
    return (selectedFilters[category] || []).includes(value);
  };

  const handleApply = () => {
    onApply(selectedFilters);
    onClose();
  };

  const handleReset = () => {
    setSelectedFilters({});
  };

  const renderFilterSection = (title: string, category: keyof FilterOptions, options: string[]) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>{title}</Text>
      <View style={styles.optionsGrid}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              isSelected(category, option) && styles.optionButtonSelected
            ]}
            onPress={() => toggleFilter(category, option)}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.optionText,
              isSelected(category, option) && styles.optionTextSelected
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={['#F0F4FF', '#FFE5F0', '#E8F5F7']}
          style={StyleSheet.absoluteFill}
        />
        
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {type === 'attractions' && (
              <>
                {renderFilterSection('Distance', 'distance', DISTANCE_OPTIONS)}
                {renderFilterSection('Rating', 'rating', RATING_OPTIONS)}
                {renderFilterSection('Type', 'category', ATTRACTION_CATEGORIES)}
                {renderFilterSection('Ward', 'ward', WARDS)}
                {renderFilterSection('Price Range', 'priceRange', PRICE_RANGES)}
              </>
            )}

            {type === 'cafe' && (
              <>
                {renderFilterSection('Distance', 'distance', DISTANCE_OPTIONS)}
                {renderFilterSection('Rating', 'rating', RATING_OPTIONS)}
                {renderFilterSection('Cuisine', 'cuisineType', CUISINE_TYPES)}
                {renderFilterSection('Price Level', 'priceLevel', PRICE_LEVELS)}
                {renderFilterSection('Ward', 'ward', WARDS)}
                {renderFilterSection('Features', 'features', FEATURES)}
              </>
            )}

            {type === 'events' && (
              <>
                {renderFilterSection('Distance', 'distance', DISTANCE_OPTIONS)}
                {renderFilterSection('Event Type', 'eventType', EVENT_TYPES)}
                {renderFilterSection('Date', 'date', DATE_OPTIONS)}
                {renderFilterSection('Ward', 'ward', WARDS)}
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={handleReset}
              activeOpacity={0.8}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton} 
              onPress={handleApply}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Colors.sakuraPink, Colors.skyBlue]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  closeButton: {
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  optionButtonSelected: {
    backgroundColor: '#FFE5EC',
    borderColor: Colors.sakuraPink,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  optionTextSelected: {
    color: Colors.sakuraPink,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  resetButton: {
    flex: 1,
    height: 52,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  applyButton: {
    flex: 2,
    height: 52,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.snowWhite,
  },
});
