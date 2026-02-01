import { Tabs, useRouter, usePathname } from "expo-router";
import { MapPinned, Map, Coffee, Calendar, RouteIcon } from "lucide-react-native";
import React from "react";
import { Platform, TouchableOpacity, View, StyleSheet, Text } from "react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const router = useRouter();
  const pathname = usePathname();
  const isOnHome = pathname === '/';

  const tabs = [
    { name: 'attractions', label: 'Attractions', icon: MapPinned, route: '/attractions' },
    { name: 'tours', label: 'Tours', icon: RouteIcon, route: '/tours' },
    { name: 'map', label: 'Map', icon: Map, route: '/map' },
    { name: 'cafe', label: 'Cafe', icon: Coffee, route: '/cafe' },
    { name: 'events', label: 'Events', icon: Calendar, route: '/events' },
  ];

  const handleTabPress = (tab: typeof tabs[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (pathname === tab.route) {
      router.push('/');
    } else {
      router.push(tab.route as any);
    }
  };

  return (
    <BlurView
      intensity={Platform.OS === 'ios' ? 80 : 40}
      tint="light"
      style={customStyles.tabBarContainer}
    >
      <View style={customStyles.tabBar}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.route;
          const Icon = tab.icon;
          
          return (
            <TouchableOpacity
              key={tab.name}
              style={customStyles.tabButton}
              onPress={() => handleTabPress(tab)}
              activeOpacity={0.7}
            >
              <View style={[customStyles.iconContainer, isActive && customStyles.iconContainerActive]}>
                <Icon
                  size={24}
                  color={isActive ? Colors.sakuraPink : Colors.deepIndigo}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </View>
              <Text style={[customStyles.tabLabel, isActive && customStyles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </BlurView>
  );
};

const customStyles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    borderTopWidth: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 85,
    paddingBottom: 25,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 4,
  },
  iconContainerActive: {
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.deepIndigo,
  },
  tabLabelActive: {
    color: Colors.sakuraPink,
    fontWeight: '700' as const,
  },
});

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="attractions"
        options={{
          title: "Attractions",
          tabBarIcon: ({ color }) => <MapPinned size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tours"
        options={{
          title: "Tours",
          tabBarIcon: ({ color }) => <RouteIcon size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => <Map size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cafe"
        options={{
          title: "Cafe",
          tabBarIcon: ({ color }) => <Coffee size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
