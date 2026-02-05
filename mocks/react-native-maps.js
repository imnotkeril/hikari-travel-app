// Mock module for react-native-maps on web platform
// This prevents bundling errors when using react-native-maps on web

const React = require('react');
const { View, StyleSheet } = require('react-native');

// Define styles first
const styles = StyleSheet.create({
  mapView: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Simple mock MapView component
const MapViewComponent = React.forwardRef((props, ref) => {
  React.useImperativeHandle(ref, () => ({
    fitToCoordinates: () => {},
    animateToRegion: () => {},
  }));

  return React.createElement(View, {
    style: [styles.mapView, props.style],
  }, props.children);
});

const MapView = MapViewComponent;

// Mock Marker component
const Marker = () => {
  return null;
};

// Mock Polyline component
const Polyline = () => {
  return null;
};

// Mock PROVIDER constants
const PROVIDER_DEFAULT = 'default';
const PROVIDER_GOOGLE = 'google';

// Exports
module.exports = MapView;
module.exports.default = MapView;
module.exports.MapView = MapView;
module.exports.Marker = Marker;
module.exports.Polyline = Polyline;
module.exports.PROVIDER_DEFAULT = PROVIDER_DEFAULT;
module.exports.PROVIDER_GOOGLE = PROVIDER_GOOGLE;
