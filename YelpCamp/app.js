const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const { campgroundSchema } = require('./schemas');
const Joi = require('joi');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    console.log('Database Connected');
});
const app = express();
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));


const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 404);
    } else {
        next();
    }
}


app.get('/', (req, res) => {
    res.send("Hello From Yelp Camp!");
})
/**************displaying all campgrounds****************/
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}))
/**************displaying all campgrounds****************/

/**************creating new  campgrounds****************/
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})
app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
    //if (!req.body.campgrounds) throw new ExpressError('Invalid Campground Data', 400)
    const campground = new Campground(req.body.campgrounds);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))
/**************creating new  campgrounds****************/

/**************Detailing of a campgrounds****************/
app.get('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground })
}))
/**************Detailing of a campgrounds****************/

/**************Editing of a campgrounds****************/
app.get('/campgrounds/:id/edit', validateCampground, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground })
}))
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campgrounds })
    res.redirect(`/campgrounds/${campground._id}`)
}))
/**************Editing of a campgrounds****************/

/**************Deleting  a campgrounds****************/
app.delete('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))
/**************Deleting  a campgrounds****************/

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404))
})
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something went wrong'
    res.status(statusCode).render('error', { err });
})
app.use((err, req, res, next) => {
    res.send('Oh boii something got wrong')
})
app.listen(3000, () => {
    console.log('Server is ready to listen at 3000')
})