import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import { StatusBar } from 'expo-status-bar';

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
