import multer from "multer";
import path from "path";
import fs from "fs";

// Disk Storage Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads"; // default

    // Check fieldname to decide folder
    if (file.fieldname === "profilePic") {
      folder = "uploads/profilePics";
    } else if (file.fieldname === "productImage") {
      folder = "uploads/products";
    }

    // Create folder if it doesn't exist
    fs.mkdirSync(folder, { recursive: true });

    cb(null, folder);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const safeName = baseName.replace(/\s+/g, "-").toLowerCase();
    cb(null, `${safeName}-${Date.now()}${ext}`);
  },
});

// File Filter (only allow images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
