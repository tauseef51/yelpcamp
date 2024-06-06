const Campground = require('../models/campgrounds');
const {cloudinary} = require("../cloudinary");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

module.exports.index = async (req,res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.newForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.create = async(req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit:1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images =  req.files.map( f => ({url: f.path, filename: f.filename}));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success','Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.show = async (req,res) => {
    const campgroundsDetails = await Campground.findById(req.params.id).populate({path:'reviews',populate:{path:'author'}}).populate('author');
    if(!campgroundsDetails){
        req.flash('error','Cannot find that Campground! 😟');
        return res.redirect('/campgrounds');
    } 
    res.render('campgrounds/show', { campgroundsDetails });
}

module.exports.edit =  async (req, res) => {
    const {id} = req.params;
    const campgroundsDetails = await Campground.findById(id);
    if(!campgroundsDetails){
        req.flash('error','Cannot find that Campground! 😟');
        return res.redirect('/campgrounds');
    } 
    res.render('campgrounds/edit', { campgroundsDetails });
}

module.exports.update = async (req, res) => {
    const {id} = req.params;
    const updatedcamp = await Campground.findByIdAndUpdate(id,{...req.body.campground});
    const imgs = req.files.map( f => ({url: f.path, filename: f.filename}));
    updatedcamp.images.push(...imgs);
    await updatedcamp.save();
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await updatedcamp.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
    }
    req.flash('success','Successfully updated campground 🤗');
    res.redirect(`/campgrounds/${updatedcamp.id}`);
}

module.exports.delete = async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully Deleted campground 😔');
    res.redirect('/campgrounds');
}