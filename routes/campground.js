const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campgrounds');
const campControllers = require('../controllers/campgrounds');
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({storage});

const {isLoggedIn,validateCampGround,isAuthor} = require('../middleware');

// setting campgrounds route
router.get('/', catchAsync(campControllers.index));

//setting route to create form
router.get('/new', isLoggedIn, campControllers.newForm)

//setting post route for feeding details from form to database
router.post('/', isLoggedIn, upload.array('image'),validateCampGround,catchAsync ( campControllers.create))


// setting show route or details of one specific campgrounds
router.get('/:id', catchAsync (campControllers.show))

//setting form to edit campgrounds
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync (campControllers.edit))

// setting put route to edit campgrounds
router.put('/:id', isLoggedIn, isAuthor,upload.array('image'),validateCampGround ,catchAsync (campControllers.update))

// creating route for deleting campgrounds
router.delete('/:id', isLoggedIn, isAuthor,  catchAsync (campControllers.delete))



module.exports = router;
