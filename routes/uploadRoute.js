const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const express = require("express");
const multer = require("multer");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middlewares/authmiddleware");
const cors = require("cors");

const app = express();
app.use(cors());

cloudinary.config({
  cloud_name: "mycloudapi",
  api_key: "339432286479345",
  api_secret: "xNaCcUTbFwkEsNG7oLtmMR25yA4",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "movies",
    allowedFormats: ["png", "jpg", "jpeg", "jfif"],
  },
});

const upload = multer({ storage });

router.post("/", auth, upload.single("image"), async (req, res) => {
  const user = await User.findById(req.user._id);
  user.profileImage = req.file.path;
  res.send(req.file.path);
  await user.save();
});
module.exports = router;
