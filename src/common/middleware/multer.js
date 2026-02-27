import multer from "multer";

export const storage = multer.diskStorage({
  destination: "uploads/profiles",
  filename: function (req, file, cb) {
    console.log(file);

    const suffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "" + suffix + "." + file.mimetype.split("/")[1]);
  },
});

export const upload = multer({
  storage,
});
