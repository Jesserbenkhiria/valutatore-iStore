import express from "express";
import ValutazioneController from "../controller/valutazioneController.js";

const privateRouter = express.Router();

privateRouter.put(
  "/api/valutazione/edit/:id",
  ValutazioneController.privateController.editValutazione
);
privateRouter.put(
  "/api/valutazione/valuta/:id",
  ValutazioneController.privateController.valutaValutazione
);
privateRouter.get(
  "/api/valutazione/findById/:id",
  ValutazioneController.privateController.findById
);
privateRouter.get(
  "/api/valutazione/list",
  ValutazioneController.privateController.listValutazioni
);
privateRouter.get(
    "/api/valutazione/missing",
    ValutazioneController.privateController.listValutazioniMissing
  );
privateRouter.post(
  "/api/check-imei",
  ValutazioneController.privateController.checkImei
);
privateRouter.get(
  "/api/valutatore/get-stats",
  ValutazioneController.privateController.getStats
);
export default privateRouter;
