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
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
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

  useImperativeHandle(ref, () => ({
    clearClickMarker: () => {
      if (clickMarkerRef.current) {
        map?.removeLayer(clickMarkerRef.current);
        clickMarkerRef.current = null;
      }
    },
    centerOnLocation: (lat: number, lng: number) => {
      if (map) {
        map.setView([lat, lng], 16);
      }
    }
  }));

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        // Ensure Leaflet CSS is loaded
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Completely disable default markers by overriding the icon
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          shadowUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        });

        // Clear any existing map completely
        if (map) {
          map.remove();
          setMap(null);
        }
        
        // Clear the container
        if (mapRef.current) {
          mapRef.current.innerHTML = '';
        }
        
        // Clear any existing map ID
        if ((mapRef.current as any)._leaflet_id) {
          (mapRef.current as any)._leaflet_id = null;
        }

        const mapInstance = L.map(mapRef.current, {
          center: [50.041187, 21.999121], // Rzeszów center
          zoom: 13,
          zoomControl: false,
          attributionControl: false,
          dragging: true,
          touchZoom: true,
          doubleClickZoom: true,
          scrollWheelZoom: true,
          boxZoom: true,
          keyboard: true
        });

        // Add tile layer based on map type
        const tileLayer = mapType === 'satellite' 
          ? L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
              attribution: '© Esri',
              maxZoom: 19
            })
          : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 19
            });

        tileLayer.addTo(mapInstance);

        // Add click listener for adding new trees
        mapInstance.on('click', (e) => {
          if (onTreeSelectRef.current) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            
            // Check if click was on existing tree marker
            const clickedMarker = markersRef.current.find(marker => {
              const markerPos = marker.getLatLng();
              const distance = mapInstance.distance(e.latlng, markerPos);
              return distance < 30; // 30 meters tolerance for divIcon markers
            });
            
            if (clickedMarker) {
              console.log('Clicked on existing tree marker, not adding new marker');
              return; // Don't add new marker if clicking on existing tree
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
              radius: 10,
              fillColor: '#3b82f6',
              color: '#ffffff',
              weight: 3,
              opacity: 1,
              fillOpacity: 0.9,
              className: 'custom-marker'
            }).addTo(mapInstance);

            clickMarkerRef.current = clickMarker;

            // Call the callback with the exact coordinates
            if (onTreeSelectRef.current) {
              onTreeSelectRef.current(lat, lng);
            }
          }
        });

        setMap(mapInstance);
        setError(null);

        // Add custom styles for z-index
        const addCustomMarkerStyles = () => {
          const style = document.createElement('style');
          style.textContent = `
            .leaflet-control-container {
              z-index: 1000 !important;
            }
            .leaflet-popup {
              z-index: 1001 !important;
            }
            .leaflet-marker-icon {
              z-index: 9999 !important;
              position: relative !important;
            }
            .leaflet-div-icon {
              background: transparent !important;
              border: none !important;
              z-index: 9999 !important;
            }
            .leaflet-interactive {
              cursor: pointer !important;
            }
            .leaflet-circle-marker {
              pointer-events: auto !important;
              z-index: 9999 !important;
            }
            .custom-marker, .tree-marker {
              pointer-events: auto !important;
              z-index: 9999 !important;
              position: relative !important;
            }
            .custom-marker div, .tree-marker div {
              pointer-events: auto !important;
              cursor: pointer !important;
              z-index: 9999 !important;
              position: relative !important;
            }
            .leaflet-marker-shadow {
              display: none !important;
            }
            .leaflet-default-icon-path {
              display: none !important;
            }
            .leaflet-marker-icon:not(.custom-marker):not(.tree-marker) {
              display: none !important;
            }
            img[src*="marker-icon"] {
              display: none !important;
            }
            .leaflet-marker-icon[src*="marker-icon"] {
              display: none !important;
            }
            .leaflet-marker-icon[src*="marker-icon.png"] {
              display: none !important;
            }
            .leaflet-marker-icon[src*="marker-icon-2x.png"] {
              display: none !important;
            }
            .leaflet-marker-icon[src*="marker-shadow.png"] {
              display: none !important;
            }
            /* Hide all default marker images */
            .leaflet-marker-icon img {
              display: none !important;
            }
            /* Show only our custom markers */
            .custom-marker, .tree-marker {
              display: block !important;
            }
            .custom-marker div, .tree-marker div {
              display: block !important;
            }
            .leaflet-marker-pane {
              z-index: 9999 !important;
            }
            .leaflet-overlay-pane {
              z-index: 9999 !important;
            }
          `;
          document.head.appendChild(style);
        };

        addCustomMarkerStyles();

        // Force map to invalidate size after a short delay
        setTimeout(() => {
          mapInstance.invalidateSize();
        }, 100);

      } catch (error) {
        console.error('Error loading Leaflet map:', error);
        setError('Nie udało się załadować mapy. Sprawdź połączenie internetowe.');
      }
    };

    initMap();
    
    // Cleanup function
    return () => {
      if (map) {
        map.remove();
        setMap(null);
      }
    };
  }, [mapType]); // Add mapType as dependency

  useEffect(() => {
    const loadTrees = async () => {
      try {
        let treesData;
        
        console.log('=== LOADING TREES ===');
        console.log('isAuthenticated:', isAuthenticated);
        
        if (isAuthenticated) {
          // Użyj prawdziwego API dla zalogowanych użytkowników
          console.log('Loading trees from API...');
          treesData = await treesService.getTrees();
          console.log('API returned trees:', treesData.length);
        } else {
          // Użyj mock data dla niezalogowanych użytkowników
          console.log('Loading mock trees...');
          treesData = await api.getTrees();
          console.log('Mock returned trees:', treesData.length);
        }
        
        console.log('Final trees data:', treesData);
        console.log('First tree details:', treesData[0]);
        if (treesData[0]) {
          console.log('First tree images:', treesData[0].imageUrls);
        }
        setTrees(treesData);
        
        if (map) {
          // Clear existing markers
          markersRef.current.forEach(marker => map.removeLayer(marker));
          markersRef.current = [];

          // Add markers for trees
          console.log('Adding markers for', treesData.length, 'trees');
          treesData.forEach((tree, index) => {
            console.log(`Adding marker ${index + 1} at:`, tree.location.lat, tree.location.lng);
            
            // Create custom marker using circleMarker instead
            const marker = L.circleMarker([tree.location.lat, tree.location.lng], {
              radius: 10,
              fillColor: '#10b981',
              color: '#ffffff',
              weight: 3,
              opacity: 1,
              fillOpacity: 0.9,
              className: 'tree-marker'
            }).addTo(map);

            marker.on('click', (e) => {
              // Prevent event bubbling to map click
              e.originalEvent.stopPropagation();
              
              // Close any existing tree popup
              setShowTreePopup(false);
              
              // Clear any existing click marker
              if (clickMarkerRef.current) {
                map.removeLayer(clickMarkerRef.current);
                clickMarkerRef.current = null;
              }
              
              // Small delay to prevent double-click issues
              setTimeout(() => {
                setSelectedTree(tree);
                setShowTreePopup(true);
              }, 50);
            });

            markersRef.current.push(marker);
          });
        }
      } catch (error) {
        console.error('Error loading trees:', error);
        console.log('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          isAuthenticated,
          error
        });
      }
    };

    if (map) {
      loadTrees();
    }
  }, [map, isAuthenticated]);


  const handleTreePopupClose = () => {
    setShowTreePopup(false);
    setSelectedTree(null);
    // Clear click marker when popup is closed
    if (clickMarkerRef.current) {
      map?.removeLayer(clickMarkerRef.current);
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
      <div ref={mapRef} className="h-full w-full min-h-0" style={{ minHeight: '100%' }} />
      
      {/* Map controls */}
      <div className="absolute top-2 right-2 flex flex-col space-y-2 z-[1000]">
        <GlassButton
          onClick={() => setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap')}
          title={mapType === 'roadmap' ? 'Przełącz na widok satelitarny' : 'Przełącz na mapę drogową'}
          variant="primary"
          size="xs"
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
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Zgłoszenia: <span className="font-bold text-green-600">{trees.length}</span>
          </p>
        </div>
        
        {/* Legend */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-2 sm:p-3 rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 max-w-40 sm:max-w-60">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Legenda:</div>
          <div className="space-y-1 sm:space-y-2 text-sm">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Uznane</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Własne zgłoszenia</span>
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