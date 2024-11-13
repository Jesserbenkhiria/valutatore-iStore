import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const ValutazioneLogsRepository = {
        create : async function (idStep){
            const result = await prisma.valutazioneLogs.create({
                data: {
                  stepId: idStep,
                },
              });
              return result.id;
        },
        getTodayCount: async () => {
            try {
              // Get today's date
              const today = new Date();
              today.setHours(0, 0, 0, 0); // Start of the day
        
              // Query Prisma for count of valutazioni for today by step
              const VISITA_PAGINA = await ValutazioneLogsRepository.countTodayByIdStep(ValutazioneLogsRepository.steps.LISTA_LETTA.id);
              const DETTAGLI_CONSULTATI = await ValutazioneLogsRepository.countTodayByIdStep(ValutazioneLogsRepository.steps.DETTAGLIO_VISTO.id);
              const VALUTAZIONI_RICEVUTE = await ValutazioneLogsRepository.countTodayByIdStep(ValutazioneLogsRepository.steps.VALUTAZIONE_RICEVUTA.id);
        
              return {
                VISITA_PAGINA,
                DETTAGLI_CONSULTATI,
                VALUTAZIONI_RICEVUTE,
              };
            } catch (error) {
              console.error('Error in getTodayCount:', error);
              throw new Error('Error retrieving today\'s count');
            }
          },
        countTodayByIdStep: async function (stepId) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            try {
              const result = await prisma.valutazioneLogs.count({
                where: {
                  stepId: stepId,
                  createdAt: {
                    gte: today,
                  },
                },
              });
              return result;
            } catch (error) {
              console.error('Error in countTodayByIdStep:', error);
              throw new Error('Error counting today\'s logs by step ID');
            }
          },
        steps : {
            LISTA_LETTA: { id: 1, descrizione: 'Lista letta' },
            DETTAGLIO_VISTO: { id: 2, descrizione: 'Dettaglio Visto' },
            VALUTAZIONE_RICEVUTA: { id: 3, descrizione: 'Valutazione Ricevuta' },
            VALUTAZIONE_CONFERMATA: { id: 4, descrizione: 'Valutazione Confermata' }
        },
};
