import { router, publicProcedure } from "../trpc";
import * as passiogo from "@/lib/passiogo";

export const passioGoRouter = router({
  // Get all routes
  getRoutes: publicProcedure.query(async () => {
    const uga = await passiogo.getSystemFromID(3994);
    if (!uga) throw new Error("Could not find UGA transportation system.");
    return await uga.getRoutes();
  }),

  // Get all stops
  getStops: publicProcedure.query(async () => {
    const uga = await passiogo.getSystemFromID(3994);
    if (!uga) throw new Error("Could not find UGA transportation system.");
    return await uga.getStops();
  }),

  // Get system alerts
  getAlerts: publicProcedure.query(async () => {
    const uga = await passiogo.getSystemFromID(3994);
    if (!uga) throw new Error("Could not find UGA transportation system.");
    return await uga.getSystemAlerts();
  }),

  // Get active vehicles
  getVehicles: publicProcedure.query(async () => {
    const uga = await passiogo.getSystemFromID(3994);
    if (!uga) throw new Error("Could not find UGA transportation system.");
    return await uga.getVehicles();
  }),
});
