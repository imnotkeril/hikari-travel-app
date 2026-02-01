import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

interface UserData {
  id: string;
  name: string;
  email: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

const DEFAULT_LOCATION = {
  lat: 35.6762,
  lng: 139.6503,
  address: 'Tokyo, Japan',
};

export const [UserProvider, useUser] = createContextHook(() => {
  const [user, setUser] = useState<UserData>({
    id: 'user-1',
    name: 'Travel Explorer',
    email: 'traveler@tokyo.jp',
    location: DEFAULT_LOCATION,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('user-data');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updates: Partial<UserData>) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    try {
      await AsyncStorage.setItem('user-data', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const updateLocation = async (location: { lat: number; lng: number; address: string }) => {
    await updateUser({ location });
  };

  return {
    user,
    isLoading,
    updateUser,
    updateLocation,
  };
});
