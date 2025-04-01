import { router } from "./trpc";
import { passioGoRouter } from "./routers/passiogo";

export const appRouter = router({
  passioGo: passioGoRouter,
});

export type AppRouter = typeof appRouter;
