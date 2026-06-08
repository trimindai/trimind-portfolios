import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Reclaim abandoned rate-limit counter rows once a day (03:00 UTC).
crons.daily(
  "purge-stale-rate-limits",
  { hourUTC: 3, minuteUTC: 0 },
  internal.rateLimit.cleanup
);

export default crons;
