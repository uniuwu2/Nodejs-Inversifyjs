import * as multer from "multer";
import * as path from "path";
import * as express from "express";
import * as fs from "fs";
type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

const storage = multer.diskStorage({
    destination: (_req: express.Request, _file: Express.Multer.File, cb: DestinationCallback): void => {
        if (_file.fieldname === "avatar") {
            let avatarPath = process.env.IMAGE_PATH || "./packages/ui/src/layouts/public/uploads/users";
            if (!fs.existsSync(avatarPath)) {
                fs.mkdirSync(avatarPath, { recursive: true });
            }
            cb(null, avatarPath);
        } else if (_file.fieldname === "file") {
            let csvPath = process.env.CSV_PATH || "./packages/ui/src/layouts/public/uploads/csv";
            if (!fs.existsSync(csvPath)) {
                fs.mkdirSync(csvPath, { recursive: true });
            }
            cb(null, csvPath);
        }
    },
    filename: (_req: express.Request, file: Express.Multer.File, cb: FileNameCallback): void => {
        cb(null, `${file.originalname}`);
    },
});

const fileFilter = (_req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void => {
    const ext = path.extname(file.originalname);
    if (file.mimetype === "text/csv" || file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        cb(null, true);
    } else {
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
