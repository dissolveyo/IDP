import cron from "node-cron";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter.js";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import {
  generateApplicationsPerDayAnalytics,
  generateFraudComplaintsAnalytics,
  generateInfrastructureLoadAnalytics,
  generateLengthOfStayAnalytics,
  generateRelocationRegionAnalytics,
} from "../controllers/analytics.controller.js";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export const scheduleAnalyticsJobs = () => {
  // * * * * * - every minute
  cron.schedule("0 0 * * *", async () => {
    const today = dayjs();
    const tomorrow = today.add(1, "day");

    const isLastDayOfMonth = today.month() !== tomorrow.month();

    if (!isLastDayOfMonth) return;

    console.log("[CRON] Generating monthly analytics...");

    const from = today.startOf("month").toDate();
    const to = today.endOf("month").toDate();

    try {
      await generateLengthOfStayAnalytics(from, to);
      await generateApplicationsPerDayAnalytics(from, to);
      await generateRelocationRegionAnalytics(from, to);
      await generateFraudComplaintsAnalytics(from, to);
      await generateInfrastructureLoadAnalytics(from, to);

      console.log("[CRON] Monthly analytics generation complete.");
    } catch (error) {
      console.error("[CRON] Error generating analytics:", error);
    }
  });
};
