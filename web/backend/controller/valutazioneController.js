import fetch from "node-fetch";
import { mailer } from "../service/mailer.js";
import { ValutazioneRepository } from "../repository/valutazione.js";
import { orderCreator } from "../service/orderService.js";
import { subscriber } from "../service/klaviyo-subscribe.js";
import { ValutazioneLogsRepository } from "../repository/valutazioneLogs.js";
import axios from "axios";
import { imeiResults } from "../repository/imeiResults.js";
import valutaEmail from "../service/emailSender.js";

const ValutazioneController = {
  // Public endpoints
  publicController: {
    list: async function (req, res) {
      try {
        const requestOptions = {
          method: "GET",
          mode: "no-cors",
        };
        await ValutazioneLogsRepository.create(
          ValutazioneLogsRepository.steps.LISTA_LETTA.id
        );
        const response = await fetch(
          "https://www.trovausati.it/api/models/list?X-Authorization=94836c49db429f09e66da73e9124fe4e15ccbbc0",
          requestOptions
        );
        const result = await response.json();
        res.send(result);
      } catch (err) {
        console.log("Request Failed", err);
        res.status(500).send(err);
      }
    },
    details: async function (req, res) {
      try {
        const requestOptions = {
          method: "GET",
          mode: "no-cors",
        };
        await ValutazioneLogsRepository.create(
          ValutazioneLogsRepository.steps.DETTAGLIO_VISTO.id
        );
        console.log("dettaglio visto");
        const response = await fetch(
          `https://www.trovausati.it/api/stores/models/${req.params.id}?X-Authorization=94836c49db429f09e66da73e9124fe4e15ccbbc0`,
          requestOptions
        );
        const result = await response.json();
        res.send(result);
      } catch (err) {
        console.log("Request Failed", err);
        res.status(500).send(err);
      }
    },
    saveValutazione: async function (req, res) {
      try {
        const id = await ValutazioneRepository.create(
          ValutazioneRepository.parse(req)
        );
        let result = await ValutazioneRepository.read(id);

        // Send the response and return to avoid further processing
        res.status(201).send(result);
        subscriber.richiestaValutazione(result.content,id);
        await ValutazioneLogsRepository.create(
          ValutazioneLogsRepository.steps.VALUTAZIONE_RICEVUTA.id
        );
      } catch (error) {
        console.log(error);
        res.status(500).send(error.message); // Send error response
      }
    },
  },
  // Private endpoints
  privateController: {
    editValutazione: async function (req, res) {
      let status = 200;
      let error = null;
      let rows = null;

      try {
        const id = req.params.id;
        await ValutazioneRepository.update(
          id,
          req.body.confermato,
          req.body.ritirato,
          req.body.content
        );
        
        const parsed = JSON.parse(req.body.content);
        valutaEmail(parsed, id, false);
        rows = await ValutazioneRepository.read(req.params.id);
      } catch (e) {
        console.log(`Failed to update valutation ${e.message}`);
        status = 500;
        error = e.message;
      }
      res.status(status).send(rows);
    },

    getStats: async (req, res) => {
      let status = 200;
      let error = null;
      let stats = null;

      try {
        stats = await ValutazioneLogsRepository.getTodayCount();
      } catch (e) {
        console.error(`Failed to fetch statistics: ${e.message}`);
        status = 500;
        error = e.message;
      }

      res.status(status).send({ stats, error });
    },

    valutaValutazione: async function (req, res) {
      let status = 200;
      let error = null;
      let rows = null;
      try {
        rows = await ValutazioneRepository.read(req.params.id);
        rows = await ValutazioneRepository.valuta(req.params.id, rows.valutato);
        await orderCreator(rows, res.locals.shopify.session);

        // let content = JSON.parse(rows.content);
        // console.log(content);
        // console.log(rows.id);
        console.log("sending email");

        let content = JSON.parse(rows.content);
        // console.log(req.body.prezzo);

       

        if (!rows.idOrdineShopify) {
          subscriber.confermaValutazione(rows.content);
        }
        console.log("content", content);
      } catch (e) {
        console.log(`Failed to create valutation order ${e.message}`);
        status = 500;
        error = e.message;
      }
      res.status(status).send(rows);
    },

    findById: async function (req, res) {
      let status = 200;
      let error = null;
      let rows = null;
      try {
        rows = await ValutazioneRepository.read(req.params.id);
      } catch (e) {
        console.log(`Failed to retrieve valutation ${e.message}`);
        status = 500;
        error = e.message;
      }
      res.status(200).send(rows);
    },

    // Helper function to introduce a delay
    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },

    listValutazioniMissing: async function (req, res) {
      let status = 200;
      let error = null;
      let rows = null;

      try {
        // Retrieve the list of evaluations
        rows = await ValutazioneRepository.list();

        // Filter the rows where 'id' is between 7710 and 7737 (inclusive)
        rows = rows.filter((row) => row.id >= 7710 && row.id <= 7737);

        // Parse the 'content' field of each row and send emails
        for (const row of rows) {
          try {
            // Parse the content and handle any parsing errors
            const content = JSON.parse(row.content);

            // Send email to the shop (sendMailNegozio)
            await mailer.sendMailNegozio(
              row.id,
              content.email,
              content.nome,
              content.prezzo, // Assuming content.prezzo is set correctly
              content.telefono,
              content.imei,
              content.modello,
              content.stato_schermo,
              content.stato_batteria,
              content.stato_estetico,
              content.accessori,
              content.urlImg, // Image path for shop
              content.urlImg // Image path for shop
            );

            console.log("Email sent for row id:", row.id);

            // Introduce a 2-second delay between sending emails
          } catch (e) {
            console.log(`Failed to process row id ${row.id}: ${e.message}`);
          }
        }
      } catch (e) {
        console.log(`Failed to retrieve list: ${e.message}`);
        status = 500;
        error = e.message;
      }

      // Send a response indicating the operation was completed
      res
        .status(status)
        .send({ message: "Emails sent for all filtered rows." });
    },

    listValutazioni: async function (req, res) {
      let status = 200;
      let error = null;
      let rows = null;
      try {
        rows = await ValutazioneRepository.list();
      } catch (e) {
        console.log(`Failed to retrieve list ${e.message}`);
        status = 500;
        error = e.message;
      }
      res.status(200).send(rows);
    },
    listOfVal: async function () {
      try {
        let rows = await ValutazioneRepository.list();
        return rows;
      } catch (e) {
        console.log(`Failed to retrieve list ${e.message}`);
        status = 500;
        error = e.message;
      }
    },

    checkImei: async function (req, res) {
      const { imei, id } = req.body;
      const API_URL = "https://sickw.com/api.php";
      const API_KEY = "FAO-T6C-AZM-T6E-45G-KVO-WMS-IZG";
      if (!imei) {
        return res.status(400).json({ error: "IMEI is required" });
      }
      const exist = await imeiResults.findOneByImei(imei);
      console.log(exist.found);
      if (!exist.found) {
        try {
          const response = await axios.get(
            `${API_URL}?format=beta&key=${API_KEY}&imei=${imei}&service=demo`
          );
          if (response.data.status === "success") {
            const mergedResponse = {
              ...response.data,
              ...response.data.result,
            };

            delete mergedResponse.result;
            delete mergedResponse.IMEI;
            mergedResponse.id = id;
            console.log(mergedResponse);
            await ValutazioneRepository.updateImeiStatus(id, true);
            // Assuming ImeiResponseRepository is properly imported and used
            imeiResults.create(mergedResponse);

            return res.json({
              found: true,
              data: {},
              balance: mergedResponse.balance,
              modelName: mergedResponse["Model Name"],
            });
          } else {
            await ValutazioneRepository.updateImeiStatus(id, false);
            return res.json({ found: false, data: {} });
          }
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      }
      return res.json({ found: true, data: exist.data });
    },
  },
};

export default ValutazioneController;
