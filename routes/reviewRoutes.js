const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const { check, validationResult } = require("express-validator");
const auth = require("../middlewares/authmiddleware");
const Review = require("../models/Review");
const router = express.Router();

// post review

const reviewValidator = [
  check("review", "Review should be atleast 10 characters long")
    .trim()
    .isLength({ min: 10 }),
];

router.post(
  "/",
  auth,
  reviewValidator,
  expressAsyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(errors.errors.map((e) => e.msg));
    }
    const newReview = new Review({
      review: req.body.review,
      user: req.user._id,
      tmdbId: req.body.tmdbId,
    });
    await newReview.save();
    res.status(201).json(newReview);
  })
);

// get reviews for a movie

router.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const reviews = await Review.find({ tmdbId: req.params.id })
      .populate("user")
      .sort({ createdAt: -1 });
    res.json(reviews);
  })
);

// like a review

router.put(
  "/like/:id",
  auth,
  expressAsyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    const likes = review.likes;
    if (
      likes.filter((like) => like.user.toString() === req.user._id.toString())
        .length > 0
    ) {
      const removeIndex = likes
        .map((like) => like.user.toString())
        .indexOf(req.user.id);

      likes.splice(removeIndex, 1);
      await review.save();
      res.json(likes);
    } else {
      likes.unshift({ user: req.user._id });
      await review.save();
      res.json(likes);
    }
  })
);

module.exports = router;
