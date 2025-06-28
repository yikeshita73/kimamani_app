import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '@/store';

export default function FavoritesScreen() {
  const { favorites } = useAppSelector(state => state.spots);

  // モックデータ（開発中）
  const mockFavorites = [
    {
      id: '1',
      name: '東京タワー',
      address: '東京都港区芝公園4-2-8',
      rating: 4.5,
      category: 'ランドマーク',
      distance: 1200,
      image: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=東京タワー',
    },
    {
      id: '2', 
      name: '浅草寺',
      address: '東京都台東区浅草2-3-1',
      rating: 4.7,
      category: '寺社',
      distance: 2300,
      image: 'https://via.placeholder.com/300x200/F44336/FFFFFF?text=浅草寺',
    },
  ];

  const FavoriteCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.cardAddress}>{item.address}</Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          
          <View style={styles.distanceContainer}>
            <Ionicons name="location" size={14} color="#666" />
            <Text style={styles.distanceText}>{item.distance}m</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color="#CCC" />
      <Text style={styles.emptyTitle}>お気に入りはまだありません</Text>
      <Text style={styles.emptySubtitle}>
        気になるスポットを見つけたら{'\n'}ハートマークをタップしてお気に入りに追加しよう
      </Text>
      <TouchableOpacity style={styles.exploreButton}>
        <Text style={styles.exploreButtonText}>スポットを探す</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>お気に入り</Text>
        <Text style={styles.subtitle}>
          {mockFavorites.length > 0 ? `${mockFavorites.length}件のスポット` : '保存したスポットを確認'}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {mockFavorites.length > 0 ? (
          <View style={styles.favoritesGrid}>
            {mockFavorites.map((item) => (
              <FavoriteCard key={item.id} item={item} />
            ))}
          </View>
        ) : (
          <EmptyState />
        )}

        {/* プレースホルダー */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            ❤️ お気に入り機能は開発中です
          </Text>
          <Text style={styles.placeholderSubtext}>
            スポットのお気に入り登録・削除機能を実装予定
          </Text>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  favoritesGrid: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  favoriteButton: {
    padding: 4,
  },
  cardAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
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
