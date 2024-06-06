// if(process.env.NODE_ENV !== "production") {
//     require('dotenv').config();
// }
require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/expressError');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campground')
const reviewsRoutes = require('./routes/reviews');

//connecting mongoose
// 'mongodb://127.0.0.1:27017/yelpcamp'
const dbUrl =  process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelpcamp';
mongoose.connect( dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
console.log("mongoose connection successful");
})
.catch( (err) => {
console.log('Error connecting mongoose');
console.log(err);
});

// 2nd method
// mongoose.connect(dbUrl, {
//     useNewUrlParser: true,
//     // useCreateIndex: true,
//     useUnifiedTopology: true,
//     // useFindAndModify: false
// });

// const db = mongoose.connection;
// db.on("error",console.error.bind(console,"connection error:"));
// db.once("open", () => {
//     console.log("Database connected");
// });

app.engine('ejs',ejsMate);
// setting ejs as templating engine
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))

const secret = process.env.SECRET || 'thisshouldbeabettersceret!' ;

// storing session on mongo atlas
const store = new MongoStore({
    url: dbUrl,
    secret : secret ,
    touchAfter : 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR",e)
})

//setting up session
const sessionConfig = {
    store,
    name: 'session',
    secret : secret,
    resave : false,
    saveUninitialized : true,
    cookie : {
        httpOnly : true,
        // secure: true,
        expires : Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge : 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// parsing data from form 
app.use(express.urlencoded({extended:true}));

//overriding form method
app.use(methodOverride('_method'));

// using public folder
app.use(express.static(path.join(__dirname,'public')))

// using express mongo sanitize
app.use(mongoSanitize());

// setting up flash middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.info = req.flash('info');
    next();
})

app.use('/',userRoutes);
app.use('/campgrounds',campgroundsRoutes);
app.use('/campgrounds/:id/reviews',reviewsRoutes)


// setting home route
app.get('/', (req,res) =>{
    res.render('home');
})

// setting 404 route
app.all('*', (req, res, next) => {
   next(new ExpressError('Page Not Found',404));
})

// settting error handling route
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error',{err});
})

// setting port on server 3000

app.listen(3000, ()=> {
    console.log("Serving on port 3000");
}) 