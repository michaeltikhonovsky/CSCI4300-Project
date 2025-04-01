"use client";

import { useEffect, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  DirectionsRenderer,
  Marker,
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
          1500
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

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      >
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={14}>
          {directions && <DirectionsRenderer directions={directions} />}
          {busLocation && (
            <Marker
              position={busLocation}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              }}
              label={{
                text: etaInfo?.vehicleName || "",
                color: "#000000",
                fontSize: "18px",
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>

      <div className="mt-4 flex flex-col items-center gap-4">
        <button
          onClick={handleGetETA}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? "Loading..." : "Get Random Bus ETA"}
        </button>

        {etaInfo && (
          <div className="p-4 bg-white rounded shadow">
            <h3 className="font-bold mb-2 text-black">ETA Information</h3>
            <p className="text-black">Bus: {etaInfo.vehicleName}</p>
            <p className="text-black">Stop: {etaInfo.stopName}</p>
            <p className="text-black">Distance: {etaInfo.distance}</p>
            <p className="text-black">Duration: {etaInfo.duration}</p>
          </div>
        )}
      </div>
    </div>
  );
}
