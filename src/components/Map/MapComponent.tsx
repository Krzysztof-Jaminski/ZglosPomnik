import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
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
  const [map, setMap] = useState<any>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [error, setError] = useState<string | null>(null);
  const [currentInfoWindow, setCurrentInfoWindow] = useState<any>(null);
  const markersRef = useRef<any[]>([]);

  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [showTreePopup, setShowTreePopup] = useState(false);
  const [currentClickMarker, setCurrentClickMarker] = useState<any>(null);
  const onTreeSelectRef = useRef(onTreeSelect);
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated || false;

  // Update ref when onTreeSelect changes
  useEffect(() => {
    onTreeSelectRef.current = onTreeSelect;
  }, [onTreeSelect]);

  useImperativeHandle(ref, () => ({
    clearClickMarker: () => {
      if (currentClickMarker) {
        currentClickMarker.setMap(null);
        setCurrentClickMarker(null);
      }
    },
    centerOnLocation: (lat: number, lng: number) => {
      if (map) {
        map.setCenter({ lat, lng });
        map.setZoom(16); // Zoom in to show the new tree
      }
    }
  }));

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      const loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['places']
      });

      try {
        await loader.load();
        
        const mapInstance = new (window as any).google.maps.Map(mapRef.current, {
          center: { lat: 50.041187, lng: 21.999121 }, // Rzeszów center
          zoom: 13,
          mapTypeId: mapType,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ],
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: 'greedy',
          zoomControl: false,
          scrollwheel: true,
          disableDoubleClickZoom: true,
          clickableIcons: false
        });

        setMap(mapInstance);

        // Add click listener for adding new trees
        if (onTreeSelectRef.current) {
          mapInstance.addListener('click', (event: any) => {
            if (event.latLng) {
              const lat = event.latLng.lat();
              const lng = event.latLng.lng();
              
              // Remove previous click marker if exists
              if (currentClickMarker) {
                currentClickMarker.setMap(null);
              }
              
              // Add blue marker at clicked location
              const clickMarker = new (window as any).google.maps.Marker({
                position: event.latLng,
                map: mapInstance,
                title: 'Nowe zgłoszenie',
                icon: {
                  path: (window as any).google.maps.SymbolPath.CIRCLE,
                  scale: 12,
                  fillColor: '#3b82f6',
                  fillOpacity: 0.9,
                  strokeColor: '#ffffff',
                  strokeWeight: 3
                }
              });

              // Close previous info window if exists
              if (currentInfoWindow) {
                currentInfoWindow.close();
                setCurrentInfoWindow(null);
              }

              // Store the new marker
              setCurrentClickMarker(clickMarker);

              // Call the callback with the exact coordinates
              if (onTreeSelectRef.current) {
                onTreeSelectRef.current(lat, lng);
              }
            }
          });
        }

        setError(null);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setError('Nie udało się załadować mapy. Sprawdź połączenie internetowe.');
      }
    };

    initMap();
  }, []); // Remove onTreeSelect to prevent map restart

  useEffect(() => {
    if (map) {
      map.setMapTypeId(mapType);
    }
  }, [map, mapType]);

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
          markersRef.current.forEach(marker => marker.setMap(null));
          markersRef.current = [];

          // Add markers for trees
          treesData.forEach(tree => {
            const marker = new (window as any).google.maps.Marker({
              position: { lat: tree.location.lat, lng: tree.location.lng },
              map: map,
              title: `${tree.species} (${tree.speciesLatin})`,
              icon: {
                path: (window as any).google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: getMarkerColor(),
                fillOpacity: 0.8,
                strokeColor: '#ffffff',
                strokeWeight: 2
              }
            });

            marker.addListener('click', () => {
              // Close previous info window
              if (currentInfoWindow) {
                currentInfoWindow.close();
              }
              
              // Show custom popup instead of InfoWindow
              setSelectedTree(tree);
              setShowTreePopup(true);
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

  const getMarkerColor = () => {
    // All trees are now considered approved/green
    return '#10b981'; // Green for all trees
  };



  const handleTreePopupClose = () => {
    setShowTreePopup(false);
    setSelectedTree(null);
    // Clear click marker when popup is closed
    if (currentClickMarker) {
      currentClickMarker.setMap(null);
      setCurrentClickMarker(null);
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
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
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
      <div className="absolute bottom-5 left-3 sm:bottom-5 sm:left-5 space-y-2">
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