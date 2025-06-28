# 「きままに。」アプリ データベース設計書

## 概要

PostgreSQL を採用した「きままに。」アプリのデータベース設計、テーブル構成、リレーション設計を定義します。

## データベース構成

### 主要テーブル一覧

1. **users** - ユーザー情報
2. **spots** - 観光スポット情報
3. **categories** - スポットカテゴリ
4. **reviews** - スポットレビュー
5. **favorites** - お気に入り
6. **user_sessions** - セッション管理
7. **spot_images** - スポット画像
8. **user_visit_history** - 訪問履歴

## テーブル設計

### 1. users テーブル
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    date_of_birth DATE,
    gender VARCHAR(20),
    preferences JSONB DEFAULT '{}',
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(11, 8),
    location_updated_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    firebase_uid VARCHAR(255) UNIQUE,
    provider VARCHAR(50) DEFAULT 'email',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_location ON users(location_latitude, location_longitude) 
    WHERE location_latitude IS NOT NULL AND location_longitude IS NOT NULL;
```

### 2. categories テーブル
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    description TEXT,
    icon_url TEXT,
    color_code VARCHAR(7),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- サンプルデータ
INSERT INTO categories (name, name_en, description, sort_order) VALUES
('神社・仏閣', 'Shrine & Temple', '神社や寺院などの宗教施設', 1),
('公園・自然', 'Park & Nature', '公園、庭園、自然スポット', 2),
('博物館・美術館', 'Museum & Gallery', '博物館、美術館、展示施設', 3),
('グルメ', 'Gourmet', 'レストラン、カフェ、名物料理', 4),
('ショッピング', 'Shopping', '商店街、市場、ショッピング施設', 5),
('歴史・文化', 'History & Culture', '歴史的建造物、文化施設', 6),
('エンターテイメント', 'Entertainment', 'テーマパーク、娯楽施設', 7),
('温泉・スパ', 'Hot Spring & Spa', '温泉、スパ、リラクゼーション', 8);
```

### 3. spots テーブル
```sql
CREATE TABLE spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    description TEXT,
    address VARCHAR(500) NOT NULL,
    prefecture VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    
    -- 営業情報
    opening_hours JSONB DEFAULT '{}', -- 営業時間（曜日別）
    regular_holiday VARCHAR(255),
    admission_fee INTEGER, -- 入場料（円）
    estimated_duration INTEGER, -- 滞在時間（分）
    
    -- 評価・統計
    rating_average DECIMAL(3, 2) DEFAULT 0.0,
    rating_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    
    -- メタ情報
    phone_number VARCHAR(20),
    website_url TEXT,
    official_site_url TEXT,
    access_info TEXT,
    parking_info TEXT,
    barrier_free_info TEXT,
    
    -- 外部API連携用
    google_place_id VARCHAR(255),
    foursquare_id VARCHAR(255),
    
    -- フラグ
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_seasonal BOOLEAN DEFAULT FALSE,
    season_start DATE,
    season_end DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_spots_location ON spots(latitude, longitude);
CREATE INDEX idx_spots_category ON spots(category_id);
CREATE INDEX idx_spots_prefecture_city ON spots(prefecture, city);
CREATE INDEX idx_spots_rating ON spots(rating_average DESC);
CREATE INDEX idx_spots_name_search ON spots USING gin(to_tsvector('japanese', name || ' ' || description));
```

### 4. spot_images テーブル
```sql
CREATE TABLE spot_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spot_id UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    alt_text TEXT,
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_spot_images_spot_id ON spot_images(spot_id);
CREATE UNIQUE INDEX idx_spot_images_primary ON spot_images(spot_id) 
    WHERE is_primary = TRUE;
```

### 5. reviews テーブル
```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spot_id UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    content TEXT,
    visit_date DATE,
    is_recommended BOOLEAN DEFAULT TRUE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(spot_id, user_id) -- 1ユーザー1スポット1レビュー
);

-- インデックス
CREATE INDEX idx_reviews_spot_id ON reviews(spot_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
```

### 6. favorites テーブル
```sql
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    spot_id UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, spot_id)
);

-- インデックス
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_spot_id ON favorites(spot_id);
```

### 7. user_visit_history テーブル
```sql
CREATE TABLE user_visit_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    spot_id UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    visit_duration INTEGER, -- 滞在時間（分）
    notes TEXT,
    
    INDEX(user_id, visited_at DESC)
);

-- インデックス
CREATE INDEX idx_visit_history_user_id ON user_visit_history(user_id);
CREATE INDEX idx_visit_history_spot_id ON user_visit_history(spot_id);
CREATE INDEX idx_visit_history_visited_at ON user_visit_history(visited_at DESC);
```

### 8. user_sessions テーブル
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(512) NOT NULL,
    device_info JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_refresh_token ON user_sessions(refresh_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
```

## ER図

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    users    │     │    spots    │     │ categories  │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │────┐│ id (PK)     │┌───│ id (PK)     │
│ email       │    ││ name        ││   │ name        │
│ display_name│    ││ description │└──▶│ description │
│ preferences │    ││ latitude    │    │ icon_url    │
│ ...         │    ││ longitude   │    └─────────────┘
└─────────────┘    ││ category_id │           │
       │           ││ rating_avg  │           │
       │           │└─────────────┘           │
       │           │       │                 │
       │           │       │                 │
       ▼           │       ▼                 │
┌─────────────┐    │ ┌─────────────┐         │
│ favorites   │    │ │spot_images  │         │
├─────────────┤    │ ├─────────────┤         │
│ id (PK)     │    │ │ id (PK)     │         │
│ user_id(FK) │◀───┘ │ spot_id(FK) │         │
│ spot_id(FK) │      │ image_url   │         │
└─────────────┘      │ is_primary  │         │
       │             └─────────────┘         │
       │                    │               │
       ▼                    │               │
┌─────────────┐             │               │
│   reviews   │             │               │
├─────────────┤             │               │
│ id (PK)     │             │               │
│ spot_id(FK) │─────────────┘               │
│ user_id(FK) │                             │
│ rating      │                             │
│ content     │                             │
└─────────────┘                             │
       │                                    │
       ▼                                    │
┌─────────────┐                             │
│visit_history│                             │
├─────────────┤                             │
│ id (PK)     │                             │
│ user_id(FK) │                             │
│ spot_id(FK) │                             │
│ visited_at  │                             │
└─────────────┘                             │
```

## 地理空間インデックス

### PostGIS 拡張の活用
```sql
-- PostGIS 拡張を有効化
CREATE EXTENSION IF NOT EXISTS postgis;

-- 地理空間カラムの追加
ALTER TABLE spots ADD COLUMN geom GEOMETRY(POINT, 4326);

-- 既存データから地理空間データを生成
UPDATE spots SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);

-- 地理空間インデックス
CREATE INDEX idx_spots_geom ON spots USING gist(geom);
```

### 近隣検索クエリ例
```sql
-- 指定位置から半径1km以内のスポット検索
SELECT s.*, ST_Distance(geom, ST_SetSRID(ST_MakePoint($longitude, $latitude), 4326)) as distance
FROM spots s
WHERE ST_DWithin(
    geom, 
    ST_SetSRID(ST_MakePoint($longitude, $latitude), 4326),
    1000 -- 1km in meters
)
ORDER BY distance
LIMIT 20;
```

## パフォーマンス最適化

### インデックス戦略
```sql
-- 複合インデックス（位置情報 + カテゴリ）
CREATE INDEX idx_spots_location_category ON spots(latitude, longitude, category_id);

-- 部分インデックス（アクティブなスポットのみ）
CREATE INDEX idx_spots_active ON spots(latitude, longitude) 
WHERE is_verified = TRUE;

-- 全文検索用インデックス
CREATE INDEX idx_spots_fulltext ON spots 
USING gin(to_tsvector('japanese', name || ' ' || description));
```

### パーティショニング
```sql
-- 訪問履歴テーブルの月別パーティション例
CREATE TABLE user_visit_history_y2024m01 
PARTITION OF user_visit_history
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

## データ整合性・制約

### トリガー関数
```sql
-- スポット評価平均の自動更新
CREATE OR REPLACE FUNCTION update_spot_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE spots SET 
        rating_average = (
            SELECT COALESCE(AVG(rating), 0) 
            FROM reviews 
            WHERE spot_id = COALESCE(NEW.spot_id, OLD.spot_id)
        ),
        rating_count = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE spot_id = COALESCE(NEW.spot_id, OLD.spot_id)
        )
    WHERE id = COALESCE(NEW.spot_id, OLD.spot_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- トリガー設定
CREATE TRIGGER trigger_update_spot_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_spot_rating();
```

## バックアップ・復旧戦略

### 定期バックアップ
- **日次フルバックアップ**: pg_dump
- **継続的WALアーカイブ**: Point-in-Time Recovery対応
- **クロスリージョンレプリケーション**: 災害対策

### データ保持ポリシー
- **ユーザーセッション**: 30日間
- **訪問履歴**: 2年間
- **レビューデータ**: 永続保持
- **画像データ**: S3との連携

---

作成日: 2024年
バージョン: 1.0 
