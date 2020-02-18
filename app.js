require('dotenv').config();

var express 	= require("express"),
	app			= express(),
	bodyParser 	= require("body-parser"),
	mongoose 	= require("mongoose"),
	flash = require("connect-flash"),
	passport = require("passport"),
	LocalStrategy = require("passport-local"),
	methodOverride = require("method-override"),
	Campground = require("./models/campground"),
	Comment = require("./models/comment"),
	User = require("./models/user"),
	seedDB = require("./seeds");

//requiring routes
	var commentRoutes = require("./routes/comments"),
		reviewRoutes = require("./routes/reviews"),
		campgroundRoutes = require("./routes/campgrounds"),
		indexRoutes = require("./routes/index");

console.log(process.env.DATABASEURL);
var url = process.env.DATABASEURL || "mongodb://localhost:27017/yelp_camp_v11Deployed"
mongoose.connect(process.env.DATABASEURL, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true
}).then(() => {
	console.log('Connected to DB!');
}).catch(err => {
	console.log('ERROR:', err.message);
});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// seedDB(); //seed the database

app.locals.moment = require('moment');
// PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "Once again Rusty wins cutest dog!",
	resave: false,
	saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser());

app.use(async function(req, res, next){
	res.locals.currentUser = req.user;
	if(req.user){
		try{
			let user = await User.findById(req.user._id).populate('notifications', null, {isRead: false}).exec();
			res.locals.notifications = user.notifications.reverse();
		} catch(err){
			console.log(err.message);
		}
	}
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use("/", indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/campgrounds", campgroundRoutes);

const port = process.env.PORT || 3000;
const host = '0.0.0.0';

app.listen(port, host, function(){
	console.log("The YelpCamp Server Has Started")
});