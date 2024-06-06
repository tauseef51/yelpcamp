const express = require('express');
const router = express.Router({mergeParams:true});
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/review');
const Campground = require('../models/campgrounds');
const {isLoggedIn,validateReview,isReviewAuthor} = require('../middleware');
const reviewControllers = require ('../controllers/reviews');

router.post('/', isLoggedIn, validateReview, catchAsync(reviewControllers.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviewControllers.deleteReview));

module.exports = router;