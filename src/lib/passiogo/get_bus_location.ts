import * as passiogo from "./index";

/**
 * Gets the real-time location of a specific bus
 * @param systemId The transportation system ID (3994 for UGA)
 * @param busName Optional: The name of the bus to look for
 * @returns Promise that resolves to an array of bus location data
 */
export async function getBusLocation(
  systemId: number,
  busName?: string
): Promise<any[]> {
  try {
    // Get the transportation system
    const system = await passiogo.getSystemFromID(systemId);

    if (!system) {
      console.error(
        `Could not find transportation system with ID: ${systemId}`
      );
      return [];
    }

    // Get all active vehicles
    const vehicles = await system.getVehicles();

    // If busName is provided, filter for that specific bus
    if (busName) {
      const filteredVehicles = vehicles.filter(
        (v) => v.name && v.name.toLowerCase().includes(busName.toLowerCase())
      );

      if (filteredVehicles.length === 0) {
        console.log(`No buses found with name: ${busName}`);
        return [];
      }

      return filteredVehicles.map((v) => ({
        id: v.id,
        name: v.name,
        route: v.routeName,
        latitude: v.latitude,
        longitude: v.longitude,
        speed: v.speed,
        timestamp: new Date().toISOString(),
      }));
    }

    // Otherwise return all vehicles with their locations
    return vehicles.map((v) => ({
      id: v.id,
      name: v.name,
      route: v.routeName,
      latitude: v.latitude,
      longitude: v.longitude,
      speed: v.speed,
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error getting bus location:", error);
    return [];
  }
}

// Demo usage
async function demo() {
  const ugaSystemId = 3994;

  // Get all buses
  console.log("Getting all UGA buses:");
  const allBuses = await getBusLocation(ugaSystemId);
  console.log(`Found ${allBuses.length} active buses`);

  // Print the first 3 buses with their locations (if any)
  if (allBuses.length > 0) {
    console.log("\nSample bus locations:");
    allBuses.slice(0, 3).forEach((bus) => {
      console.log(
        `- ${bus.name} on route ${bus.route}: (${bus.latitude}, ${bus.longitude})`
      );
    });
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  demo().catch(console.error);
}
