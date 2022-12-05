/** @format */

var express = require("express");
var mongoose = require("mongoose");
var cors = require("cors");
var app = express();
var database = require("./config/database");
var bodyParser = require("body-parser");
var path = require("path");
var cookieSession = require("cookie-session");
const crypto = require("crypto");
const multer = require("multer");

//const router = express.Router();
//const serverless = require("serverless-http");
const { uploadImage } = require("./imgur");

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

var { RestaurantModel } = require("./models/Restaurant");
var { ReviewModel } = require("./models/Restaurant");

app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SECRETKEY],
    // Cookie Options
    maxAge: 365 * 24 * 60 * 60 * 1000, // 24 hours
  })
);

const storage = multer.diskStorage({
  destination: "./public/images/imagur_upstream",
  filename: function (req, file, cb) {
    // we write the filename as the current date down to the millisecond
    // in a large web service this would possibly cause a problem if two people
    // uploaded an image at the exact same time. A better way would be to use GUID's for filenames.
    // this is a simple example.
    console.log(`filename : ${Date.now() + path.extname(file.originalname)}`)
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });
//get all restaurant data from db
app.get("/api/restaurants", async function (req, res) {
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
    res.render("restaurant", {
      layout: "main.hbs",
      data: restaurants,
    });
  })
    .skip(page * perPage)
    .limit(perPage)
    .lean();
});

//using form to populate page,perpage,borough
app
  .route("/api/search")
  .get((req, res) => {
    res.render("restaurantseach", {
      layout: "main.hbs",
    });
  })
  .post((req, res) => {
    let page = req.body.page;
    let perPage = req.body.perPage;
    let borough = req.body.borough;

    RestaurantModel.find(function (err, restaurants) {
      if (err) res.send(err);
      res.render("restaurant", {
        layout: "main.hbs",
        data: restaurants,
      });
    })
      .skip(page * perPage)
      .limit(perPage)
      .lean();
  });

app.post("/api/restaurants", upload.single("photo"), async function (req, res) {
  console.log(req.body);
  if (!req.body) {
    res.sendStatus(400);
    res.json({ message: "There is no data inputed" });
  } else {
    const thumbId = await uploadImage(req.file.path)
    console.log(`thumb uplaoded ${thumbId}`)

    await RestaurantModel.create({
      address: {
        building: req.body.building,
        coord: [req.body.coordx, req.body.coordy],
        street: req.query.street,
        zipcode: req.query.zipcode,
      },
      borough: req.body.borough,
      cuisine: req.body.cuisine,
      grades: [
        {
          date: req.body.date,
          grade: req.body.grade,
          score: req.body.score,
        },
      ],
      name: req.body.name,
      restaurant_id: req.body.restaurant_id,
      thumbId: thumbId
    }),
      function (err, addedRestaurant) {
        if (err) res.send(err);

        console.log(`${addedRestaurant.name}` + "has been added");
        RestaurantModel.findById(
          addedRestaurant.name,
          function (err, restaurant) {
            if (err) res.send(err);

            res.render("restaurant", {
              layout: "main.hbs",
              data: restaurant,
            });
          }
        )
          .skip(1)
          .limit(1)
          .lean();
      };
  }
});

//put  restaurant based on the _id number
app.put("/api/restaurants/:restaurantId", function (req, res) {
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

    res.send("Successfully updated restaurants - " + restaurant.name);
  });
});

//Put from restaurant detailswebpage
// app.put("/api/restaurants/:restaurantiId", async function (req, res) {
//   let id = req.params.restaurantiId;
//   console.log(`Query ${req.query}`);

//   console.log(`request to update ${id}`);

//   const restaurant = await restaurantModels.RestaurantModel.findById(id).exec();

//   if (restaurant) {
//     res.send({ updated: "ABC restaurant" });
//   } else {
//     res.send({ error: "delete faile" });
//   }
// });

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
      isCreator: isCallerCreator,
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
