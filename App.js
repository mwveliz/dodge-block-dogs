import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import { StatusBar } from 'expo-status-bar';

import AsyncStorage from '@react-native-async-storage/async-storage';

import * as Haptics from 'expo-haptics';

export default function App() {
  const [htmlUri, setHtmlUri] = useState(null);

  useEffect(() => {
    async function loadHtml() {
      // Loads the game.html file from the local assets folder
      const [{ localUri }] = await Asset.loadAsync(require('./assets/game.html'));
      setHtmlUri(localUri);
    }
    loadHtml();
  }, []);

  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SAVE_STATE' && data.state) {
        await AsyncStorage.setItem('DBD_PERSISTENT_BACKUP', JSON.stringify(data.state));
      } else if (data.type === 'HAPTIC') {
        if (data.style === 'heavy') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } else if (data.style === 'medium') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else if (data.style === 'light') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (data.style === 'success') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch {
      // Non-JSON message ignore
    }
  };

  if (!htmlUri) {
    // Show empty view with background color while loading
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <WebView
        source={{ uri: htmlUri }}
        style={styles.webview}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        originWhitelist={['*']}
        mixedContentMode="always"
        mediaPlaybackRequiresUserAction={false}
        onMessage={handleMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a', // Matches the HTML background color
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
