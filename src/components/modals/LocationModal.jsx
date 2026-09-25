import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Compass,
  Navigation,
  Search,
  Check,
  Globe,
  Sliders,
  X,
  Clock,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { usePrayers } from '../../context/PrayerContext';
import { useNotification } from '../../context/NotificationContext';

const POPULAR_CITIES = [
  { name: 'Mecca', country: 'Saudi Arabia', lat: 21.4225, lon: 39.8262, tz: 'Asia/Riyadh', badge: '🕋 Makkah' },
  { name: 'Medina', country: 'Saudi Arabia', lat: 24.4672, lon: 39.6111, tz: 'Asia/Riyadh', badge: '🕌 Madinah' },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278, tz: 'Europe/London', badge: '🇬🇧 London' },
  { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060, tz: 'America/New_York', badge: '🇺🇸 New York' },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357, tz: 'Africa/Cairo', badge: '🇪🇬 Cairo' },
  { name: 'Karachi', country: 'Pakistan', lat: 24.8607, lon: 67.0011, tz: 'Asia/Karachi', badge: '🇵🇰 Karachi' },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lon: 106.8456, tz: 'Asia/Jakarta', badge: '🇮🇩 Jakarta' },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708, tz: 'Asia/Dubai', badge: '🇦🇪 Dubai' },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lon: 28.9784, tz: 'Europe/Istanbul', badge: '🇹🇷 Istanbul' },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832, tz: 'America/Toronto', badge: '🇨🇦 Toronto' },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney', badge: '🇦🇺 Sydney' },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, tz: 'Europe/Paris', badge: '🇫🇷 Paris' },
  { name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.1390, lon: 101.6869, tz: 'Asia/Kuala_Lumpur', badge: '🇲🇾 KL' },
  { name: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lon: 90.4125, tz: 'Asia/Dhaka', badge: '🇧🇩 Dhaka' },
  { name: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050, tz: 'Europe/Berlin', badge: '🇩🇪 Berlin' },
  { name: 'Chicago', country: 'United States', lat: 41.8781, lon: -87.6298, tz: 'America/Chicago', badge: '🇺🇸 Chicago' },
  { name: 'Los Angeles', country: 'United States', lat: 34.0522, lon: -118.2437, tz: 'America/Los_Angeles', badge: '🇺🇸 LA' },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, tz: 'Asia/Tokyo', badge: '🇯🇵 Tokyo' },
];

const ALL_SEARCHABLE_CITIES = [
  ...POPULAR_CITIES,
  { name: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lon: 46.6753, tz: 'Asia/Riyadh' },
  { name: 'Jeddah', country: 'Saudi Arabia', lat: 21.5433, lon: 39.1728, tz: 'Asia/Riyadh' },
  { name: 'Dammam', country: 'Saudi Arabia', lat: 26.4207, lon: 50.0888, tz: 'Asia/Riyadh' },
  { name: 'Abu Dhabi', country: 'UAE', lat: 24.4539, lon: 54.3773, tz: 'Asia/Dubai' },
  { name: 'Doha', country: 'Qatar', lat: 25.2854, lon: 51.5310, tz: 'Asia/Qatar' },
  { name: 'Kuwait City', country: 'Kuwait', lat: 29.3759, lon: 47.9774, tz: 'Asia/Kuwait' },
  { name: 'Manama', country: 'Bahrain', lat: 26.2285, lon: 50.5860, tz: 'Asia/Bahrain' },
  { name: 'Muscat', country: 'Oman', lat: 23.5880, lon: 58.3829, tz: 'Asia/Muscat' },
  { name: 'Amman', country: 'Jordan', lat: 31.9454, lon: 35.9284, tz: 'Asia/Amman' },
  { name: 'Jerusalem', country: 'Palestine', lat: 31.7683, lon: 35.2137, tz: 'Asia/Jerusalem' },
  { name: 'Beirut', country: 'Lebanon', lat: 33.8938, lon: 35.5018, tz: 'Asia/Beirut' },
  { name: 'Damascus', country: 'Syria', lat: 33.5138, lon: 36.2765, tz: 'Asia/Damascus' },
  { name: 'Baghdad', country: 'Iraq', lat: 33.3152, lon: 44.3661, tz: 'Asia/Baghdad' },
  { name: 'Tehran', country: 'Iran', lat: 35.6892, lon: 51.3890, tz: 'Asia/Tehran' },
  { name: 'Casablanca', country: 'Morocco', lat: 33.5731, lon: -7.5898, tz: 'Africa/Casablanca' },
  { name: 'Rabat', country: 'Morocco', lat: 34.0209, lon: -6.8416, tz: 'Africa/Casablanca' },
  { name: 'Marrakech', country: 'Morocco', lat: 31.6295, lon: -7.9811, tz: 'Africa/Casablanca' },
  { name: 'Algiers', country: 'Algeria', lat: 36.7538, lon: 3.0588, tz: 'Africa/Algiers' },
  { name: 'Tunis', country: 'Tunisia', lat: 36.8065, lon: 10.1815, tz: 'Africa/Tunis' },
  { name: 'Tripoli', country: 'Libya', lat: 32.8872, lon: 13.1913, tz: 'Africa/Tripoli' },
  { name: 'Khartoum', country: 'Sudan', lat: 15.5007, lon: 32.5599, tz: 'Africa/Khartoum' },
  { name: 'Lahore', country: 'Pakistan', lat: 31.5204, lon: 74.3587, tz: 'Asia/Karachi' },
  { name: 'Islamabad', country: 'Pakistan', lat: 33.6844, lon: 73.0479, tz: 'Asia/Karachi' },
  { name: 'Peshawar', country: 'Pakistan', lat: 34.0151, lon: 71.5249, tz: 'Asia/Karachi' },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777, tz: 'Asia/Kolkata' },
  { name: 'Delhi', country: 'India', lat: 28.7041, lon: 77.1025, tz: 'Asia/Kolkata' },
  { name: 'Bengaluru', country: 'India', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata' },
  { name: 'Hyderabad', country: 'India', lat: 17.3850, lon: 78.4867, tz: 'Asia/Kolkata' },
  { name: 'Colombo', country: 'Sri Lanka', lat: 6.9271, lon: 79.8612, tz: 'Asia/Colombo' },
  { name: 'Kabul', country: 'Afghanistan', lat: 34.5553, lon: 69.2075, tz: 'Asia/Kabul' },
  { name: 'Birmingham', country: 'United Kingdom', lat: 52.4862, lon: -1.8904, tz: 'Europe/London' },
  { name: 'Manchester', country: 'United Kingdom', lat: 53.4808, lon: -2.2426, tz: 'Europe/London' },
  { name: 'Glasgow', country: 'United Kingdom', lat: 55.8642, lon: -4.2518, tz: 'Europe/London' },
  { name: 'Leeds', country: 'United Kingdom', lat: 53.8008, lon: -1.5491, tz: 'Europe/London' },
  { name: 'Dublin', country: 'Ireland', lat: 53.3498, lon: -6.2603, tz: 'Europe/Dublin' },
  { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lon: 4.9041, tz: 'Europe/Amsterdam' },
  { name: 'Brussels', country: 'Belgium', lat: 50.8503, lon: 4.3517, tz: 'Europe/Brussels' },
  { name: 'Vienna', country: 'Austria', lat: 48.2082, lon: 16.3738, tz: 'Europe/Vienna' },
  { name: 'Zurich', country: 'Switzerland', lat: 47.3769, lon: 8.5417, tz: 'Europe/Zurich' },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lon: 12.4964, tz: 'Europe/Rome' },
  { name: 'Madrid', country: 'Spain', lat: 40.4168, lon: -3.7038, tz: 'Europe/Madrid' },
  { name: 'Barcelona', country: 'Spain', lat: 41.3851, lon: 2.1734, tz: 'Europe/Madrid' },
  { name: 'Stockholm', country: 'Sweden', lat: 59.3293, lon: 18.0686, tz: 'Europe/Stockholm' },
  { name: 'Oslo', country: 'Norway', lat: 59.9139, lon: 10.7522, tz: 'Europe/Oslo' },
  { name: 'Copenhagen', country: 'Denmark', lat: 55.6761, lon: 12.5683, tz: 'Europe/Copenhagen' },
  { name: 'Houston', country: 'United States', lat: 29.7604, lon: -95.3698, tz: 'America/Chicago' },
  { name: 'Dallas', country: 'United States', lat: 32.7767, lon: -96.7970, tz: 'America/Chicago' },
  { name: 'San Francisco', country: 'United States', lat: 37.7749, lon: -122.4194, tz: 'America/Los_Angeles' },
  { name: 'Seattle', country: 'United States', lat: 47.6062, lon: -122.3321, tz: 'America/Los_Angeles' },
  { name: 'Washington, D.C.', country: 'United States', lat: 38.9072, lon: -77.0369, tz: 'America/New_York' },
  { name: 'Boston', country: 'United States', lat: 42.3601, lon: -71.0589, tz: 'America/New_York' },
  { name: 'Detroit', country: 'United States', lat: 42.3314, lon: -83.0458, tz: 'America/Detroit' },
  { name: 'Dearborn', country: 'United States', lat: 42.3223, lon: -83.1763, tz: 'America/Detroit' },
  { name: 'Montreal', country: 'Canada', lat: 45.5017, lon: -73.5673, tz: 'America/Toronto' },
  { name: 'Vancouver', country: 'Canada', lat: 49.2827, lon: -123.1207, tz: 'America/Vancouver' },
  { name: 'Calgary', country: 'Canada', lat: 51.0447, lon: -114.0719, tz: 'America/Edmonton' },
  { name: 'Melbourne', country: 'Australia', lat: -37.8136, lon: 144.9631, tz: 'Australia/Melbourne' },
  { name: 'Perth', country: 'Australia', lat: -31.9505, lon: 115.8605, tz: 'Australia/Perth' },
  { name: 'Auckland', country: 'New Zealand', lat: -36.8485, lon: 174.7633, tz: 'Pacific/Auckland' },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore' },
  { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018, tz: 'Asia/Bangkok' },
  { name: 'Nairobi', country: 'Kenya', lat: -1.2921, lon: 36.8219, tz: 'Africa/Nairobi' },
  { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lon: 3.3792, tz: 'Africa/Lagos' },
  { name: 'Johannesburg', country: 'South Africa', lat: -26.2041, lon: 28.0473, tz: 'Africa/Johannesburg' },
  { name: 'Cape Town', country: 'South Africa', lat: -33.9249, lon: 18.4241, tz: 'Africa/Johannesburg' },
];

export const LocationModal = ({ isOpen, onClose }) => {
  const { location, updateLocation, detectLocationGPS, isDetectingLocation } = usePrayers();
  const { showToast } = useNotification();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Advanced / Custom Inputs
  const [customCity, setCustomCity] = useState(location?.city || '');
  const [customCountry, setCustomCountry] = useState(location?.country || '');
  const [customLat, setCustomLat] = useState(location?.latitude || '');
  const [customLon, setCustomLon] = useState(location?.longitude || '');
  const [customTz, setCustomTz] = useState(location?.timezone || 'UTC');

  if (!isOpen) return null;

  const currentCityName = location?.city || 'Mecca';
  const currentCountryName = location?.country || 'Saudi Arabia';
  const currentLat = location?.latitude !== undefined ? Number(location.latitude).toFixed(4) : '21.4225';
  const currentLon = location?.longitude !== undefined ? Number(location.longitude).toFixed(4) : '39.8262';
  const currentTz = location?.timezone || 'UTC';

  // Filter cities by search query
  const filteredCities = searchQuery.trim()
    ? ALL_SEARCHABLE_CITIES.filter((c) =>
        `${c.name} ${c.country}`.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : [];

  const handleSelectCity = async (cityObj) => {
    setIsUpdating(true);
    try {
      await updateLocation({
        city: cityObj.name,
        country: cityObj.country,
        latitude: cityObj.lat,
        longitude: cityObj.lon,
        timezone: cityObj.tz,
      });
      showToast('Location Updated', `Prayer times updated accurately for ${cityObj.name}, ${cityObj.country}.`);
      onClose();
    } catch (err) {
      showToast('Error', 'Failed to update location.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGPSDetect = async () => {
    try {
      const res = await detectLocationGPS();
      showToast('Location Detected', `Synced to ${res.city || 'current GPS coordinates'}. Prayer times recalculated.`);
      onClose();
    } catch (err) {
      showToast('GPS Error', err.message || 'Could not access GPS location.', 'error');
    }
  };

  const handleSaveCustom = async (e) => {
    e.preventDefault();
    if (!customCity.trim()) {
      showToast('Validation Error', 'City name is required.', 'error');
      return;
    }
    setIsUpdating(true);
    try {
      const payload = {
        city: customCity.trim(),
        country: customCountry.trim() || 'Global',
        timezone: customTz.trim() || 'UTC',
      };
      if (customLat !== '' && !isNaN(Number(customLat))) payload.latitude = Number(customLat);
      if (customLon !== '' && !isNaN(Number(customLon))) payload.longitude = Number(customLon);

      await updateLocation(payload);
      showToast('Custom Location Saved', `Prayer times updated for ${customCity}.`);
      onClose();
    } catch (err) {
      showToast('Error', 'Failed to save custom location.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-islamic-border-light dark:border-islamic-border-dark rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-islamic-border-light/60 dark:border-islamic-border-dark/60 flex items-center justify-between bg-gradient-to-r from-islamic-primary-50/50 to-transparent dark:from-islamic-primary-950/30">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-islamic-primary-500/10 dark:bg-islamic-primary-400/20 text-islamic-primary-600 dark:text-islamic-primary-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Set Prayer Location
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Astronomically precise solar prayer calculations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* 1. Active Location Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0f4d6b]/90 to-slate-900 text-white border border-[#088ac1]/50 shadow-soft space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#3dc3f3]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#81d7f8]">
                  Active Coordinates
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#1eb4eb]/20 text-[#bce8fb] border border-[#1eb4eb]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3dc3f3] animate-pulse" />
                Live Sync
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <h4 className="text-xl font-extrabold text-white">
                  {currentCityName}
                </h4>
                <p className="text-xs text-slate-300 font-medium">
                  {currentCountryName}
                </p>
              </div>
              <div className="text-right font-mono text-[11px] text-slate-300">
                <div>{currentLat}°, {currentLon}°</div>
                <div className="text-slate-400 text-[10px]">{currentTz}</div>
              </div>
            </div>
          </div>

          {/* 2. One-Click GPS Auto-Detect Button */}
          <button
            onClick={handleGPSDetect}
            disabled={isDetectingLocation || isUpdating}
            className="w-full group relative flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-[#088ac1] to-[#076e9d] hover:from-[#1eb4eb] hover:to-[#088ac1] text-white font-bold text-sm shadow-picton-glow transition-all active:scale-[0.99] disabled:opacity-70 cursor-pointer"
          >
            {isDetectingLocation ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Acquiring High-Precision GPS...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                <span>📍 Auto-Detect My Live GPS Location</span>
              </>
            )}
          </button>

          {/* 3. Search City Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Search Any City or Region
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type city name (e.g. London, Makkah, New York, Cairo...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-islamic-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchQuery.trim() && (
              <div className="max-h-48 overflow-y-auto rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700/60 shadow-lg">
                {filteredCities.length > 0 ? (
                  filteredCities.map((c) => (
                    <button
                      key={`${c.name}-${c.country}`}
                      onClick={() => handleSelectCity(c)}
                      disabled={isUpdating}
                      className="w-full px-3.5 py-2.5 text-left flex items-center justify-between hover:bg-islamic-primary-50 dark:hover:bg-slate-700 transition-colors group cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-islamic-primary-600 dark:group-hover:text-islamic-primary-400">
                          {c.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {c.country} • {c.tz}
                        </div>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 group-hover:text-islamic-primary-600">
                        {c.lat}°, {c.lon}°
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-slate-500">
                    No predefined city found for "{searchQuery}". You can enter custom coordinates below.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. Quick Select World Regions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-islamic-primary-600" />
                Quick Select Major Cities
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {POPULAR_CITIES.map((c) => {
                const isSelected = currentCityName.toLowerCase() === c.name.toLowerCase();
                return (
                  <button
                    key={c.name}
                    onClick={() => handleSelectCity(c)}
                    disabled={isUpdating}
                    className={`px-3 py-2 rounded-xl text-left border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-islamic-primary-500 bg-islamic-primary-50/90 dark:bg-islamic-primary-950/50 text-islamic-primary-800 dark:text-islamic-primary-200 ring-1 ring-islamic-primary-500 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{c.badge || c.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-islamic-primary-600 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Islamic Hijri Date Adjustment */}
          <div className="p-3.5 rounded-2xl bg-islamic-subtle-light/50 dark:bg-islamic-subtle-dark/50 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-islamic-primary-600" />
                Hijri Date Adjustment
              </span>
              <span className="text-[11px] font-bold text-islamic-primary-600 dark:text-islamic-primary-400">
                {getHijriDate(new Date(), location?.hijri_adjustment || 0).formatted}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {[
                { offset: -2, label: '-2d' },
                { offset: -1, label: '-1d' },
                { offset: 0, label: 'Auto' },
                { offset: 1, label: '+1d' },
                { offset: 2, label: '+2d' },
              ].map((item) => {
                const currentAdj = location?.hijri_adjustment || 0;
                const isSelected = currentAdj === item.offset;
                return (
                  <button
                    key={item.offset}
                    type="button"
                    onClick={async () => {
                      try {
                        await updateLocation({ hijri_adjustment: item.offset });
                        showToast('Hijri Adjusted', `Hijri date offset set to ${item.offset >= 0 ? '+' : ''}${item.offset} days.`);
                      } catch (e) {
                        showToast('Error', 'Failed to update Hijri adjustment.', 'error');
                      }
                    }}
                    disabled={isUpdating}
                    className={`py-1.5 px-1 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                      isSelected
                        ? 'bg-islamic-primary-600 text-white ring-1 ring-islamic-primary-400 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Custom Coordinates Toggle */}
          <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-3">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-500" />
                Custom Latitude / Longitude Coordinates
              </span>
              <span>{showAdvanced ? '▲ Hide' : '▼ Expand'}</span>
            </button>

            {showAdvanced && (
              <form onSubmit={handleSaveCustom} className="mt-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      City Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                      placeholder="e.g. Cambridge"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={customCountry}
                      onChange={(e) => setCustomCountry(e.target.value)}
                      placeholder="e.g. UK"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Latitude (-90 to 90)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={customLat}
                      onChange={(e) => setCustomLat(e.target.value)}
                      placeholder="e.g. 52.2053"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Longitude (-180 to 180)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={customLon}
                      onChange={(e) => setCustomLon(e.target.value)}
                      placeholder="e.g. 0.1218"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Timezone (IANA Name)
                  </label>
                  <input
                    type="text"
                    value={customTz}
                    onChange={(e) => setCustomTz(e.target.value)}
                    placeholder="e.g. Europe/London, America/New_York"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-2 rounded-xl bg-islamic-primary-600 hover:bg-islamic-primary-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {isUpdating ? 'Saving...' : 'Apply Custom Coordinates'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 sm:px-6 sm:py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            Method: {location?.method || 'MWL'} • Hijri: {location?.hijri_adjustment ? `${location.hijri_adjustment > 0 ? '+' : ''}${location.hijri_adjustment}d` : 'Auto'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
