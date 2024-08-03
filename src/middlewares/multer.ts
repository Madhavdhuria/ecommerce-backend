import multer from "multer";
import { v4 as uuid } from "uuid";
import path from "path";

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, "uploads"); 
  },
  filename(req, file, callback) {
    const id = uuid();
    const extName = path.extname(file.originalname);
    const filename = `${id}${extName}`;
    callback(null, filename);
  },
});

export const singleUpload = multer({ storage }).single("file"); 