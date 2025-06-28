import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/store';
import { 
  requestLocationPermission, 
  getCurrentLocation 
} from '@/store/slices/locationSlice';
import { fetchNearbySpots } from '@/store/slices/spotsSlice';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useAppDispatch();
  
  const { currentLocation, isLoading: locationLoading } = useAppSelector(state => state.location);
  const { nearbySpots, isLoading: spotsLoading } = useAppSelector(state => state.spots);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // 位置情報の許可を要求
      await dispatch(requestLocationPermission()).unwrap();
      // 現在位置を取得
      const location = await dispatch(getCurrentLocation()).unwrap();
      // 近くのスポットを取得
      await dispatch(fetchNearbySpots({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 5000
      })).unwrap();
    } catch (error) {
      console.log('初期化エラー:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeApp();
    setRefreshing(false);
  };

  const handleKimamaButton = () => {
    if (!currentLocation) {
      Alert.alert('位置情報エラー', '位置情報が取得できていません。設定を確認してください。');
      return;
    }
    Alert.alert('きままに。', 'ランダムなスポットを提案する機能は開発中です！', [
      { text: 'OK' }
    ]);
  };

  const categories = [
    { id: 'restaurant', name: 'グルメ', icon: 'restaurant', color: '#FF9800' },
    { id: 'tourist', name: '観光', icon: 'camera', color: '#2196F3' },
    { id: 'park', name: '公園', icon: 'leaf', color: '#4CAF50' },
    { id: 'shopping', name: '買い物', icon: 'bag', color: '#9C27B0' },
    { id: 'culture', name: '文化', icon: 'library', color: '#795548' },
    { id: 'entertainment', name: '娯楽', icon: 'game-controller', color: '#E91E63' },
  ];

  const SpotCard = ({ spot }: { spot: any }) => (
    <TouchableOpacity style={styles.spotCard}>
      <Image 
        source={{ uri: spot.images?.[0] || 'https://via.placeholder.com/120x80/4CAF50/FFFFFF?text=スポット' }} 
        style={styles.spotImage} 
      />
      <View style={styles.spotInfo}>
        <Text style={styles.spotName}>{spot.name}</Text>
        <Text style={styles.spotDescription} numberOfLines={2}>
          {spot.description}
        </Text>
        <View style={styles.spotMeta}>
          <View style={styles.rating}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{spot.rating}</Text>
          </View>
          <Text style={styles.distance}>{spot.distance}m</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ヘッダー */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>こんにちは！</Text>
            <Text style={styles.subtitle}>
              {currentLocation 
                ? '近くのスポットを探してみましょう' 
                : '位置情報を取得中...'}
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* メインアクションボタン */}
        <LinearGradient
          colors={['#4CAF50', '#66BB6A']}
          style={styles.kimamaCard}
        >
          <TouchableOpacity 
            style={styles.kimamaButton}
            onPress={handleKimamaButton}
            disabled={locationLoading}
          >
            <View style={styles.kimamaContent}>
              <Text style={styles.kimamaTitle}>きままに。</Text>
              <Text style={styles.kimamaSubtitle}>
                {locationLoading 
                  ? '位置情報を取得中...' 
                  : 'ランダムに近くのスポットを提案'}
              </Text>
            </View>
            <View style={styles.kimamaIcon}>
              <Ionicons name="shuffle" size={32} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </LinearGradient>

        {/* 天気情報 */}
        <View style={styles.weatherCard}>
          <View style={styles.weatherInfo}>
            <Ionicons name="sunny" size={24} color="#FF9800" />
            <Text style={styles.weatherText}>晴れ 25°C</Text>
          </View>
          <Text style={styles.weatherAdvice}>散歩日和です！</Text>
        </View>

        {/* カテゴリ選択 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>カテゴリから探す</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity 
                key={category.id} 
                style={[styles.categoryItem, { backgroundColor: category.color }]}
                onPress={() => console.log('Category:', category.name)}
              >
                <Ionicons name={category.icon as any} size={20} color="#FFFFFF" />
                <Text style={styles.categoryText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 近くのスポット */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>近くのスポット</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>すべて見る</Text>
            </TouchableOpacity>
          </View>
          
          {spotsLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>スポットを読み込み中...</Text>
            </View>
          ) : nearbySpots.length > 0 ? (
            <View style={styles.spotsContainer}>
              {nearbySpots.slice(0, 3).map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </View>
          ) : (
            <View style={styles.emptySpots}>
              <Text style={styles.emptyText}>近くにスポットが見つかりませんでした</Text>
            </View>
          )}
        </View>

        {/* クイックアクション */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="map" size={24} color="#4CAF50" />
            <Text style={styles.quickActionText}>地図で見る</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="heart" size={24} color="#F44336" />
            <Text style={styles.quickActionText}>お気に入り</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="time" size={24} color="#FF9800" />
            <Text style={styles.quickActionText}>履歴</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  notificationButton: {
    padding: 8,
  },
  kimamaCard: {
    margin: 20,
    borderRadius: 16,
    padding: 4,
  },
  kimamaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 20,
  },
  kimamaContent: {
    flex: 1,
  },
  kimamaTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  kimamaSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  kimamaIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50,
    padding: 16,
  },
  weatherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  weatherAdvice: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  categoriesContainer: {
    paddingLeft: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  spotsContainer: {
    paddingHorizontal: 20,
  },
  spotCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  spotImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  spotInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  spotName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  spotDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  spotMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
  },
  distance: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptySpots: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 20,
    borderRadius: 12,
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
});
