import { LiveBusTracker } from "./live_bus_tracking";

async function demo() {
  const tracker = new LiveBusTracker(3994, (buses) => {
    console.clear();
    console.log(`Last updated: ${new Date().toLocaleTimeString()}`);
    console.log(`Active buses: ${buses.length}\n`);

    buses.forEach((bus) => {
      console.log(`${bus.name} on route ${bus.route}`);
      console.log(`Location: (${bus.latitude}, ${bus.longitude})`);
    });
  });

  // Start tracking
  await tracker.start();

  // Stop tracking after 1 minute
  setTimeout(() => {
    tracker.stop();
    console.log("Tracking stopped");
    process.exit(0);
  }, 60000);
}

demo();
