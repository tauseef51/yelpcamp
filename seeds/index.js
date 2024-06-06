const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campgrounds');

//connecting mongoose
mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp')
.then(() => {
 console.log("mongoose connection successful");
})
.catch( (err) => {
    console.log('Error connecting mongoose');
    console.log(err);
});

// function 
const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author : '664d86d6d0715adefbb4f014',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consectetur, maiores? Iste delectus, perspiciatis corporis doloribus eos nesciunt error esse aut numquam repellat aspernatur modi ducimus praesentium, atque magni provident qui.',
            price: price,
            geometry: { 
                type: 'Point', 
                coordinates: [ cities[random1000].longitude, cities[random1000].latitude ]
             },
            images : [
                {
                  url: 'https://res.cloudinary.com/dhufsxoju/image/upload/v1716614170/YelpCamp/tshovmchabtv2xlj16vf.jpg',
                  filename: 'YelpCamp/tshovmchabtv2xlj16vf'
                }
              ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})