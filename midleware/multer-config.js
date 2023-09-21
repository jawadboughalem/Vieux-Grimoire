const multer = require("multer");
const SharpMulter = require("sharp-multer");

// Création Filname
const newFileName = (originalname, options) => {
  const name =
    originalname.split(".").slice(0, -1).join(".") +
    "-" +
    Date.now() +
    "." +
    options.fileFormat;
  return name;
};

const storage = SharpMulter({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  imageOptions: {
    fileFormat: "webp",
    resize: { width: 412, height: 520 },
    quality: 80,
  },
  filename: newFileName,
});

module.exports = multer({ storage }).single("image");
