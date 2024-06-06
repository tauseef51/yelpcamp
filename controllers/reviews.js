const Review = require('../models/review');
const Campground = require('../models/campgrounds');

module.exports.createReview = async (req, res) => {
    const {id} = req.params;
    const camp = await Campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    req.flash('success','Successfully created review 🤗');
    res.redirect(`/campgrounds/${camp._id}`);
}


module.exports.deleteReview = async(req, res) => {
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Opppss!!! Your review has been Deleted 😔');
    res.redirect(`/campgrounds/${id}`);
 }