const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../models/User.js");
const auth = require("../middlewares/authmiddleware.js");

//register

const registerValidator = [
  check("email", "Enter correct email").isEmail(),
  check("password", "Password should be atleast 6 characters long")
    .trim()
    .isLength({ min: 6 }),
  check("name", "Name is required").trim().not().isEmpty(),
];

router.post(
  "/",
  registerValidator,
  expressAsyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(errors.errors.map((e) => e.msg));
    }
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      res.status(400);
      throw new Error("User already exists");
    }
    user = new User({ email, name, password });
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    const savedUser = await user.save();
    const id = savedUser._id;
    const token = jwt.sign({ id }, "secret", { expiresIn: 3600000000 });
    res.status(201).json({
      _id: savedUser._id,
      name,
      email,
      profileImage: savedUser.profileImage,
      token,
      favourites: user.favourites,
      watchlist: user.watchlist,
    });
  })
);

//login

const loginValidator = [
  check("email", "Enter correct email").isEmail(),
  check("password", "Password should be atleast 6 characters long")
    .trim()
    .isLength({ min: 6 }),
];

router.post(
  "/login",
  loginValidator,
  expressAsyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(errors.errors.map((e) => e.msg));
    }
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      res.status(400);
      throw new Error("No user found");
    }
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      res.status(400);
      throw new Error("Invalid Credentials");
    }
    const token = jwt.sign({ id: user._id }, "secret", {
      expiresIn: 3600000000,
    });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email,
      profileImage: user.profileImage,
      token,
      watchlist : user._doc.watchlist,
      favourites : user._doc.favourites,
    });
  })
);

router.get(
  "/",
  auth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  })
);

// favourite a movie

router.put(
  "/favourite/:id",
  auth,
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const image = req.body.image
    const user = await User.findById(req.user._id);
    const favourites = user.favourites;
    if (favourites.filter((f) => f.id === id).length > 0) {
      const removeIndex = favourites.map((f) => f.id.toString()).indexOf(id);
      favourites.splice(removeIndex, 1);
      await user.save();
      res.json(user);
    } else {
      favourites.unshift({id, image});
      await user.save();
      res.json(user);
    }
  })
);

// add a movie to watchlist

router.put(
  "/watchlist/:id",
  auth,
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const image = req.body.image
    const user = await User.findById(req.user._id);
    const watchlist = user.watchlist;
    if (watchlist.filter((f) => f.id === id).length > 0) {
      const removeIndex = watchlist.map((f) => f.id.toString()).indexOf(id);
      watchlist.splice(removeIndex, 1);
      await user.save();
      res.json(user);
    } else {
      watchlist.unshift({id, image});
      await user.save();
      res.json(user);
    }
  })
);

module.exports = router;
