import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import ValutazioneController from "../controller/valutazioneController.js";

const uploadDir =
  process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  },
});

// Limit file size to 2MB per file
const limits = {
  fileSize: 2 * 1024 * 1024, // 2MB in bytes
  files: 2, // Maximum 2 files
};

const upload = multer({ 
  storage: storage, 
  limits: limits,
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

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
  async (req, res, next) => {
    try {
      console.log("Files received:", req.files);
      
      // Check if both files are present
      if (!req.files || !req.files.file || !req.files.file2) {
        return res.status(400).json({ 
          error: "Both front and back images are required" 
        });
      }
      
      next();
    } catch (err) {
      console.error("Multer error:", err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ 
          error: "File size too large. Maximum size is 2MB per image." 
        });
      }
      return res.status(400).json({ error: err.message });
    }
  },
  ValutazioneController.publicController.saveValutazione
);

export default publicRouter;
