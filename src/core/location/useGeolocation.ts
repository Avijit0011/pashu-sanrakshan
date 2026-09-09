import { useState, useEffect, useCallback } from 'react';

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
}

export function useGeolocation(autoFetch = true) {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: false,
    error: null,
    permissionDenied: false,
  });

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        latitude: null,
        longitude: null,
        accuracy: null,
        loading: false,
        error: 'Geolocation is not supported by your browser.',
        permissionDenied: false,
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
          accuracy: Math.round(position.coords.accuracy),
          loading: false,
          error: null,
          permissionDenied: false,
        });
      },
      (error) => {
        let msg = 'Failed to detect location.';
        let isDenied = false;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Location permission was denied. Please enable GPS in browser settings.';
            isDenied = true;
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            msg = 'Location request timed out. Please try again.';
            break;
        }

        // Fallback default coordinates (Anand District, Gujarat rural zone - key livestock region) for testing if permission denied
        setState({
          latitude: null,
          longitude: null,
          accuracy: null,
          loading: false,
          error: msg,
          permissionDenied: isDenied,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }, []);

  useEffect(() => {
    if (autoFetch) {
      getLocation();
    }
  }, [autoFetch, getLocation]);

  const setManualCoordinates = (lat: number, lng: number) => {
    setState({
      latitude: lat,
      longitude: lng,
      accuracy: 10,
      loading: false,
      error: null,
      permissionDenied: false,
    });
  };

  return { ...state, retryLocation: getLocation, setManualCoordinates };
}
