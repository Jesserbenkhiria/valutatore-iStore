import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const ValutazioneRepository = {
  create: async function (content) {
    const result = await prisma.valutazioni.create({
      data: {
        content: JSON.stringify(content),
      },
    });
    return result.id;
  },
  update: async function (id, confermato, ritirato, content) {
    await prisma.valutazioni.update({
      where: { id: parseInt(id) },
      data: {
        confermato: confermato,
        ritirato: ritirato,
        content: content,
      },
    });
    return true;
  },
  updateIdOrdine: async function (id, idOrdineShopify) {
    await prisma.valutazioni.update({
      where: { id: parseInt(id) },
      data: {
        idOrdineShopify: idOrdineShopify !== null ? idOrdineShopify.toString() : null
      }
    });
    return true;
  },
  list: async function () {
    const results = await prisma.valutazioni.findMany({
      orderBy: { id: 'desc' },
    });
    return results;
  },
  updateImeiStatus: async function (id, imeiStatus) {
    try {
      const result = await prisma.valutazioni.update({
        where: { id: parseInt(id) },
        data: { imeiConfermato: imeiStatus },
      });
      return true;
    } catch (error) {
      console.error('Error updating IMEI status:', error);
      return false;
    }
  },
  valuta: async function (id, valutazione) {
    const valutato = valutazione === true ? false : true;
    const result = await prisma.valutazioni.update({
      where: { id: parseInt(id) },
      data: { valutato: valutato  },
    });
    return result;
  },
  read: async function (id) {
    const result = await prisma.valutazioni.findUnique({
      where: { id: parseInt(id) },
    });
    return result;
  },
  delete: async function (id) {
    await prisma.valutazioni.delete({
      where: { id: parseInt(id) },
    });
    return true;
  },
  parse: function (req) {
    try {
      // Estrazione dei dati dalla richiesta
      let acc = JSON.parse(req.body.accessori);
      let accessori = (acc.scatola == null ? "" : acc.scatola + " ") +
                      (acc.cavodati == null ? "" : acc.cavodati + " ") +
                      (acc.scontrino == null ? "" : acc.scontrino + " ") +
                      (acc.caricatore == null ? "" : acc.caricatore);
  
      // Creazione dell'oggetto 'valutazione'
      let valutazione = {
        nome: req.body.nameSurname,        // Nome del cliente
        email: req.body.email,             // Email del cliente
        telefono: req.body.telefono,       // Telefono del cliente
        indirizzo: req.body.indirizzo,     // Indirizzo del cliente (non utilizzato in seguito?)
        modello: req.body.modello,         // Modello del dispositivo
        accessori: accessori,              // Accessori inclusi con il dispositivo
        imei: req.body.imei,               // IMEI del dispositivo
        stato_batteria: req.body.stato_batteria,     // Stato della batteria del dispositivo
        stato_estetico: req.body.stato_estetico,     // Stato estetico del dispositivo
        stato_schermo: req.body.stato_schermo,       // Stato dello schermo del dispositivo
        prezzo: req.body.prezzo,           // Prezzo proposto per il dispositivo
        urlImg: req.body.urlImg,           // URL dell'immagine del dispositivo (non utilizzato in seguito?)
        note: "",                          // Eventuali note aggiuntive (non utilizzate in seguito?)
      };
  
      return valutazione;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
};
