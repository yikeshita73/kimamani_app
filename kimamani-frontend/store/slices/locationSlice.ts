import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as Location from 'expo-location';

// Types
export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

interface LocationState {
  currentLocation: LocationCoords | null;
  isLocationEnabled: boolean;
  hasLocationPermission: boolean;
  isLoading: boolean;
  error: string | null;
  watchId: number | null;
  lastUpdated: string | null;
  mapRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null;
}

// Initial state
const initialState: LocationState = {
  currentLocation: null,
  isLocationEnabled: false,
  hasLocationPermission: false,
  isLoading: false,
  error: null,
  watchId: null,
  lastUpdated: null,
  mapRegion: null,
};

// Async thunks
export const requestLocationPermission = createAsyncThunk(
  'location/requestLocationPermission',
  async (_, { rejectWithValue }) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('位置情報の許可が必要です');
      }
      
      const isEnabled = await Location.hasServicesEnabledAsync();
      
      if (!isEnabled) {
        throw new Error('位置情報サービスが無効になっています');
      }
      
      return { hasPermission: true, isEnabled };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCurrentLocation = createAsyncThunk(
  'location/getCurrentLocation',
  async (_, { rejectWithValue }) => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        maximumAge: 60000, // 1分間のキャッシュを許可
      });
      
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        heading: location.coords.heading,
        speed: location.coords.speed,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const startLocationWatching = createAsyncThunk(
  'location/startLocationWatching',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30000, // 30秒間隔
          distanceInterval: 100, // 100メートル移動したら更新
        },
        (location) => {
          const coords: LocationCoords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            altitude: location.coords.altitude,
            heading: location.coords.heading,
            speed: location.coords.speed,
          };
          
          dispatch(updateLocation(coords));
        }
      );
      
      return watchId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateLocation: (state, action: PayloadAction<LocationCoords>) => {
      state.currentLocation = action.payload;
      state.lastUpdated = new Date().toISOString();
      
      // Update map region if not set
      if (!state.mapRegion) {
        state.mapRegion = {
          latitude: action.payload.latitude,
          longitude: action.payload.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
      }
    },
    setMapRegion: (state, action: PayloadAction<{
      latitude: number;
      longitude: number;
      latitudeDelta: number;
      longitudeDelta: number;
    }>) => {
      state.mapRegion = action.payload;
    },
    stopLocationWatching: (state) => {
      if (state.watchId) {
        // TODO: Stop watching location using the watchId
        state.watchId = null;
      }
    },
    resetLocation: (state) => {
      state.currentLocation = null;
      state.mapRegion = null;
      state.lastUpdated = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Request permission
      .addCase(requestLocationPermission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestLocationPermission.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasLocationPermission = action.payload.hasPermission;
        state.isLocationEnabled = action.payload.isEnabled;
      })
      .addCase(requestLocationPermission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.hasLocationPermission = false;
        state.isLocationEnabled = false;
      })
      // Get current location
      .addCase(getCurrentLocation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentLocation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentLocation = action.payload;
        state.lastUpdated = new Date().toISOString();
        
        // Set initial map region
        if (!state.mapRegion) {
          state.mapRegion = {
            latitude: action.payload.latitude,
            longitude: action.payload.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
        }
      })
      .addCase(getCurrentLocation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Start watching location
      .addCase(startLocationWatching.fulfilled, (state, action) => {
        state.watchId = action.payload;
      })
      .addCase(startLocationWatching.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  updateLocation,
  setMapRegion,
  stopLocationWatching,
  resetLocation,
} = locationSlice.actions;

export default locationSlice.reducer; 
