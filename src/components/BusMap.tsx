"use client";

import {
  useEffect,
  useState,
  useCallback,
  useRef,
  createContext,
  useContext,
} from "react";
import {
  GoogleMap,
  DirectionsRenderer,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { LiveBusTracker } from "@/lib/passiogo/live_bus_tracking";

interface ETAInfo {
  duration: string;
  distance: string;
  vehicleName: string;
  stopName: string;
  directions?: google.maps.DirectionsResult;
  busId?: string | null;
}

interface BusLocation {
  lat: number;
  lng: number;
}

export const BetContext = createContext<{
  etaInfo: ETAInfo | null;
  setEtaInfo: (info: ETAInfo | null) => void;
}>({
  etaInfo: null,
  setEtaInfo: () => {},
});

export const useBetContext = () => useContext(BetContext);

const containerStyle = {
  width: "100%",
  height: "500px",
};

// UGA campus coordinates
const center = {
  lat: 33.948,
  lng: -83.3773,
};

export default function BusMap() {
  const { etaInfo } = useBetContext();
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [busLocation, setBusLocation] = useState<BusLocation | null>(null);
  const [tracker, setTracker] = useState<LiveBusTracker | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  const { isLoaded, loadError: apiLoadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  useEffect(() => {
    if (apiLoadError) {
      console.error("Error loading Google Maps API:", apiLoadError);
      setLoadError(new Error("Failed to load Google Maps API"));
    }
  }, [apiLoadError]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.google && window.google.maps) {
      setIsMapLoaded(true);
    }
  }, [isLoaded]);

  useEffect(() => {
    return () => {
      if (tracker) {
        tracker.stop();
      }
    };
  }, [tracker]);

  useEffect(() => {
    if (etaInfo) {
      if (tracker) {
        tracker.stop();
      }

      if (etaInfo.directions) {
        setDirections(etaInfo.directions);
      }

      const newTracker = new LiveBusTracker(
        3994,
        (buses) => {
          const targetBus = buses.find(
            (bus) => bus.name === etaInfo.vehicleName
          );
          if (targetBus?.latitude && targetBus?.longitude) {
            setBusLocation({
              lat: Number(targetBus.latitude),
              lng: Number(targetBus.longitude),
            });
          }
        },
        500
      );

      setTracker(newTracker);
      newTracker.start();
    }
  }, [etaInfo]);

  const handleMapLoad = useCallback(() => {
    setIsMapLoaded(true);
  }, []);

  if (loadError) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 text-center text-white">
        <p>Error loading map. Please refresh the page.</p>
        <p className="text-sm text-gray-400">{loadError.message}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {!isLoaded ? (
        <div className="text-white text-center">Loading Google Maps API...</div>
      ) : (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={14}
          onLoad={handleMapLoad}
        >
          {isMapLoaded && (
            <>
              {directions && <DirectionsRenderer directions={directions} />}
              {busLocation && (
                <Marker
                  position={busLocation}
                  icon={{
                    url: "/bus_icon.png",
                    scaledSize: new google.maps.Size(36, 36),
                  }}
                />
              )}
            </>
          )}
        </GoogleMap>
      )}

      {!isMapLoaded && isLoaded && (
        <div className="text-white text-center">Initializing map...</div>
      )}
    </div>
  );
}
