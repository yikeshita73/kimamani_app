import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/store';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useAppDispatch();
  const { searchResults, isLoading } = useAppSelector(state => state.spots);

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log('Search for:', searchQuery);
  };

  const popularCategories = [
    { id: 'restaurant', name: 'レストラン', icon: 'restaurant', color: '#FF9800' },
    { id: 'tourist', name: '観光地', icon: 'camera', color: '#2196F3' },
    { id: 'park', name: '公園', icon: 'leaf', color: '#4CAF50' },
    { id: 'shopping', name: 'ショッピング', icon: 'bag', color: '#9C27B0' },
    { id: 'museum', name: '博物館', icon: 'library', color: '#795548' },
    { id: 'temple', name: '寺社', icon: 'home', color: '#F44336' },
  ];

  const recentSearches = [
    '東京タワー',
    '浅草寺',
    '上野動物園',
    '新宿御苑',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>検索</Text>
        <Text style={styles.subtitle}>観光スポットを探してみよう</Text>
        
        {/* 検索バー */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="スポット名、場所、カテゴリで検索"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {/* カテゴリ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>人気カテゴリ</Text>
          <View style={styles.categoriesGrid}>
            {popularCategories.map((category) => (
              <TouchableOpacity 
                key={category.id} 
                style={[styles.categoryItem, { backgroundColor: category.color }]}
                onPress={() => console.log('Category selected:', category.name)}
              >
                <Ionicons name={category.icon as any} size={24} color="#FFFFFF" />
                <Text style={styles.categoryText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 最近の検索 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>最近の検索</Text>
          {recentSearches.map((search, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.recentItem}
              onPress={() => setSearchQuery(search)}
            >
              <Ionicons name="time" size={16} color="#666" />
              <Text style={styles.recentText}>{search}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* プレースホルダー */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            🔍 検索機能は開発中です
          </Text>
          <Text style={styles.placeholderSubtext}>
            スポット名、カテゴリ、位置での検索機能を実装予定
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    marginLeft: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '48%',
    aspectRatio: 2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  recentText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
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
