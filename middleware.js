const Campground = require('./models/campgrounds');
const Review = require('./models/review');
const ExpressError = require('./utils/expressError');
const {campgroundSchema,reviewSchema} = require('./JoiSchema');

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error','You must be logged in');
        return res.redirect('/login');
     } else {
        next();
     }
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

// middleware for validing campground through Joi Schema
module.exports.validateCampGround = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }   
}

// middleware for authorizing campground author or user
module.exports.isAuthor = async (req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)) {
        req.flash('error','You are not authorized! 😡');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// middleware for authorizing review author or user
module.exports.isReviewAuthor = async (req, res, next) => {
    const {id,reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)) {
        req.flash('error','You are not authorized! 😡');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// middleware for validating review through Joi Schema
module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    } else {
        next();
    }
}