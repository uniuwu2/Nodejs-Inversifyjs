import * as multer from "multer";
import * as path from "path";

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname);
  if (file.mimetype === "text/csv" || file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  }
  else {
    cb(null, false);
  }
};

export const uploadCsvMiddleware = multer({
  storage,
  fileFilter,
}).single("file"); // field name in form-data

// If you want a different uploadMiddleware (for other file types), do this:
export const uploadMiddleware = multer({
  storage,
  fileFilter,
});
