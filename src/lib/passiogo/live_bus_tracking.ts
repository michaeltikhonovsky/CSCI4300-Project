import * as passiogo from "./index";

interface BusLocation {
  id: string | null;
  name: string | null;
  route: string | null;
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
}

export class LiveBusTracker {
  private systemId: number;
  private intervalId?: NodeJS.Timeout;
  private onUpdate: (buses: BusLocation[]) => void;
  private intervalMs: number;

  constructor(
    systemId: number,
    onUpdate: (buses: BusLocation[]) => void,
    intervalMs: number = 3000
  ) {
    this.systemId = systemId;
    this.onUpdate = onUpdate;
    this.intervalMs = intervalMs;
  }

  async start() {
    // Initial fetch
    await this.fetchAndUpdate();

    this.intervalId = setInterval(() => {
      this.fetchAndUpdate();
    }, this.intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private async fetchAndUpdate() {
    try {
      const system = await passiogo.getSystemFromID(this.systemId);
      if (!system) {
        console.error(
          `Could not find transportation system with ID: ${this.systemId}`
        );
        return;
      }

      const vehicles = await system.getVehicles();
      const locations = vehicles.map((v) => ({
        id: v.id,
        name: v.name,
        route: v.routeName,
        latitude: v.latitude,
        longitude: v.longitude,
        timestamp: new Date().toISOString(),
      }));

      this.onUpdate(locations);
    } catch (error) {
      console.error("Error fetching bus locations:", error);
    }
  }
}
