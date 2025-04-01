import * as passiogo from "./index";

async function main() {
  try {
    // Get UGA's transportation system (ID: 3994)
    const uga = await passiogo.getSystemFromID(3994);

    if (!uga) {
      console.error("Could not find UGA transportation system.");
      return;
    }

    // Get all active routes
    const routes = await uga.getRoutes();
    console.log("\nActive Routes:");
    for (const route of routes) {
      console.log(`- ${route.name} (${route.shortName})`);
    }

    // Get all stops
    const stops = await uga.getStops();
    console.log("\nBus Stops:");
    for (const stop of stops) {
      console.log(`- ${stop.name} at (${stop.latitude}, ${stop.longitude})`);
    }

    // Get any current system alerts
    const alerts = await uga.getSystemAlerts();
    console.log("\nCurrent Alerts:");
    for (const alert of alerts) {
      console.log(`- ${alert.name}: ${alert.gtfsAlertDescriptionText}`);
    }

    // Get active vehicles/buses
    const vehicles = await uga.getVehicles();
    console.log("\nActive Vehicles:");
    for (const vehicle of vehicles) {
      console.log(
        `- ${vehicle.name} on route: ${vehicle.routeName}, location: (${vehicle.latitude}, ${vehicle.longitude})`
      );
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
