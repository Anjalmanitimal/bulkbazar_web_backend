import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/products",

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const uploadProductImage = multer({
  storage,
});
