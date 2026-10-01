import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Search, 
  Navigation, 
  ExternalLink, 
  Phone, 
  Clock, 
  Sparkles, 
  Info 
} from 'lucide-react';
import { DisposalFacility } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface DisposalMapProps {
  initialCategory?: string | null;
  onScanNew?: () => void;
}

export const DisposalMap: React.FC<DisposalMapProps> = ({ 
  initialCategory,
  onScanNew 
}) => {
  const { t, isRTL } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [facilities, setFacilities] = useState<DisposalFacility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<DisposalFacility | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [, setLoading] = useState(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  // Auto-map initialCategory to filter
  useEffect(() => {
    if (initialCategory) {
      const cat = initialCategory.toLowerCase();
      if (['plastic', 'paper', 'metal', 'organic'].includes(cat)) {
        setSelectedFilter('recycling');
      } else if (cat === 'e_waste') {
        setSelectedFilter('e_waste');
      } else if (cat === 'battery') {
        setSelectedFilter('battery');
      } else if (cat === 'glass') {
        setSelectedFilter('glass');
      } else if (cat === 'textile') {
        setSelectedFilter('textile');
      } else if (cat === 'hazardous') {
        setSelectedFilter('hazardous');
      } else {
        setSelectedFilter('all');
      }
    }
  }, [initialCategory]);

  // Fetch facilities
  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedFilter !== 'all') {
        params.append('type', selectedFilter);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (userLocation) {
        params.append('lat', userLocation.lat.toString());
        params.append('lng', userLocation.lng.toString());
      }

      const res = await fetch(`/api/facilities?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setFacilities(data.facilities || []);
        if (data.facilities && data.facilities.length > 0 && !selectedFacility) {
          setSelectedFacility(data.facilities[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch disposal facilities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [selectedFilter, userLocation]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFacilities();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default to San Francisco coordinates where demo points are located
      const defaultLat = 37.7749;
      const defaultLng = -122.4194;

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 12,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map markers when facilities change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current) return;

    markersRef.current.clearLayers();

    // Custom icons
    const createCustomIcon = (type: string, isSelected: boolean) => {
      const colors: Record<string, string> = {
        recycling: '#059669', // Emerald
        e_waste: '#7C3AED', // Purple
        battery: '#D97706', // Amber
        glass: '#0D9488', // Teal
        textile: '#DB2777', // Pink
        hazardous: '#DC2626', // Red
      };

      const color = colors[type] || '#059669';
      const size = isSelected ? 40 : 32;

      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background-color: ${color};
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: ${isSelected ? '16px' : '13px'};
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            📍
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
      });
    };

    const bounds = L.latLngBounds([]);

    facilities.forEach((facility) => {
      const isSelected = selectedFacility?.id === facility.id;
      const marker = L.marker([facility.lat, facility.lng], {
        icon: createCustomIcon(facility.type, isSelected),
        title: facility.name,
      });

      const popupContent = `
        <div style="min-width: 200px; font-family: sans-serif; padding: 4px;">
          <h4 style="font-weight: 800; font-size: 14px; margin: 0 0 4px 0; color: #0f172a;">${facility.name}</h4>
          <p style="font-size: 11px; margin: 0 0 6px 0; color: #64748b;">${facility.address}, ${facility.city}</p>
          <div style="font-size: 11px; margin-bottom: 6px;">
            <strong>${t('map.hours')}</strong> ${facility.hours || 'N/A'}
          </div>
          <div style="font-size: 10px; color: #059669; font-weight: bold; margin-bottom: 8px;">
            ${facility.acceptedMaterials.slice(0, 3).join(', ')}${facility.acceptedMaterials.length > 3 ? '...' : ''}
          </div>
          <a 
            href="https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}" 
            target="_blank" 
            style="display: inline-block; background-color: #059669; color: white; padding: 4px 8px; border-radius: 6px; font-size: 11px; text-decoration: none; font-weight: bold;"
          >
            ${t('map.getDirections')} →
          </a>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        setSelectedFacility(facility);
      });

      markersRef.current?.addLayer(marker);
      bounds.extend([facility.lat, facility.lng]);
    });

    // Add user location marker if available
    if (userLocation) {
      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: L.divIcon({
          className: 'user-location-marker',
          html: `
            <div style="
              background-color: #2563EB;
              width: 22px;
              height: 22px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 0 0 5px rgba(37,99,235,0.3);
            "></div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        }),
        title: 'You are here',
      }).bindPopup('<strong>Your Location</strong>');

      markersRef.current?.addLayer(userMarker);
      bounds.extend([userLocation.lat, userLocation.lng]);
    }

    if (facilities.length > 0 && mapInstanceRef.current) {
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [facilities, selectedFacility, userLocation, t]);

  // Request browser geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus(t('map.locating'));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationStatus(t('map.locationFound'));

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 13);
        }
      },
      (_err) => {
        setLocationStatus('Location access was not granted. You can search manually instead.');
      },
      { timeout: 10000 }
    );
  };

  const focusFacilityOnMap = (fac: DisposalFacility) => {
    setSelectedFacility(fac);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([fac.lat, fac.lng], 15, { animate: true });
    }
  };

  const filterButtons = [
    { id: 'all', label: t('map.filterAll'), icon: '🌐' },
    { id: 'recycling', label: t('map.filterRecycling'), icon: '♻️' },
    { id: 'e_waste', label: t('map.filterEWaste'), icon: '🔌' },
    { id: 'battery', label: t('map.filterBattery'), icon: '🔋' },
    { id: 'glass', label: t('map.filterGlass'), icon: '🍾' },
    { id: 'textile', label: t('map.filterTextile'), icon: '👕' },
    { id: 'hazardous', label: t('map.filterHazardous'), icon: '⚠️' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Title & Introduction */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t('map.badge')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('map.title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('map.subtitle')}
          </p>
        </div>

        {onScanNew && (
          <button
            onClick={onScanNew}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('map.scanItem')}</span>
          </button>
        )}
      </div>

      {/* Search & Location Bar */}
      <div className="rounded-3xl p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Keyword Search */}
          <div className="sm:col-span-8 relative">
            <Search className={`w-4 h-4 absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-400`} />
            <input
              type="text"
              placeholder={t('map.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
            />
          </div>

          {/* Use My Location Button */}
          <div className="sm:col-span-4">
            <button
              onClick={handleUseMyLocation}
              className="w-full py-2.5 px-4 rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>{t('map.useMyLocation')}</span>
            </button>
          </div>
        </div>

        {/* Location Status Message (if any) */}
        {locationStatus && (
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{locationStatus}</span>
          </div>
        )}

        {/* Stream Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 mr-1">
            Stream:
          </span>
          {filterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setSelectedFilter(btn.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                selectedFilter === btn.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{btn.icon}</span>
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Facilities List + Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: List of Facilities */}
        <div className="lg:col-span-5 space-y-4 order-2 lg:order-1">
          {/* Nearest Suitable Option Banner */}
          {facilities.length > 0 && facilities[0].distanceKm !== undefined && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md space-y-2">
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-100">
                Nearest Suitable Option
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm">{facilities[0].name}</h4>
                  <p className="text-xs text-emerald-100">{facilities[0].address}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black">{facilities[0].distanceKm} km</span>
                  <p className="text-[10px] text-emerald-100">away</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => focusFacilityOnMap(facilities[0])}
                  className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition cursor-pointer"
                >
                  {t('map.depotDetails')}
                </button>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${facilities[0].lat},${facilities[0].lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition cursor-pointer flex items-center gap-1"
                >
                  <span>{t('map.getDirections')}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Facility List */}
          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
              <span>{t('map.facilitiesFound', { count: facilities.length })}</span>
              <span className="text-[11px] text-slate-400">Verified depots</span>
            </div>

            {facilities.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <MapPin className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{t('map.noFacilities')}</h4>
                <p className="text-xs text-slate-500">Try changing the stream filter or searching for another area.</p>
              </div>
            ) : (
              facilities.map((fac) => {
                const isSelected = selectedFacility?.id === fac.id;
                return (
                  <div
                    key={fac.id}
                    onClick={() => focusFacilityOnMap(fac)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mb-1">
                          {fac.type}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {fac.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {fac.address}, {fac.city} {fac.pin}
                        </p>
                      </div>

                      {fac.distanceKm !== undefined && (
                        <span className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-xs shrink-0">
                          {fac.distanceKm} km
                        </span>
                      )}
                    </div>

                    {fac.hours && (
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{fac.hours}</span>
                      </div>
                    )}

                    {fac.phone && (
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{fac.phone}</span>
                      </div>
                    )}

                    {/* Accepted materials */}
                    {fac.acceptedMaterials && fac.acceptedMaterials.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-1">
                        {fac.acceptedMaterials.slice(0, 3).map((mat, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {mat}
                          </span>
                        ))}
                        {fac.acceptedMaterials.length > 3 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{fac.acceptedMaterials.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <span>{t('map.depotDetails')}</span>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${fac.lat},${fac.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 hover:underline text-slate-700 dark:text-slate-300"
                      >
                        <span>{t('map.getDirections')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Interactive Leaflet Map */}
        <div className="lg:col-span-7 order-1 lg:order-2 space-y-3">
          <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-900 relative">
            <div 
              ref={mapContainerRef} 
              className="w-full h-[450px] sm:h-[550px] z-10"
              style={{ minHeight: '400px' }}
            />

            {/* Disclaimer pill */}
            <div className={`absolute bottom-3 ${isRTL ? 'right-3' : 'left-3'} z-20 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 shadow-md`}>
              <span className="font-bold text-emerald-600">{t('map.badge')}:</span> {t('map.materialsAccepted')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
