
import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { MobilePreview } from './components/MobilePreview';

/**
 * App.tsx is the root entry point for Expo.
 * For testing on mobile, we boot directly into the MobilePreview.
 */
export default function App() {
  return (
    <View style={styles.container}>
      {/* Set status bar style for mobile */}
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <MobilePreview />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
