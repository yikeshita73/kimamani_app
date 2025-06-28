import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '@/store';
import { clearAuth } from '@/store/slices/authSlice';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector(state => state.auth);

  // モックユーザーデータ（開発中）
  const mockUser = {
    name: 'きまま ユーザー',
    email: 'kimama@example.com',
    avatar: 'https://via.placeholder.com/100x100/4CAF50/FFFFFF?text=KU',
    joinDate: '2025年6月',
    visitedSpots: 23,
    favorites: 8,
    reviews: 12,
  };

  const handleLogout = () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: 'ログアウト', 
          style: 'destructive',
          onPress: () => dispatch(clearAuth())
        }
      ]
    );
  };

  const menuItems = [
    {
      id: 'notifications',
      title: '通知設定',
      icon: 'notifications',
      color: '#FF9800',
      onPress: () => console.log('通知設定')
    },
    {
      id: 'privacy',
      title: 'プライバシー',
      icon: 'shield',
      color: '#2196F3',
      onPress: () => console.log('プライバシー')
    },
    {
      id: 'help',
      title: 'ヘルプ・サポート',
      icon: 'help-circle',
      color: '#9C27B0',
      onPress: () => console.log('ヘルプ')
    },
    {
      id: 'about',
      title: 'アプリについて',
      icon: 'information-circle',
      color: '#607D8B',
      onPress: () => console.log('アプリについて')
    },
    {
      id: 'logout',
      title: 'ログアウト',
      icon: 'log-out',
      color: '#F44336',
      onPress: handleLogout
    },
  ];

  const StatCard = ({ title, value, icon }: { title: string; value: number; icon: string }) => (
    <View style={styles.statCard}>
      <Ionicons name={icon as any} size={24} color="#4CAF50" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const MenuItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
      <View style={styles.menuIconContainer}>
        <Ionicons name={item.icon} size={20} color={item.color} />
      </View>
      <Text style={styles.menuTitle}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={16} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* ユーザー情報 */}
        <View style={styles.userSection}>
          <Image source={{ uri: mockUser.avatar }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{mockUser.name}</Text>
            <Text style={styles.userEmail}>{mockUser.email}</Text>
            <Text style={styles.joinDate}>登録日: {mockUser.joinDate}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil" size={16} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* 統計情報 */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>あなたの記録</Text>
          <View style={styles.statsGrid}>
            <StatCard title="訪問スポット" value={mockUser.visitedSpots} icon="location" />
            <StatCard title="お気に入り" value={mockUser.favorites} icon="heart" />
            <StatCard title="レビュー" value={mockUser.reviews} icon="star" />
          </View>
        </View>

        {/* 最近の活動 */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>最近の活動</Text>
          <View style={styles.activityCard}>
            <Text style={styles.activityText}>
              📍 東京タワーを訪問しました (2日前)
            </Text>
          </View>
          <View style={styles.activityCard}>
            <Text style={styles.activityText}>
              ⭐ 浅草寺にレビューを投稿しました (5日前)
            </Text>
          </View>
        </View>

        {/* メニュー */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>設定・その他</Text>
          {menuItems.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </View>

        {/* プレースホルダー */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            👤 プロフィール機能は開発中です
          </Text>
          <Text style={styles.placeholderSubtext}>
            ユーザー管理、設定、統計表示機能を実装予定
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
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    color: '#999',
  },
  editButton: {
    padding: 12,
    backgroundColor: '#F0F8F0',
    borderRadius: 8,
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  activitySection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 20,
  },
  activityCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  activityText: {
    fontSize: 16,
    color: '#333',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuIconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 16,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    margin: 20,
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
