import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpc } from '@/lib/trpc';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface TourDay {
  dayNumber: number;
  date: string;
  places: any[];
  totalCost: number;
  totalDuration: number;
  notes?: string;
}

interface UserTour {
  id: string;
  title: string;
  places: string[];
  createdAt: number;
  detailedDays?: TourDay[];
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export const [TourCreationProvider, useTourCreation] = createContextHook(() => {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [tourName, setTourName] = useState('');
  const [userTours, setUserTours] = useState<UserTour[]>([]);
  const { user } = useUser();
  const router = useRouter();
  const utils = trpc.useUtils();

  const generateTourMutation = trpc.tours.generateTour.useMutation({
    onSuccess: async (data) => {
      console.log('Tour generated successfully:', data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await utils.tours.getUserTours.invalidate();
      disableSelectionMode();
      router.push({ pathname: '/tour/[id]', params: { id: data.id } });
    },
    onError: (error) => {
      console.error('Failed to generate tour:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const enableSelectionMode = (name: string) => {
    setTourName(name);
    setSelectionMode(true);
    setSelectedPlaces([]);
  };

  const disableSelectionMode = () => {
    setSelectionMode(false);
    setSelectedPlaces([]);
    setTourName('');
  };

  const togglePlaceSelection = (placeId: string) => {
    setSelectedPlaces(prev => {
      if (prev.includes(placeId)) {
        return prev.filter(id => id !== placeId);
      } else {
        return [...prev, placeId];
      }
    });
  };

  useEffect(() => {
    loadTours();
  }, []);

  const loadTours = async () => {
    try {
      const stored = await AsyncStorage.getItem('userTours');
      if (stored) {
        setUserTours(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load tours:', error);
    }
  };

  const saveTours = async (tours: UserTour[]) => {
    try {
      await AsyncStorage.setItem('userTours', JSON.stringify(tours));
      setUserTours(tours);
    } catch (error) {
      console.error('Failed to save tours:', error);
    }
  };

  const createTour = () => {
    if (selectedPlaces.length === 0 || !tourName) {
      console.log('Cannot create tour: no places or name');
      return;
    }

    if (!user.location) {
      console.error('User location not available');
      return;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);

    console.log('Creating tour with places:', selectedPlaces);

    generateTourMutation.mutate({
      userId: user.id,
      title: tourName,
      placeIds: selectedPlaces,
      userLocation: user.location,
      startDate: startDate.toISOString(),
    });
  };

  const deleteTour = (tourId: string) => {
    const updatedTours = userTours.filter(t => t.id !== tourId);
    saveTours(updatedTours);
  };

  const activateTour = (tourId: string) => {
    const updatedTours = userTours.map(t => ({
      ...t,
      isActive: t.id === tourId,
    }));
    saveTours(updatedTours);
  };

  const deactivateTour = () => {
    const updatedTours = userTours.map(t => ({
      ...t,
      isActive: false,
    }));
    saveTours(updatedTours);
  };

  const updateTourDays = (tourId: string, days: TourDay[]) => {
    const updatedTours = userTours.map(t => 
      t.id === tourId ? { ...t, detailedDays: days } : t
    );
    saveTours(updatedTours);
  };

  const updateTourPlaces = (tourId: string, placeIds: string[]) => {
    const updatedTours = userTours.map(t => 
      t.id === tourId ? { ...t, places: placeIds } : t
    );
    saveTours(updatedTours);
  };

  const reorderTourPlaces = (tourId: string, dayIndex: number, fromIndex: number, toIndex: number) => {
    const tour = userTours.find(t => t.id === tourId);
    if (!tour || !tour.detailedDays) return;

    const newDays = [...tour.detailedDays];
    const day = { ...newDays[dayIndex] };
    const newPlaces = [...day.places];
    const [removed] = newPlaces.splice(fromIndex, 1);
    newPlaces.splice(toIndex, 0, removed);
    day.places = newPlaces;
    newDays[dayIndex] = day;

    updateTourDays(tourId, newDays);
  };

  const getActiveTour = () => {
    return userTours.find(t => t.isActive);
  };

  return {
    selectionMode,
    selectedPlaces,
    tourName,
    userTours,
    enableSelectionMode,
    disableSelectionMode,
    togglePlaceSelection,
    createTour,
    deleteTour,
    activateTour,
    deactivateTour,
    updateTourDays,
    updateTourPlaces,
    reorderTourPlaces,
    getActiveTour,
  };
});
