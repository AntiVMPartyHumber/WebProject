var express = require("express");
var mongoose = require("mongoose");
var cors = require("cors");
var app = express();
var database = require("./config/database");
var bodyParser = require("body-parser");
var path = require("path");
 // pull information from HTML POST (express4)

const hbs = require("express-handlebars");
app.use(express.static(path.join(__dirname, "public")));
app.engine(".hbs", hbs.engine({ extname: ".hbs" }));
app.set("view engine", "hbs");

var port = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({ extended: "true" })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: "application/vnd.api+json" })); // parse application/vnd.api+json as json

// var db = require("./db");
// db.initialize();
mongoose.connect(database.url);

var Restaurant = require("./models/Restaurant");

//get all restaurant data from db
app.get("/api/restaurants", async function (req, res) {
	//req.query to parsed query string parameteres
	//req.params to parsed route parameters from path
	// const page = urlParams.get('page')
	// console.log(page);

	// let page = req.query.page;
	// let perPage = req.query.perPage;
	// let borough = req.query.borough;

	// let articles = await Article.findAll().paginate

	Restaurant.find(function (err, restaurants) {
		console.log(restaurants)
		if (err) res.send(err);
		// res.json(restaurants)
		res.render("restaurant",{
			layout: "main.hbs",
			data: {restaurants},
		});
		// console.log(keys);
	}).skip(30).limit(3).lean();
});

app.post("api/restaurants", function (req, res) {
	console.log(req.body);
});


//put  restaurant based on the _id number


// delete restaurant based on _id number
app.delete('/api/restaurants/:restaurantiId', function(req, res) {
	console.log(req.params.restaurantiId);
	let id = req.params.restaurantiId;
	restaurant.remove({
		_id : id
	}, function(err) {
		if (err)
			res.send(err);
		else
			res.send('Restaurant with'+  _id + 'has been Deleted.');	
	});
});

app.listen(port);
console.log("App listening on port : " + port);
