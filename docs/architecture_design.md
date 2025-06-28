# 「きままに。」アプリ アーキテクチャ設計書

## 概要

React Native を採用した「きままに。」アプリのシステムアーキテクチャ、プロジェクト構成、設計パターンを定義します。

## システム全体アーキテクチャ

```
┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   React Native  │
│   iOS App       │    │   Android App   │
└─────────────────┘    └─────────────────┘
         │                        │
         └──────────┬───────────────┘
                    │
          ┌─────────▼─────────┐
          │    API Gateway     │
          │   (Load Balancer)  │
          └─────────┬─────────┘
                    │
          ┌─────────▼─────────┐
          │   Node.js API     │
          │   Express Server  │
          └─────────┬─────────┘
                    │
     ┌──────────────┼──────────────┐
     │              │              │
┌────▼────┐  ┌─────▼─────┐  ┌─────▼─────┐
│PostgreSQL│  │   Redis   │  │  Firebase │
│Database  │  │  Cache    │  │   Auth    │
└─────────┘  └───────────┘  └───────────┘

External APIs:
- Google Maps API
- 観光スポット情報API
- 天気予報API
```

## プロジェクト構成

### Frontend (React Native)

```
kimamani_app/
├── src/
│   ├── components/          # 再利用可能なUIコンポーネント
│   │   ├── common/         # 汎用コンポーネント
│   │   ├── forms/          # フォーム関連
│   │   └── maps/           # 地図関連コンポーネント
│   ├── screens/            # 画面コンポーネント
│   │   ├── Home/
│   │   ├── Search/
│   │   ├── SpotDetail/
│   │   ├── Profile/
│   │   └── Settings/
│   ├── navigation/         # ナビゲーション設定
│   ├── services/           # API通信、外部サービス
│   │   ├── api/
│   │   ├── location/
│   │   └── storage/
│   ├── store/              # 状態管理 (Redux Toolkit)
│   │   ├── slices/
│   │   └── api/
│   ├── utils/              # ユーティリティ関数
│   ├── types/              # TypeScript型定義
│   ├── constants/          # 定数定義
│   └── hooks/              # カスタムhooks
├── assets/                 # 画像、フォントなどの静的リソース
├── __tests__/              # テストファイル
└── docs/                   # プロジェクト関連ドキュメント
```

### Backend (Node.js API)

```
backend/
├── src/
│   ├── controllers/        # コントローラー層
│   │   ├── spots.js
│   │   ├── users.js
│   │   └── search.js
│   ├── services/           # ビジネスロジック層
│   │   ├── spotService.js
│   │   ├── userService.js
│   │   └── geoService.js
│   ├── models/             # データモデル
│   │   ├── Spot.js
│   │   ├── User.js
│   │   └── Review.js
│   ├── routes/             # ルーティング
│   │   ├── api/
│   │   └── auth/
│   ├── middleware/         # ミドルウェア
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── config/             # 設定ファイル
│   │   ├── database.js
│   │   └── redis.js
│   └── utils/              # ユーティリティ
├── tests/                  # テストファイル
└── docs/                   # API仕様書など
```

## アーキテクチャパターン

### Frontend: Clean Architecture + Redux Pattern

```
┌─────────────────────────────────────┐
│           Presentation Layer        │
│  (Screens, Components, Navigation)  │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│           Application Layer         │
│    (Redux Store, Custom Hooks)     │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│            Domain Layer             │
│      (Business Logic, Types)       │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│        Infrastructure Layer        │
│      (API, Storage, Services)      │
└─────────────────────────────────────┘
```

### Backend: MVC + Service Layer Pattern

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Routes    │───▶│ Controllers │───▶│  Services   │
│             │    │             │    │             │
└─────────────┘    └─────────────┘    └──────┬──────┘
                                              │
                   ┌─────────────┐    ┌──────▼──────┐
                   │ Middleware  │    │   Models    │
                   │             │    │             │
                   └─────────────┘    └─────────────┘
```

## 状態管理設計

### Redux Toolkit 構成

```typescript
// store/index.ts
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    spots: spotsSlice.reducer,
    location: locationSlice.reducer,
    search: searchSlice.reducer,
    user: userSlice.reducer,
    api: apiSlice.reducer,
  },
});

// slices 例
// store/slices/spotsSlice.ts
interface SpotsState {
  nearbySpots: Spot[];
  selectedSpot: Spot | null;
  loading: boolean;
  error: string | null;
  favorites: string[];
}
```

## API設計原則

### RESTful API エンドポイント設計

```
GET    /api/spots/nearby?lat={lat}&lng={lng}&radius={radius}
GET    /api/spots/{id}
POST   /api/spots/{id}/reviews
GET    /api/spots/categories
GET    /api/spots/search?q={query}&category={category}

GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/favorites
POST   /api/users/favorites/{spotId}
DELETE /api/users/favorites/{spotId}

POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
POST   /api/auth/refresh
```

### レスポンス形式統一

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

## セキュリティ設計

### 認証・認可
- **JWT Token**: アクセストークン（15分）+ リフレッシュトークン（7日）
- **Firebase Auth**: ソーシャルログイン対応
- **HTTPS**: 全通信の暗号化
- **API Rate Limiting**: DoS攻撃対策

### データ保護
- **位置情報**: 暗号化して保存、最小限の精度で管理
- **個人情報**: GDPR/個人情報保護法への準拠
- **API Key**: 環境変数で管理、フロントエンドでの直接露出回避

## パフォーマンス最適化

### Frontend
- **コンポーネント最適化**: React.memo、useMemo、useCallback
- **画像最適化**: 遅延読み込み、WebP形式、サイズ最適化
- **バンドル最適化**: Code Splitting、Tree Shaking
- **キャッシュ戦略**: Redux Persist、React Query

### Backend  
- **データベース最適化**: インデックス設定、クエリ最適化
- **キャッシュ戦略**: Redis活用、レスポンス時間短縮
- **CDN**: 静的コンテンツの配信最適化

## テスト戦略

### Frontend テスト
```
├── Unit Tests (Jest + React Native Testing Library)
│   ├── Components
│   ├── Custom Hooks
│   └── Utility Functions
├── Integration Tests
│   ├── API Integration
│   └── Navigation Flow
└── E2E Tests (Detox)
    ├── Core User Flows
    └── Critical Paths
```

### Backend テスト
```
├── Unit Tests (Jest)
│   ├── Services
│   ├── Controllers
│   └── Utilities
├── Integration Tests
│   ├── API Endpoints
│   └── Database Operations
└── Load Tests (Artillery)
    └── Performance Benchmarks
```

## 開発・デプロイメント

### CI/CD パイプライン
```
GitHub Actions:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Commit    │───▶│    Tests    │───▶│    Build    │
│             │    │             │    │             │
└─────────────┘    └─────────────┘    └──────┬──────┘
                                              │
┌─────────────┐    ┌─────────────┐    ┌──────▼──────┐
│   Deploy    │◀───│   Approve   │◀───│   Staging   │
│ Production  │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 環境管理
- **Development**: ローカル開発環境
- **Staging**: テスト・検証環境  
- **Production**: 本番環境

---

作成日: 2024年
バージョン: 1.0 
