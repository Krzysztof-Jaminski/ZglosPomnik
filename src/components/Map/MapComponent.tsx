import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import L from 'leaflet';
import { Tree } from '../../types';
import { treesService } from '../../services/treesService';
import { api } from '../../services/api';
import { Satellite, Map as MapIcon } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { GlassButton } from '../UI/GlassButton';
import { TreeInfoPopup } from './TreeInfoPopup';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';

interface MapComponentProps {
  onGoToFeed?: (treeId: string) => void;
  onTreeSelect?: (lat: number, lng: number) => void;
}

export interface MapComponentRef {
  clearClickMarker: () => void;
  centerOnLocation: (lat: number, lng: number) => void;
}

export const MapComponent = forwardRef<MapComponentRef, MapComponentProps>(({ onGoToFeed, onTreeSelect }, ref) => {
  const roadmapMapRef = useRef<HTMLDivElement>(null);
  const satelliteMapRef = useRef<HTMLDivElement>(null);
  const [roadmapMap, setRoadmapMap] = useState<L.Map | null>(null);
  const [satelliteMap, setSatelliteMap] = useState<L.Map | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [error, setError] = useState<string | null>(null);
  const roadmapMarkersRef = useRef<L.CircleMarker[]>([]);
  const satelliteMarkersRef = useRef<L.CircleMarker[]>([]);
  const clickMarkerRef = useRef<L.CircleMarker | null>(null);

  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [showTreePopup, setShowTreePopup] = useState(false);
  const onTreeSelectRef = useRef(onTreeSelect);
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated || false;

  // Update ref when onTreeSelect changes
  useEffect(() => {
    onTreeSelectRef.current = onTreeSelect;
  }, [onTreeSelect]);

  // Save map state when map changes
  useEffect(() => {
    if (roadmapMap || satelliteMap) {
      const currentMap = mapType === 'roadmap' ? roadmapMap : satelliteMap;
      if (currentMap) {
        const handleMoveEnd = () => {
          saveMapState();
        };
        
        currentMap.on('moveend', handleMoveEnd);
        currentMap.on('zoomend', handleMoveEnd);
        
        return () => {
          currentMap.off('moveend', handleMoveEnd);
          currentMap.off('zoomend', handleMoveEnd);
        };
      }
    }
  }, [roadmapMap, satelliteMap, mapType]);

  // Save map state when map type changes
  useEffect(() => {
    saveMapState();
  }, [mapType]);

  // Restore click marker after maps are initialized
  useEffect(() => {
    const savedState = loadMapState();
    if (savedState && savedState.clickMarker && roadmapMap && satelliteMap) {
      // Wait for maps to be fully initialized, then restore click marker
      const timer = setTimeout(() => {
        const currentMap = savedState.mapType === 'roadmap' ? roadmapMap : satelliteMap;
        if (currentMap && currentMap.getContainer() && currentMap.getContainer().offsetWidth > 0) {
          const marker = L.circleMarker([savedState.clickMarker.lat, savedState.clickMarker.lng], {
            radius: 8,
            fillColor: '#3b82f6',
            color: '#ffffff',
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.8
          });
          
          marker.addTo(currentMap);
          clickMarkerRef.current = marker;
          
          // Call onTreeSelect if it exists
          if (onTreeSelectRef.current) {
            onTreeSelectRef.current(savedState.clickMarker.lat, savedState.clickMarker.lng);
          }
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [roadmapMap, satelliteMap]);

  // Save map state to localStorage
  const saveMapState = () => {
    const currentMap = mapType === 'roadmap' ? roadmapMap : satelliteMap;
    if (currentMap && currentMap.getContainer() && currentMap.getContainer().offsetWidth > 0) {
      const center = currentMap.getCenter();
      const zoom = currentMap.getZoom();
      const clickMarker = clickMarkerRef.current ? {
        lat: clickMarkerRef.current.getLatLng().lat,
        lng: clickMarkerRef.current.getLatLng().lng
      } : undefined;
      
      const state = {
        center: [center.lat, center.lng] as [number, number],
        zoom,
        mapType,
        clickMarker
      };
      
      localStorage.setItem('mapState', JSON.stringify(state));
      console.log('Map state saved:', state);
    }
  };

  // Load map state from localStorage
  const loadMapState = () => {
    try {
      const savedState = localStorage.getItem('mapState');
      if (savedState) {
        const state = JSON.parse(savedState);
        console.log('Map state loaded:', state);
        return state;
      }
    } catch (error) {
      console.error('Error loading map state:', error);
    }
    return null;
  };



  useImperativeHandle(ref, () => ({
    clearClickMarker: () => {
      if (clickMarkerRef.current) {
        const currentMap = mapType === 'roadmap' ? roadmapMap : satelliteMap;
        currentMap?.removeLayer(clickMarkerRef.current);
        clickMarkerRef.current = null;
        // Save map state after clearing marker
        saveMapState();
      }
    },
    centerOnLocation: (lat: number, lng: number) => {
      const currentMap = mapType === 'roadmap' ? roadmapMap : satelliteMap;
      if (currentMap) {
        // Optimized zoom for Poland - use appropriate zoom level
        const zoom = Math.min(16, Math.max(10, currentMap.getZoom())); // Clamp between 10-16
        currentMap.setView([lat, lng], zoom);
        // Sync both maps to the same location
        if (roadmapMap && satelliteMap) {
          roadmapMap.setView([lat, lng], zoom);
          satelliteMap.setView([lat, lng], zoom);
        }
      }
    }
  }));

  // Initialize both maps once
  useEffect(() => {
    const initMaps = async () => {
      if (!roadmapMapRef.current || !satelliteMapRef.current || roadmapMap || satelliteMap) return;

      try {
        console.log('Initializing both maps...');
        
        // Ensure Leaflet CSS is loaded
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Disable default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          shadowUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        });

        // Load saved state first
        const savedState = loadMapState();
        const initialCenter = savedState?.center || [52.2297, 21.0122]; // Warsaw as fallback
        const initialZoom = savedState?.zoom || 10;
        const initialMapType = savedState?.mapType || 'roadmap';

        // Create roadmap map in its own container - START WITH SAVED POSITION
        const roadmapInstance = L.map(roadmapMapRef.current, {
          center: initialCenter,
          zoom: initialZoom,
          zoomControl: false,
          attributionControl: false,
          dragging: true,
          touchZoom: true,
          doubleClickZoom: true,
          scrollWheelZoom: true,
          boxZoom: true,
          keyboard: true,
          // NO BOUNDS - GLOBAL MAP
          minZoom: 1,
          maxZoom: 19 // Maximum zoom for best detail
        });

        // Create satellite map in its own container - START WITH SAVED POSITION
        const satelliteInstance = L.map(satelliteMapRef.current, {
          center: initialCenter,
          zoom: initialZoom,
          zoomControl: false,
          attributionControl: false,
          dragging: true,
          touchZoom: true,
          doubleClickZoom: true,
          scrollWheelZoom: true,
          boxZoom: true,
          keyboard: true,
          fadeAnimation: true,
          zoomAnimation: true,
          markerZoomAnimation: true,
          // NO BOUNDS - GLOBAL MAP
          minZoom: 1,
          maxZoom: 19 // Maximum zoom for best detail
        });

        // Add tile layers with GLOBAL settings
        const roadmapTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19, // Maximum zoom for best detail
          minZoom: 1, // Global zoom
          tileSize: 256,
          zoomOffset: 0,
          crossOrigin: true,
          updateWhenZooming: false, // Reduce API calls during zoom
          updateWhenIdle: true,
          keepBuffer: 6, // Increased buffer for better performance
          maxNativeZoom: 19, // Maximum zoom for best detail
          // NO BOUNDS - GLOBAL MAP
        });

        // Primary satellite tiles with fallback - GLOBAL
        const satelliteTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
              attribution: '© Esri',
          maxZoom: 19, // Maximum zoom for best detail
          minZoom: 1, // Global zoom
          tileSize: 256,
          zoomOffset: 0,
          crossOrigin: true,
          updateWhenZooming: false, // Reduce API calls during zoom
          updateWhenIdle: true,
          keepBuffer: 6, // Increased buffer for better performance
          maxNativeZoom: 19, // Maximum zoom for best detail
          // NO BOUNDS - GLOBAL MAP
          errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        });

        // Fallback satellite tiles (OpenStreetMap) - GLOBAL
        const satelliteFallback = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
          maxZoom: 19, // Maximum zoom for best detail
          minZoom: 1, // Global zoom
          tileSize: 256,
          zoomOffset: 0,
          crossOrigin: true,
          updateWhenZooming: false,
          updateWhenIdle: true,
          keepBuffer: 6, // Increased buffer for better performance
          maxNativeZoom: 19, // Maximum zoom for best detail
          // NO BOUNDS - GLOBAL MAP
        });

        roadmapTiles.addTo(roadmapInstance);
        satelliteTiles.addTo(satelliteInstance);
        
        // Add fallback handling for satellite tiles
        satelliteTiles.on('tileerror', () => {
          console.warn('Satellite tile error, switching to fallback');
          satelliteInstance.removeLayer(satelliteTiles);
          satelliteFallback.addTo(satelliteInstance);
        });

        // Add synchronization between maps - NO LIMITS
        let isSyncing = false;
        
        const syncMaps = (sourceMap: L.Map, targetMap: L.Map) => {
          // Sync immediately when map moves
          sourceMap.on('moveend', () => {
            if (isSyncing) return;
            
            isSyncing = true;
            const center = sourceMap.getCenter();
            const zoom = sourceMap.getZoom();
            targetMap.setView([center.lat, center.lng], zoom, { animate: false });
            
            // Reset flag immediately
            isSyncing = false;
          });
        };

        syncMaps(roadmapInstance, satelliteInstance);
        syncMaps(satelliteInstance, roadmapInstance);

        setRoadmapMap(roadmapInstance);
        setSatelliteMap(satelliteInstance);
        
        // Set initial map type from saved state
        setMapType(initialMapType);

        console.log('Both maps initialized successfully');
      } catch (error) {
        console.error('Error initializing maps:', error);
        setError('Nie udało się załadować mapy. Sprawdź połączenie internetowe.');
      }
    };

    initMaps();
  }, []); // Run only once

  // Switch map visibility when mapType changes
  useEffect(() => {
    if (!roadmapMapRef.current || !satelliteMapRef.current) return;

    console.log('Switching map visibility to:', mapType);
    
    if (mapType === 'roadmap') {
      roadmapMapRef.current.style.display = 'block';
      satelliteMapRef.current.style.display = 'none';
    } else {
      roadmapMapRef.current.style.display = 'none';
      satelliteMapRef.current.style.display = 'block';
      
      // Force refresh satellite map when switching to it - NO DELAY
      if (satelliteMap) {
        satelliteMap.invalidateSize();
        console.log('Satellite map refreshed');
      }
    }

    // Sync both maps to the same view
    const activeMap = mapType === 'roadmap' ? roadmapMap : satelliteMap;
    const inactiveMap = mapType === 'roadmap' ? satelliteMap : roadmapMap;
    
    if (activeMap && inactiveMap) {
      const center = activeMap.getCenter();
      const zoom = activeMap.getZoom();
      inactiveMap.setView([center.lat, center.lng], zoom);
    }
  }, [mapType, roadmapMap, satelliteMap]);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (roadmapMap) {
        roadmapMap.remove();
      }
      if (satelliteMap) {
        satelliteMap.remove();
      }
    };
  }, [roadmapMap, satelliteMap]);

  // Add click listeners to both maps
  useEffect(() => {
    if (!roadmapMap || !satelliteMap) return;

    const addClickListeners = (mapInstance: L.Map) => {
      // Remove any existing click listeners first
      mapInstance.off('click');
      
      // Add click listener for adding new trees with debouncing
        mapInstance.on('click', (e) => {
          if (onTreeSelectRef.current) {
          
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            
            // Check if click was on existing tree marker
          const currentMarkers = mapType === 'roadmap' ? roadmapMarkersRef.current : satelliteMarkersRef.current;
          const clickedMarker = currentMarkers.find(marker => {
              const markerPos = marker.getLatLng();
              const distance = mapInstance.distance(e.latlng, markerPos);
            return distance < 30; // 30 meters tolerance
            });
            
            if (clickedMarker) {
              console.log('Clicked on existing tree marker, not adding new marker');
            return;
            }
            
            // Remove previous click marker if exists
            if (clickMarkerRef.current) {
              mapInstance.removeLayer(clickMarkerRef.current);
            }
            
            // Close any existing tree popup
            setShowTreePopup(false);
            
            // Add blue marker at clicked location
            console.log('Adding blue click marker at:', lat, lng);
            const clickMarker = L.circleMarker([lat, lng], {
              radius: 8, // Smaller radius
              fillColor: '#3b82f6',
              color: '#ffffff',
              weight: 2, // Thinner border
              opacity: 0.6, // 60% opacity
              fillOpacity: 0.6, // 60% fill opacity
              className: 'custom-marker'
            }).addTo(mapInstance);

            clickMarkerRef.current = clickMarker;

            // Save map state after adding click marker
            saveMapState();

            // Call the callback with the exact coordinates
            if (onTreeSelectRef.current) {
              onTreeSelectRef.current(lat, lng);
            }
          }
        });
    };

    addClickListeners(roadmapMap);
    addClickListeners(satelliteMap);
  }, [roadmapMap, satelliteMap, mapType]);

  // Load trees and add markers to both maps
  useEffect(() => {
    const loadTrees = async () => {
      try {
        let treesData;
        
        console.log('=== LOADING TREES ===');
        console.log('isAuthenticated:', isAuthenticated);
        
        if (isAuthenticated) {
          console.log('Loading trees from API...');
          treesData = await treesService.getTrees();
          console.log('API returned trees:', treesData.length);
        } else {
          console.log('Loading mock trees...');
          treesData = await api.getTrees();
          console.log('Mock returned trees:', treesData.length);
        }
        
        setTrees(treesData);
        
        if (roadmapMap && satelliteMap) {
          // Clear existing markers from both maps
          roadmapMarkersRef.current.forEach(marker => roadmapMap.removeLayer(marker));
          satelliteMarkersRef.current.forEach(marker => satelliteMap.removeLayer(marker));
          roadmapMarkersRef.current = [];
          satelliteMarkersRef.current = [];

          // Add markers to both maps
          console.log('Adding markers for', treesData.length, 'trees');
          treesData.forEach((tree, index) => {
            console.log(`Adding marker ${index + 1} at:`, tree.location.lat, tree.location.lng);
            
            // Create markers for both maps
            const roadmapMarker = L.circleMarker([tree.location.lat, tree.location.lng], {
              radius: 8, // Smaller radius
              fillColor: '#10b981',
              color: '#ffffff',
              weight: 2, // Thinner border
              opacity: 0.6, // 60% opacity
              fillOpacity: 0.6, // 60% fill opacity
              className: 'tree-marker'
            }).addTo(roadmapMap);

            const satelliteMarker = L.circleMarker([tree.location.lat, tree.location.lng], {
              radius: 8, // Smaller radius
              fillColor: '#10b981',
              color: '#ffffff',
              weight: 2, // Thinner border
              opacity: 0.6, // 60% opacity
              fillOpacity: 0.6, // 60% fill opacity
              className: 'tree-marker'
            }).addTo(satelliteMap);

            // Add click handlers to both markers
            const addMarkerClickHandler = (marker: L.CircleMarker, mapInstance: L.Map) => {
            marker.on('click', (e) => {
              e.originalEvent.stopPropagation();
              
              setShowTreePopup(false);
              
              if (clickMarkerRef.current) {
                  mapInstance.removeLayer(clickMarkerRef.current);
                clickMarkerRef.current = null;
              }
              
                setSelectedTree(tree);
                setShowTreePopup(true);
            });
            };

            addMarkerClickHandler(roadmapMarker, roadmapMap);
            addMarkerClickHandler(satelliteMarker, satelliteMap);

            roadmapMarkersRef.current.push(roadmapMarker);
            satelliteMarkersRef.current.push(satelliteMarker);
          });
        }
      } catch (error) {
        console.error('Error loading trees:', error);
      }
    };

    if (roadmapMap && satelliteMap) {
      loadTrees();
    }
  }, [roadmapMap, satelliteMap, isAuthenticated]);

  const handleTreePopupClose = () => {
    setShowTreePopup(false);
    setSelectedTree(null);
    // Clear click marker when popup is closed
    if (clickMarkerRef.current) {
      const currentMap = mapType === 'roadmap' ? roadmapMap : satelliteMap;
      currentMap?.removeLayer(clickMarkerRef.current);
      clickMarkerRef.current = null;
    }
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <div className="text-center p-6">
          <div className="text-red-500 mb-4">
            <MapIcon className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <GlassButton
            onClick={() => window.location.reload()}
            variant="primary"
            size="sm"
          >
            Spróbuj ponownie
          </GlassButton>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Roadmap container */}
      <div 
        ref={roadmapMapRef} 
        className="h-full w-full min-h-0" 
        style={{ minHeight: '100%', display: mapType === 'roadmap' ? 'block' : 'none' }} 
      />
      
      {/* Satellite container */}
      <div 
        ref={satelliteMapRef} 
        className="h-full w-full min-h-0" 
        style={{ minHeight: '100%', display: mapType === 'satellite' ? 'block' : 'none' }} 
      />
      
      {/* Map controls */}
      <div className="absolute top-2 right-2 flex flex-col space-y-2 z-[1000]">
        <GlassButton
          onClick={() => setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap')}
          title={mapType === 'roadmap' ? 'Przełącz na widok satelitarny' : 'Przełącz na mapę drogową'}
          variant="primary"
          size="xs"
          icon={mapType === 'roadmap' ? Satellite : MapIcon}
        >
          <span className="sr-only">
            {mapType === 'roadmap' ? 'Przełącz na widok satelitarny' : 'Przełącz na mapę drogową'}
          </span>
        </GlassButton>
      </div>

      {/* Tree count indicator and Legend - Left side */}
      <div className="absolute bottom-2 left-2 sm:bottom-2 sm:left-2 space-y-2 z-[1000]">
        {/* Tree count indicator */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-2 py-1 sm:px-5 sm:py-3 rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <p className="text-gray-600 dark:text-gray-300" style={{ fontSize: '13px' }}>
              Zgłoszone drzewa: <span className="font-semibold text-green-500" style={{ fontSize: '13px' }}>{trees.length}</span>
          </p>
        </div>
        
        {/* Legend */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-3 sm:p-4 rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 max-w-44 sm:max-w-64">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Legenda:</div>
            <div className="space-y-2 sm:space-y-3 text-sm">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Uznane</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-500"></div>
                <span className="text-gray-600 dark:text-gray-400">Nowe</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-amber-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Inne zgłoszenia</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tree Info Popup */}
      <AnimatePresence>
        {showTreePopup && selectedTree && (
          <TreeInfoPopup
            tree={selectedTree}
            onClose={handleTreePopupClose}
            onGoToFeed={onGoToFeed}
          />
        )}
      </AnimatePresence>
    </div>
  );
});