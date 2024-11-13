import express from "express";
import multer from "multer";
import path from "path";
import ValutazioneController from "../controller/valutazioneController.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(
      null,
      "/root/app/import-telefoni-istore/valutatore/uploads/fotodispositivi"
    );
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  },
});

const limits = {
  fileSize: 15728640 * 4,
};

const upload = multer({ storage: storage, limits: limits });

const publicRouter = express.Router();

publicRouter.get(
  "/valutatore/list",
  ValutazioneController.publicController.list
);
publicRouter.get(
  "/valutatore/:id/details",
  ValutazioneController.publicController.details
);
publicRouter.post(
  "/valutatore/save/valutazione",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "file2", maxCount: 1 },
  ]),
  ValutazioneController.publicController.saveValutazione
);

export default publicRouter;
