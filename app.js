/** @format */

var express = require('express');
var mongoose = require('mongoose');
var cors = require('cors');
var app = express();
var database = require('./config/database');
var bodyParser = require('body-parser');
var path = require('path');
// pull information from HTML POST (express4)

const hbs = require('express-handlebars');
app.use(express.static(path.join(__dirname, 'public')));
app.engine('.hbs', hbs.engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');

var port = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({ extended: 'true' })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

// var db = require("./db");
// db.initialize();
mongoose.connect(database.url);

var { RestaurantModel } = require('./models/Restaurant');
var { ReviewModel } = require('./models/Restaurant');

//get all restaurant data from db
app.get('/api/restaurants', async function (req, res) {
	//req.query to parsed query string parameteres
	//req.params to parsed route parameters from path
	let page = req.query.page;
	let perPage = req.query.perPage;
	let borough = req.query.borough;

	if (!page) {
		page = 0;
	}

	if (!perPage) {
		perPage = 20;
	}

	RestaurantModel.find(function (err, restaurants) {
		if (err) res.send(err);
		res.render('restaurant', {
			layout: 'main.hbs',
			data: restaurants,
		});
	})
		.skip(page * perPage)
		.limit(perPage)
		.lean();
});

app.post('/api/restaurants', async function (req, res) {
	console.log(req.body);
  if (!req.body ){
    res.sendStatus(400)
    res.json({message: 'There is no data inputed'});
  }else{
    const addNewRestaurant = new RestaurantModel({})

	RestaurantModel.create(
		{
			address: req.body.address,
			building: req.body.building,
			coord: req.body.coord,
			street: req.body.street,
			zipcode: req.body.zipcode,
			borough: req.body.borough,
			cuisine: req.body.cuisine,
			grades: req.body.grades,
			name: req.body.name,
			restaurant_id: req.body.restaurant_id,
		},
		function (err, restaurants) {
			if (err) res.send(err);
		}
	)};
});

//put  restaurant based on the _id number
app.put('/api/restaurants/:restaurantId', function (req, res) {
	// create mongose method to update an existing record into collection
	let id = req.params.restaurantId;
	var data = {
		address: [req.body.address],
		building: req.body.building,
		coord: [req.body.coord],
		street: req.body.street,
		zipcode: req.body.zipcode,
		borough: req.body.borough,
		cuisine: req.body.cuisine,
		grades: [req.body.grades],
		name: req.body.name,
		restaurant_id: req.body.restaurant_id,
	};

	// save the user
	Restaurant.findByIdAndUpdate(id, data, function (err, restaurant) {
		if (err) throw err;

		res.send('Successfully updated restaurants - ' + restaurant.name);
	});
});

// delete restaurant based on _id number
app.delete('/api/restaurants/:restaurantId', function (req, res) {
	console.log(req.params.restaurantId);
	let id = req.params.restaurantId;
	restaurant.remove(
		{
			_id: id,
		},
		function (err) {
			if (err) res.send(err);
			else res.send('Restaurant with' + _id + 'has been Deleted.');
		}
	);
});

app.listen(port);
console.log('App listening on port : ' + port);
