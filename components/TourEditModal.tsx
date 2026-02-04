import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView, TextInput, Alert } from 'react-native';
import { X, GripVertical, Trash2, Save } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { TourDay } from '@/mocks/tours';
import { allPlaces } from '@/mocks/places';

interface TourEditModalProps {
  visible: boolean;
  onClose: () => void;
  tourId: string;
  tourTitle: string;
  detailedDays: TourDay[];
  onSave: (title: string, days: TourDay[]) => void;
  onRemovePlace: (dayIndex: number, placeIndex: number) => void;
}

export default function TourEditModal({
  visible,
  onClose,
  tourId,
  tourTitle,
  detailedDays,
  onSave,
  onRemovePlace,
}: TourEditModalProps) {
  const [title, setTitle] = useState(tourTitle);
  const [editedDays, setEditedDays] = useState<TourDay[]>(detailedDays);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Tour title cannot be empty');
      return;
    }
    onSave(title, editedDays);
    onClose();
  };

  const handleRemovePlace = (dayIndex: number, placeIndex: number) => {
    Alert.alert(
      'Remove Place',
      'Are you sure you want to remove this place from the tour?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newDays = [...editedDays];
            const day = { ...newDays[dayIndex] };
            day.places = day.places.filter((_, i) => i !== placeIndex);
            
            day.totalCost = day.places.reduce((sum, tp) => {
              const place = allPlaces.find(p => p.id === tp.placeId);
              return sum + (place?.admissionFee || 0) + tp.transportCost;
            }, 0);
            day.totalDuration = day.places.reduce((sum, tp) => sum + tp.visitDuration + tp.transportDuration, 0);
            
            newDays[dayIndex] = day;
            setEditedDays(newDays);
            onRemovePlace(dayIndex, placeIndex);
          },
        },
      ]
    );
  };



  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Tour</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.label}>Tour Name</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter tour name"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Days & Places</Text>
            {editedDays.map((day, dayIndex) => (
              <View key={dayIndex} style={styles.daySection}>
                <Text style={styles.dayTitle}>Day {day.dayNumber}</Text>
                {day.places.map((tourPlace, placeIndex) => {
                  const place = allPlaces.find(p => p.id === tourPlace.placeId);
                  if (!place) return null;

                  return (
                    <View key={placeIndex} style={styles.placeItem}>
                      <View style={styles.dragHandle}>
                        <GripVertical size={20} color={Colors.textSecondary} />
                      </View>
                      
                      <View style={styles.placeContent}>
                        <Text style={styles.placeNumber}>{placeIndex + 1}</Text>
                        <View style={styles.placeInfo}>
                          <Text style={styles.placeName}>{place.name}</Text>
                          <Text style={styles.placeTime}>{tourPlace.plannedTime}</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemovePlace(dayIndex, placeIndex)}
                      >
                        <Trash2 size={18} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Save size={20} color={Colors.snowWhite} />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  daySection: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  dragHandle: {
    padding: 4,
    marginRight: 8,
  },
  placeContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  placeNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.fujiBlue,
    color: Colors.snowWhite,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  placeTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  saveButton: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    backgroundColor: Colors.sakuraPink,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.snowWhite,
  },
});
