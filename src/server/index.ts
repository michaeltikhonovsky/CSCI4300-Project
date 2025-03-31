import { router } from "./trpc";

export const appRouter = router({
  // procedures here
});

export type AppRouter = typeof appRouter;
