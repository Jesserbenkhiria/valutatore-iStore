import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TIMEZONE = "Europe/Rome";

function formatDateOnly(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(date);
}

function parseDateOnly(dateStr) {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function addDays(dateStr, days) {
  const date = parseDateOnly(dateStr);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function toApiRow(record) {
  const date =
    record.date instanceof Date
      ? record.date.toISOString().slice(0, 10)
      : String(record.date).slice(0, 10);

  return {
    date,
    stats: {
      VISITA_PAGINA: record.visiteAlValutatore,
      DETTAGLI_CONSULTATI: record.dettagliConsultati,
      VALUTAZIONI_RICEVUTE: record.valutazioniRicevute,
    },
  };
}

export const ValutazioneDailyStatsRepository = {
  formatDateOnly,
  parseDateOnly,

  async getStatsFromLogsForDate(dateStr) {
    const rows = await prisma.$queryRaw`
      SELECT stepId, COUNT(*) as count
      FROM valutazioneLogs
      WHERE stepId IN (1, 2, 3)
        AND DATE(createdAt) = ${dateStr}
      GROUP BY stepId
    `;

    const stats = {
      visiteAlValutatore: 0,
      dettagliConsultati: 0,
      valutazioniRicevute: 0,
    };

    for (const row of rows) {
      const count = Number(row.count);
      switch (Number(row.stepId)) {
        case 1:
          stats.visiteAlValutatore = count;
          break;
        case 2:
          stats.dettagliConsultati = count;
          break;
        case 3:
          stats.valutazioniRicevute = count;
          break;
      }
    }

    return stats;
  },

  async upsertForDate(dateStr, stats) {
    return prisma.valutazioneDailyStats.upsert({
      where: { date: parseDateOnly(dateStr) },
      create: {
        date: parseDateOnly(dateStr),
        visiteAlValutatore: stats.visiteAlValutatore,
        dettagliConsultati: stats.dettagliConsultati,
        valutazioniRicevute: stats.valutazioniRicevute,
      },
      update: {
        visiteAlValutatore: stats.visiteAlValutatore,
        dettagliConsultati: stats.dettagliConsultati,
        valutazioniRicevute: stats.valutazioniRicevute,
      },
    });
  },

  async saveSnapshotForDate(dateStr) {
    const stats = await ValutazioneDailyStatsRepository.getStatsFromLogsForDate(
      dateStr
    );
    return ValutazioneDailyStatsRepository.upsertForDate(dateStr, stats);
  },

  async migrateFromLogs() {
    const rows = await prisma.$queryRaw`
      SELECT DATE(createdAt) as day, stepId, COUNT(*) as count
      FROM valutazioneLogs
      WHERE stepId IN (1, 2, 3)
      GROUP BY DATE(createdAt), stepId
      ORDER BY day ASC
    `;

    const byDay = new Map();

    for (const row of rows) {
      const day =
        row.day instanceof Date
          ? row.day.toISOString().slice(0, 10)
          : String(row.day).slice(0, 10);

      if (!byDay.has(day)) {
        byDay.set(day, {
          visiteAlValutatore: 0,
          dettagliConsultati: 0,
          valutazioniRicevute: 0,
        });
      }

      const stats = byDay.get(day);
      const count = Number(row.count);

      switch (Number(row.stepId)) {
        case 1:
          stats.visiteAlValutatore = count;
          break;
        case 2:
          stats.dettagliConsultati = count;
          break;
        case 3:
          stats.valutazioniRicevute = count;
          break;
      }
    }

    let migratedDays = 0;

    for (const [day, stats] of byDay.entries()) {
      await ValutazioneDailyStatsRepository.upsertForDate(day, stats);
      migratedDays += 1;
    }

    return { migratedDays };
  },

  async list({ page = 1, limit = 30 } = {}) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 30));
    const today = formatDateOnly();

    const liveTodayStats =
      await ValutazioneDailyStatsRepository.getStatsFromLogsForDate(today);

    const totalInTable = await prisma.valutazioneDailyStats.count({
      where: {
        date: {
          lt: parseDateOnly(today),
        },
      },
    });

    const total = totalInTable + 1;
    const skip =
      safePage === 1 ? 0 : safeLimit - 1 + (safePage - 2) * safeLimit;

    const records = await prisma.valutazioneDailyStats.findMany({
      where: {
        date: {
          lt: parseDateOnly(today),
        },
      },
      orderBy: { date: "desc" },
      skip: Math.max(0, skip),
      take: safePage === 1 ? safeLimit - 1 : safeLimit,
    });

    const days =
      safePage === 1
        ? [
            {
              date: today,
              stats: {
                VISITA_PAGINA: liveTodayStats.visiteAlValutatore,
                DETTAGLI_CONSULTATI: liveTodayStats.dettagliConsultati,
                VALUTAZIONI_RICEVUTE: liveTodayStats.valutazioniRicevute,
              },
              isToday: true,
            },
            ...records.map(toApiRow),
          ]
        : records.map(toApiRow);

    return {
      days,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    };
  },
};
