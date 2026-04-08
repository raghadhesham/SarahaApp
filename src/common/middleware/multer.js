import multer from "multer";
import fs from "fs";
export const extensions = {
  image: ["image/jpeg", "image/png", "image/jpg"],
  video: ["video/mp4", "video/mpeg", "video/quicktime"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg"],
};
export const storage = (customPath) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      let filePath = `uploads/${customPath}`;
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath);
      }
      cb(null, filePath);
    },
    filename: function (req, file, cb) {
      let prefix = Date.now();
      let fileName = `${prefix}-${file.originalname}`;
      cb(null, fileName);
    },
  });
};
export const fileFilter = (allowedType) => {
  return function (req, file, cb) {
    console.log(file);
    
    console.log(file.mimetype);
    if (allowedType.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("wrong file type"), false); //2nd parameter : whether to accept the file or not
    }
  }
}

export const cloudinaryStorage = (customPath) => {
  return multer.memoryStorage({
    destination: function (req, file, cb) {
      let filePath = `uploads/${customPath}`;
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath);
      }
      cb(null, filePath);
    },
    filename: function (req, file, cb) {
      let prefix = Date.now();
      let fileName = `${prefix}-${file.originalname}`;
      cb(null, fileName);
    },
  });
};
export const upload = (folderName,allowedType) => {
  return multer({
    storage: cloudinaryStorage(folderName),
    fileFilter:fileFilter(allowedType)
  }); 
};
