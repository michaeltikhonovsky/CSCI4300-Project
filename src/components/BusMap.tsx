"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  GoogleMap,
  DirectionsRenderer,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { getRandomBusToStopETA } from "@/lib/passiogo/get_eta";
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
  const [etaInfo, setEtaInfo] = useState<ETAInfo | null>(null);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [busLocation, setBusLocation] = useState<BusLocation | null>(null);
  const [tracker, setTracker] = useState<LiveBusTracker | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  // Use the useJsApiLoader hook instead of LoadScript component
  const { isLoaded, loadError: apiLoadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  // Set loadError if API loading fails
  useEffect(() => {
    if (apiLoadError) {
      console.error("Error loading Google Maps API:", apiLoadError);
      setLoadError(new Error("Failed to load Google Maps API"));
    }
  }, [apiLoadError]);

  // Check if Google Maps API is already loaded
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

  const handleGetETA = async () => {
    setIsLoading(true);
    try {
      if (tracker) {
        tracker.stop();
      }

      const eta = await getRandomBusToStopETA(3994);
      if (eta) {
        setEtaInfo(eta);
        if (eta.directions) {
          setDirections(eta.directions);
        }

        const newTracker = new LiveBusTracker(
          3994,
          (buses) => {
            const targetBus = buses.find((bus) => bus.name === eta.vehicleName);
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
    } catch (error) {
      console.error("Error getting ETA:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapLoad = useCallback(() => {
    setIsMapLoaded(true);
  }, []);

  const handleMapError = useCallback((error: Error) => {
    console.error("Error loading Google Maps:", error);
    setLoadError(error);
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

      <div className="mt-4 flex flex-col items-center gap-4">
        {!isMapLoaded && isLoaded && (
          <div className="text-white text-center">Initializing map...</div>
        )}
        {isMapLoaded && (
          <button
            onClick={handleGetETA}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isLoading ? "Loading..." : "Get Random Bus ETA"}
          </button>
        )}

        {etaInfo && (
          <div className="p-4 bg-white rounded shadow">
            <h3 className="font-bold mb-2 text-black">ETA Information</h3>
            <p className="text-black">Stop: {etaInfo.stopName}</p>
            <p className="text-black">Distance: {etaInfo.distance}</p>
            <p className="text-black">Duration: {etaInfo.duration}</p>
          </div>
        )}
      </div>
    </div>
  );
}
