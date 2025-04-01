import * as passiogo from "./index";

interface ETAResponse {
  duration: string;
  distance: string;
  vehicleName: string;
  stopName: string;
  directions?: google.maps.DirectionsResult;
}

const ROUTE_SEQUENCES = {
  "Bulldog Housing": [
    "University Village Circle",
    "Brandon Oaks Alternate",
    "East Campus Rd (at Rogers Rd)",
    "Building G",
    "Driftmier Engineering Center (to Carlton St.)",
    "Science Learning Center",
    "Snelling Dining Commons",
    "Physics (to Tate)",
    "Memorial Hall",
    "Correll Hall",
    "Black-Diallo-Miller Hall",
    "Creswell Hall (Cloverhurst Ave.)",
    "Oglethorpe House New",
    "Rutherford Hall (to Sanford Dr)",
    "Myers Quad",
    "Stegeman Coliseum",
    "Aderhold Hall (to East Campus Rd.)",
    "Joe Frank Harris Commons",
    "University Health Center",
    "Building H",
  ],
  "Cross Campus Connector": [
    "East Campus Village",
    "Tucker Hall (northbound)",
    "Food Science",
    "Chemistry",
    "Physics (to Tate)",
    "Memorial Hall",
    "Correll Hall",
    "Russell Hall (Linnentown Lane.)",
    "Oglethorpe House New",
    "Rutherford Hall (to Sanford Dr)",
    "Conner Hall",
    "STEM Research",
    "Tucker Hall (southbound)",
    "Joe Frank Harris Commons",
    "University Health Center",
  ],
  "Central Loop": [
    "Main Library",
    "Tucker Hall (southbound)",
    "Joe Frank Harris Commons",
    "University Health Center",
    "East Campus Village",
    "Aderhold Hall (to Plant Science)",
    "Plant Sciences",
    "Science Learning Center",
    "Snelling Dining Commons",
    "Physics (to Tate)",
    "Memorial Hall",
    "Gilbert Hall",
    "The Arch",
  ],
  "Chicopee Shuttle": [
    "Chicopee",
    "School of Social Work Inbound",
    "Psychology-Journalism",
    "School of Social Work Outbound",
  ],
  "Milledge Avenue": [
    "Main Library",
    "Psychology-Journalism",
    "Tate Center",
    "Physics (southbound)",
    "Myers Quad",
    "Presbyterian Center",
    "Lumpkin St @ Rutherford St (to Five Points)",
    "Oakland Avenue (Tri-Delta)",
    "Rutherford Street",
    "Peabody Street",
    "Henderson Avenue",
    "Waddell Street",
    "Broad Street Studios",
    "The Arch",
  ],
  "Night Campus": [
    "University Village Circle",
    "Brandon Oaks Alternate",
    "East Campus Rd (at Rogers Rd)",
    "Building G",
    "Building F",
    "East Campus Village",
    "Aderhold Hall (to Plant Science)",
    "Plant Sciences",
    "Science Learning Center",
    "Snelling Dining Commons",
    "Rutherford Hall (to Lumpkin St)",
    "Creswell Hall (Finley St.)",
    "Gilbert Hall",
    "The Arch",
    "Main Library",
    "Psychology-Journalism",
    "Correll Hall",
    "Russell Hall (Linnentown Lane.)",
    "Oglethorpe House New",
    "Rutherford Hall (to Sanford Dr)",
    "Myers Quad",
    "Stegeman Coliseum",
    "Aderhold Hall (to East Campus Rd.)",
    "Joe Frank Harris Commons",
    "University Health Center",
    "Building H",
  ],
  "North South Connector": [
    "Main Library",
    "Psychology-Journalism",
    "Tate Center",
    "Physics (southbound)",
    "Myers Quad",
    "Stegeman Coliseum",
    "Coverdell",
    "Driftmier Engineering Center (to College Station)",
    "Building F",
    "East Campus Village",
    "Tucker Hall (northbound)",
    "Learning & Development",
  ],
  "Park and Ride Evening": [
    "Park and Ride",
    "Ag Tech to Campus",
    "Tucker Hall (northbound)",
    "Psychology-Journalism",
    "Human Resources",
    "Spring St.",
    "Tucker Hall (southbound)",
    "Intramural Fields Deck",
    "Lot E01",
    "River's Crossing",
    "Poultry Diagnostic & Research Center to Vet Med",
    "Veterinary Medical Center - Platform",
    "Lot E26",
    "Poultry Diagnostic & Research Center to Campus",
  ],
  "Prince-Milledge": [
    "Health Sciences Campus",
    "Lucy Cobb",
    "Broad Street Studios",
    "The Arch",
    "Main Library",
    "Psychology-Journalism",
    "Tate Center",
    "Physics (southbound)",
    "Myers Quad",
    "Presbyterian Center",
    "Lumpkin St @ Rutherford St (to Five Points)",
    "Oakland Avenue (Tri-Delta)",
    "Rutherford Street",
    "Peabody Street",
    "Henderson Avenue",
    "Waddell Street",
    "Nacoochee Avenue",
  ],
  "SEC Swim and Dive": ["Park and Ride", "Ramsey Center"],
  "Vet Med": [
    "Veterinary Medical Center - Platform",
    "Lot E26",
    "Poultry Diagnostic & Research Center to Campus",
    "Park and Ride",
    "Ag Tech to Campus",
    "East Campus Village",
    "Aderhold Hall (to Plant Science)",
    "Plant Sciences",
    "Coverdell",
    "Driftmier Engineering Center (to College Station)",
    "Building F",
    "Intramural Fields (College Station Rd.)",
    "Park and Ride Outbound (to VMC)",
    "River's Crossing",
    "Poultry Diagnostic & Research Center to Vet Med",
  ],
  "West Campus Shuttle": [
    "ACC Multi-Modal Center",
    "Main Library",
    "Psychology-Journalism",
    "Correll Hall",
    "Russell Hall (Linnentown Lane.)",
    "Oglethorpe House New",
    "Rutherford Hall (to Sanford Dr)",
    "Physics (to Tate)",
    "Memorial Hall",
    "Gilbert Hall",
    "The Arch",
  ],
};

function findNextStop(currentStop: string, routeName: string): string | null {
  const sequence = ROUTE_SEQUENCES[routeName as keyof typeof ROUTE_SEQUENCES];
  if (!sequence) return null;

  const currentIndex = sequence.indexOf(currentStop);
  if (currentIndex === -1) return sequence[0];
  if (currentIndex === sequence.length - 1) return sequence[0];
  return sequence[currentIndex + 1];
}

/**
 * Gets ETA between a random bus and a compatible stop
 * @param systemId The transportation system ID (3994 for UGA)
 * @returns Promise that resolves to ETA information
 */
export async function getRandomBusToStopETA(
  systemId: number
): Promise<ETAResponse | null> {
  try {
    const uga = await passiogo.getSystemFromID(systemId);
    if (!uga) {
      console.error(
        `Could not find transportation system with ID: ${systemId}`
      );
      return null;
    }

    const [vehicles, stops, routes] = await Promise.all([
      uga.getVehicles(),
      uga.getStops(),
      uga.getRoutes(),
    ]);

    if (!vehicles.length || !stops.length || !routes.length) {
      console.error("No vehicles, stops, or routes found");
      return null;
    }

    const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];

    if (
      !randomVehicle.routeName ||
      typeof randomVehicle.routeName !== "string"
    ) {
      console.error("Vehicle has no valid route name");
      return null;
    }

    if (
      !ROUTE_SEQUENCES[randomVehicle.routeName as keyof typeof ROUTE_SEQUENCES]
    ) {
      console.log("Vehicle not on a tracked route, trying again...");
      return null;
    }

    const closestStop = findClosestStop(
      {
        lat: Number(randomVehicle.latitude),
        lng: Number(randomVehicle.longitude),
      },
      stops.filter((stop) =>
        ROUTE_SEQUENCES[
          randomVehicle.routeName as keyof typeof ROUTE_SEQUENCES
        ]?.includes(stop.name)
      )
    );

    if (!closestStop) {
      console.error("Could not find closest stop");
      return null;
    }

    const nextStopName = findNextStop(
      closestStop.name,
      randomVehicle.routeName as string
    );
    if (!nextStopName) {
      console.error("Could not find next stop in sequence");
      return null;
    }

    const nextStop = stops.find((stop) => stop.name === nextStopName);
    if (!nextStop) {
      console.error("Could not find next stop object");
      return null;
    }

    const directionsService = new google.maps.DirectionsService();
    const request = {
      origin: {
        lat: Number(randomVehicle.latitude),
        lng: Number(randomVehicle.longitude),
      },
      destination: {
        lat: Number(nextStop.latitude),
        lng: Number(nextStop.longitude),
      },
      travelMode: google.maps.TravelMode.DRIVING,
    };

    const result = await directionsService.route(request);
    const route = result.routes[0].legs[0];

    return {
      duration: route.duration?.text || "Unknown",
      distance: route.distance?.text || "Unknown",
      vehicleName: randomVehicle.name || "Unknown Vehicle",
      stopName: nextStop.name || "Unknown Stop",
      directions: result,
    };
  } catch (error) {
    console.error("Error calculating ETA:", error);
    return null;
  }
}

function findClosestStop(
  busLocation: { lat: number; lng: number },
  stops: any[]
): any | null {
  if (!stops.length) return null;

  return stops.reduce((closest, stop) => {
    const distance = calculateDistance(busLocation, {
      lat: Number(stop.latitude),
      lng: Number(stop.longitude),
    });

    if (!closest || distance < closest.distance) {
      return { ...stop, distance };
    }
    return closest;
  }, null);
}

function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371e3;
  const φ1 = (point1.lat * Math.PI) / 180;
  const φ2 = (point2.lat * Math.PI) / 180;
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
  const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
