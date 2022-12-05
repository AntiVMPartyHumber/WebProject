var express = require("express");
var mongoose = require("mongoose");
var cors = require("cors");
var app = express();
var database = require("./config/database");
var bodyParser = require("body-parser");
var path = require("path");
var cookieSession = require("cookie-session");
const crypto = require("crypto");
//const router = express.Router();
//const serverless = require("serverless-http");


const { downloadRestaurantThumb, searchPhotos } = require("./imageUtils");
var restaurantModels = require("./models/Restaurant");

const hbs = require("express-handlebars");

app.use(express.static(path.join(__dirname, "public")));

//app.engine(".hbs", hbs.engine({ extname: ".hbs" }));

const HBS = hbs.create({
  extname: ".hbs",
  helpers: {
    getDeleteHint: (isCreator) => {
      if (isCreator) {
        return "Delete this restaurant";
      } else {
        return "Only author can delete restaurant";
      }
    },
    getEditHint: (isCreator) => {
      if (isCreator) {
        return "Edit this restaurant";
      } else {
        return "Only author can edit restaurant";
      }
    },
  },
});
app.engine(".hbs", HBS.engine);

//set view engine as hbs
app.set("view engine", "hbs");

var port = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({ extended: "true" })); // parse application/x-www-form-urlencoded
//app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: "application/vnd.api+json" })); // parse application/vnd.api+json as json

// var db = require("./db");
// db.initialize();
mongoose.connect(database.url);

var Restaurant = require("./models/Restaurant");

app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SECRETKEY],
    // Cookie Options
    maxAge: 365 * 24 * 60 * 60 * 1000, // 24 hours
  })
);

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
    console.log(restaurants);
    if (err) res.send(err);
    // res.json(restaurants)
    res.render("restaurant", {
      layout: "main.hbs",
      data: { restaurants },
    });
    // console.log(keys);
  })
    .skip(30)
    .limit(3)
    .lean();
});

app.post("api/restaurants", function (req, res) {
  console.log(req.body);
});

app.put("/api/restaurants/:restaurantiId", async function (req, res) {
  let id = req.params.restaurantiId;
  console.log(`Query ${req.query}`);
  
  console.log(`request to update ${id}`);

  const restaurant = await restaurantModels.RestaurantModel.findById(id).exec();

  if (restaurant) {
    //await restaurantModels.RestaurantModel.deleteOne({ _id: id });
    res.send({ updated: "ABC restaurant" });
  } else {
    res.send({ error: "delete faile" });
  }
});

//TODO Check if user is the creator, then only delete is possible
app.delete("/api/restaurants/:restaurantiId", async function (req, res) {
  let id = req.params.restaurantiId;
  console.log(`request to delete ${id}`);

  const restaurant = await restaurantModels.RestaurantModel.findById(id).exec();

  if (restaurant) {
    await restaurantModels.RestaurantModel.deleteOne({ _id: id });
    res.send({ deleted: "ABC restaurant" });
  } else {
    res.send({ error: "delete faile" });
  }
});

//get all restaurant data from db
app.get("/api/restaurants/:id", async function (req, res) {
  if (!req.params.id) {
    //todo return 404
  }

  console.log(`${req.params.id}`);
  const restaurant = await restaurantModels.RestaurantModel.findById(
    req.params.id
  ).exec();

  if (restaurant) {
    //console.log(`${restaurant}`);
    //console.log(`Quering flickr ${Date.now()}`);
    const photos = await searchPhotos(restaurant.name);
    const thumb = console.log(
      `Downloading ${photos.length} images ${Date.now()}`
    );

    const thumbPath = await downloadRestaurantThumb(restaurant);

    await Promise.all(photos.map((item) => item.downloadPromise));

    //console.log(`Fetching  Completed, rendering hbs ${Date.now()}`);

    const isCallerCreator = isCreator(req, restaurant);
    
    const composedData = {
      name: `${restaurant.name}`,
      thumb: thumbPath,
      cuisine: restaurant.cuisine,
      avgGrade: `A`,
      address: `${restaurant.address.building}, ${restaurant.address.street}, ${restaurant.borough} ${restaurant.address.zipcode}`,
      shortDescription: restaurant.shortDescription,
      isCreator: true,
      photos: [
        photos.slice(0, photos.length / 2).map((item) => {
          return { path: item.localPath, delay: getRandomInt(10) };
        }),
        photos.slice(photos.length / 2, photos.length).map((item) => {
          return { path: item.localPath, delay: getRandomInt(10) };
        }),
      ],
    };

    console.log(
      `is new sesion ${req.session.isNew} ${JSON.stringify(req.session)}`
    );
    if (req.session.isNew) {
      const uuid = crypto.randomUUID();
      console.log(`new user created ${uuid}`);
      req.session.userToken = uuid;
    }
    req.session.isCreator = isCallerCreator;
    //console.log(composedData);

    //res.cookie('token', 'Ankit')
    res.render("flickr2", {
      layout: "main.hbs",
      data: composedData,
    });
  } else {
    //todo 404
  }
});


//app.use(`/.netlify/functions/api`, router);

const isCreator = (req, restaurant) => {
  console.log(
    `${req.session.userToken} ${restaurant.creatorId} ${
      req.session.userToken == restaurant.creatorId
    }`
  );
  return req.session.userToken == restaurant.creatorId;
};
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

app.listen(port);
console.log("App listening on port : " + port);
// module.exports = app;
// module.exports.handler = serverless(app);
