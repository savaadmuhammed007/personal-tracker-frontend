import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { prayerApi } from '../api/prayerApi';
import { settingsApi } from '../api/settingsApi';
import { useAuth } from './AuthContext';

const PrayerContext = createContext(null);

export const PrayerProvider = ({ children }) => {
  const { isAuthenticated, refreshProfile } = useAuth();
  const [data, setData] = useState({
    date: '',
    completed_count: 0,
    total_count: 5,
    completion_percentage: 0,
    next_prayer: {
      name: 'Fajr',
      scheduled_time: '',
      remaining_formatted: '',
      remaining_hours: 0,
      remaining_minutes: 0,
    },
    prayers: [],
    timetable: {},
    location: {
      city: 'Mecca',
      country: 'Saudi Arabia',
      latitude: 21.4225,
      longitude: 39.8262,
      timezone: 'Asia/Riyadh',
      method: 'Umm Al-Qura University, Makkah',
      asr_method: 'Standard',
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const fetchTodayPrayers = useCallback(async (dateStr) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await prayerApi.getToday(dateStr);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load prayer times:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTodayPrayers();
      // Polling every 5 minutes for countdown sync
      const interval = setInterval(() => {
        fetchTodayPrayers();
      }, 300000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchTodayPrayers]);

  const updateLocation = async (locationPayload) => {
    try {
      await settingsApi.updateSettings(locationPayload);
      if (refreshProfile) {
        await refreshProfile();
      }
      await fetchTodayPrayers();
      return true;
    } catch (err) {
      console.error('Failed to update location:', err);
      throw err;
    }
  };

  const changeCity = async (cityName) => {
    return updateLocation({ city: cityName });
  };

  const detectLocationGPS = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }

      setIsDetectingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const lat = Number(position.coords.latitude.toFixed(4));
            const lon = Number(position.coords.longitude.toFixed(4));
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

            // Attempt lightweight reverse geocoding with OpenStreetMap Nominatim for nice city name
            let detectedCity = '';
            let detectedCountry = '';
            try {
              const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
                { headers: { 'Accept-Language': 'en' } }
              );
              if (geoRes.ok) {
                const geoJson = await geoRes.json();
                const addr = geoJson.address || {};
                detectedCity = addr.city || addr.town || addr.municipality || addr.state_district || addr.county || addr.state || '';
                detectedCountry = addr.country || '';
              }
            } catch (revErr) {
              console.warn('Reverse geocoding fetch error (falling back to coordinates):', revErr);
            }

            const payload = {
              latitude: lat,
              longitude: lon,
              timezone: tz,
            };
            if (detectedCity) payload.city = detectedCity;
            if (detectedCountry) payload.country = detectedCountry;

            await updateLocation(payload);
            setIsDetectingLocation(false);
            resolve({
              city: detectedCity || `${lat}, ${lon}`,
              country: detectedCountry,
              latitude: lat,
              longitude: lon,
              timezone: tz,
            });
          } catch (err) {
            setIsDetectingLocation(false);
            reject(err);
          }
        },
        (error) => {
          setIsDetectingLocation(false);
          let msg = 'Failed to retrieve location.';
          if (error.code === 1) msg = 'Location permission was denied. Please allow location access in your browser.';
          else if (error.code === 2) msg = 'Position unavailable.';
          else if (error.code === 3) msg = 'Location request timed out.';
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const togglePrayer = async (prayerName, statusChoice = 'completed', notes = '') => {
    // Optimistic UI update
    setData((prev) => {
      const updatedPrayers = (prev.prayers || []).map((p) => {
        if (p.prayer_name === prayerName) {
          const newStatus = p.status === statusChoice ? 'pending' : statusChoice;
          return {
            ...p,
            status: newStatus,
            completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
            notes,
          };
        }
        return p;
      });
      const completedCount = updatedPrayers.filter((p) => p.status === 'completed').length;
      return {
        ...prev,
        prayers: updatedPrayers,
        completed_count: completedCount,
        completion_percentage: Math.round((completedCount / 5) * 100),
      };
    });

    try {
      const targetPrayer = (data.prayers || []).find((p) => p.prayer_name === prayerName);
      const newStatus = targetPrayer?.status === statusChoice ? 'pending' : statusChoice;
      await prayerApi.togglePrayer({
        prayer_name: prayerName,
        status: newStatus,
        notes,
      });
      // Refresh to ensure exact streaks and timestamps
      fetchTodayPrayers();
    } catch (err) {
      console.error('Failed to toggle prayer:', err);
      fetchTodayPrayers();
    }
  };

  return (
    <PrayerContext.Provider
      value={{
        ...data,
        isLoading,
        isDetectingLocation,
        refreshPrayers: fetchTodayPrayers,
        updateLocation,
        changeCity,
        detectLocationGPS,
        togglePrayer,
      }}
    >
      {children}
    </PrayerContext.Provider>
  );
};

export const usePrayers = () => {
  const context = useContext(PrayerContext);
  if (!context) {
    throw new Error('usePrayers must be used within a PrayerProvider');
  }
  return context;
};

