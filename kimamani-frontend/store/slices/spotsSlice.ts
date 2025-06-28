import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Spot {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: SpotCategory;
  rating: number;
  images: string[];
  address: string;
  openingHours?: string;
  website?: string;
  phoneNumber?: string;
  price?: string;
  tags: string[];
  distance?: number; // Distance from user in meters
  isFavorite?: boolean;
}

export interface SpotCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  spotId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface SpotsState {
  spots: Spot[];
  featuredSpots: Spot[];
  nearbySpots: Spot[];
  categories: SpotCategory[];
  selectedSpot: Spot | null;
  spotReviews: Review[];
  favorites: Spot[];
  searchResults: Spot[];
  isLoading: boolean;
  isLoadingReviews: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  radiusFilter: number; // in meters
}

// Initial state
const initialState: SpotsState = {
  spots: [],
  featuredSpots: [],
  nearbySpots: [],
  categories: [],
  selectedSpot: null,
  spotReviews: [],
  favorites: [],
  searchResults: [],
  isLoading: false,
  isLoadingReviews: false,
  error: null,
  searchQuery: '',
  selectedCategory: null,
  radiusFilter: 5000, // 5km default
};

// Async thunks
export const fetchNearbySpots = createAsyncThunk(
  'spots/fetchNearbySpots',
  async (params: { latitude: number; longitude: number; radius: number }, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      const mockSpots: Spot[] = [
        {
          id: '1',
          name: '東京タワー',
          description: '東京のシンボルタワー',
          latitude: 35.6586,
          longitude: 139.7454,
          category: { id: 'landmark', name: 'ランドマーク', icon: 'landmark', color: '#FF6B6B' },
          rating: 4.5,
          images: ['https://example.com/tokyo-tower.jpg'],
          address: '東京都港区芝公園4-2-8',
          tags: ['観光', 'ランドマーク', '展望'],
          distance: 1200,
        },
      ];
      
      return mockSpots;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSpotDetails = createAsyncThunk(
  'spots/fetchSpotDetails',
  async (spotId: string, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      console.log('Fetching spot details for:', spotId);
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchSpots = createAsyncThunk(
  'spots/searchSpots',
  async (searchParams: { query: string; category?: string; location?: { lat: number; lng: number } }, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      console.log('Searching spots with:', searchParams);
      return [];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'spots/toggleFavorite',
  async (spotId: string, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      console.log('Toggling favorite for spot:', spotId);
      return spotId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const spotsSlice = createSlice({
  name: 'spots',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedSpot: (state, action: PayloadAction<Spot | null>) => {
      state.selectedSpot = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    setRadiusFilter: (state, action: PayloadAction<number>) => {
      state.radiusFilter = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch nearby spots
      .addCase(fetchNearbySpots.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNearbySpots.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nearbySpots = action.payload;
        state.spots = action.payload;
      })
      .addCase(fetchNearbySpots.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Search spots
      .addCase(searchSpots.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchSpots.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchSpots.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Toggle favorite
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const spotId = action.payload;
        const spot = state.spots.find(s => s.id === spotId);
        if (spot) {
          spot.isFavorite = !spot.isFavorite;
          if (spot.isFavorite) {
            state.favorites.push(spot);
          } else {
            state.favorites = state.favorites.filter(f => f.id !== spotId);
          }
        }
      });
  },
});

export const {
  clearError,
  setSelectedSpot,
  setSearchQuery,
  setSelectedCategory,
  setRadiusFilter,
  clearSearchResults,
} = spotsSlice.actions;

export default spotsSlice.reducer; 
