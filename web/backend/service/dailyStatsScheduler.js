import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { ValutazioneDailyStatsRepository } from "../repository/valutazioneDailyStats.js";

const prisma = new PrismaClient();
const TIMEZONE = "Europe/Rome";

async function saveYesterdaySnapshot() {
  const today = ValutazioneDailyStatsRepository.formatDateOnly();
  const yesterday = addDays(today, -1);

  await ValutazioneDailyStatsRepository.saveSnapshotForDate(yesterday);
  console.log(`[daily-stats] Saved snapshot for ${yesterday}`);
}

function addDays(dateStr, days) {
  const date = ValutazioneDailyStatsRepository.parseDateOnly(dateStr);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export async function initDailyStats() {
  try {
    const existingDays = await prisma.valutazioneDailyStats.count();

    if (existingDays === 0) {
      const { migratedDays } =
        await ValutazioneDailyStatsRepository.migrateFromLogs();
      console.log(
        `[daily-stats] Migration complete (${migratedDays} days synced from logs)`
      );
    } else {
      console.log(
        `[daily-stats] Skipping migration (${existingDays} days already stored)`
      );
    }
  } catch (error) {
    console.error("[daily-stats] Migration failed:", error.message);
  }

  cron.schedule(
    "5 0 * * *",
    () => {
      saveYesterdaySnapshot().catch((error) => {
        console.error("[daily-stats] Scheduled save failed:", error.message);
      });
    },
    { timezone: TIMEZONE }
  );

  console.log("[daily-stats] Scheduler started (daily save at 00:05 Europe/Rome)");
}
