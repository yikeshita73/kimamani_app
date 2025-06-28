import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '@/store';
import { 
  requestLocationPermission, 
  getCurrentLocation 
} from '@/store/slices/locationSlice';

export default function MapScreen() {
  const dispatch = useAppDispatch();
  const { 
    currentLocation, 
    hasLocationPermission, 
    isLoading, 
    error 
  } = useAppSelector(state => state.location);

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    try {
      // 位置情報の許可を要求
      const permissionResult = await dispatch(requestLocationPermission()).unwrap();
      
      if (permissionResult.hasPermission) {
        // 現在位置を取得
        await dispatch(getCurrentLocation()).unwrap();
      }
    } catch (error) {
      Alert.alert('エラー', '位置情報の取得に失敗しました');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>地図</Text>
        <Text style={styles.subtitle}>近くの観光スポットを地図で探そう</Text>
        
        {isLoading && (
          <Text style={styles.status}>位置情報を取得中...</Text>
        )}
        
        {error && (
          <Text style={styles.error}>{error}</Text>
        )}
        
        {currentLocation && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              現在位置: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
            </Text>
          </View>
        )}
        
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            🗺️ 地図機能は開発中です
          </Text>
          <Text style={styles.placeholderSubtext}>
            React Native Mapsを使用した地図表示とスポットマーカーを実装予定
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  status: {
    fontSize: 16,
    color: '#FF9800',
    textAlign: 'center',
    marginVertical: 20,
  },
  error: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginVertical: 20,
  },
  locationInfo: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 14,
    color: '#2E7D32',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    marginTop: 20,
  },
  placeholderText: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 
