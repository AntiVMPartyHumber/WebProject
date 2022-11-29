var express = require("express");
const e = require("cors");
var mongoose = require("mongoose");
var database = require("./config/database");
var restaurantModels = require("./models/Restaurant");
require("dotenv").config();
var Flickr = require("flickr-sdk");
var flickr = new Flickr(process.env.FLICKR_KEY);
const fs = require("fs");
const axios = require("axios");

var app = express();
var path = require("path");
// pull information from HTML POST (express4)
var bodyParser = require("body-parser");

const hbs = require("express-handlebars");
app.use(express.static(path.join(__dirname, "public")));
app.engine(".hbs", hbs.engine({ extname: ".hbs" }));
app.set("view engine", "hbs");

var port = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({ extended: "true" })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: "application/vnd.api+json" })); // parse application/vnd.api+json as json

mongoose.connect(process.env.ATLAS_URL);

const getAllRestaurants = () => {
  return restaurantModels.RestaurantModel.find({}, "_id").limit(3).exec();
};

const searchPhotos = (name) => {
  return flickr.photos.search({
    text: name,
    // lat: 40.579505,
    // lon: -73.98241999999999,
    per_page: 24,
    ///accuracy: 1
  });
  // .then(function (res) {
  //   console.log("yay!", res.body);
  // })
  // .catch(function (err) {
  //   console.error("bonk", err);
  // });
};

/* ============================================================
  Function: Download Image
============================================================ */

const download_image = (url, image_path) => {
  return axios({
    url,
    responseType: "stream",
  }).then(
    (response) =>
      new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream(image_path))
          .on("finish", () => resolve())
          .on("error", (e) => reject(e));
      })
  );
};

const main = async () => {
  try {
    const res = await searchPhotos();
    console.log("yay!", res.body);
    res.body.photos.photo.forEach((photo) => {
      const url = `${process.env.FLICKR_IMAGE_DOMAIN}/${photo.server}/${photo.id}_${photo.secret}.jpg`;
      download_image(
        url,
        `public/images/flickr_downstream/${photo.server}_${photo.id}_${photo.secret}.jpg`
      );
      console.log(url);
    });
  } catch (error) {
    console.error(error);
  }
};

//main();

//get all restaurant data from db
app.get("/api/restaurants/:id", async function (req, res) {
  const restaurant = await restaurantModels.RestaurantModel.findById(
    req.params.id
  ).exec();
  console.log(`${restaurant}`);
  if (restaurant) {
    const flickrRes = await searchPhotos(restaurant.name);
    console.log(`Quering flickr ${Date.now()}`);
    const photos = [];
    flickrRes.body.photos.photo.forEach(async (photo) => {
      const url = `${process.env.FLICKR_IMAGE_DOMAIN}/${photo.server}/${photo.id}_${photo.secret}.jpg`;
      const localPath = `/images/flickr_downstream/${photo.server}_${photo.id}_${photo.secret}.jpg`;
      const downloadPromise = download_image(
        url,
        `public/images/flickr_downstream/${photo.server}_${photo.id}_${photo.secret}.jpg`
      );

      photos.push({ url, localPath, downloadPromise });
    });

    console.log(`Downloading ${photos.length} images ${Date.now()}`);
    await Promise.all(photos.map((item) => item.downloadPromise));

    console.log(`Fetching  Completed, rendering hbs ${Date.now()}`);

    const dd = {
      header: `${restaurant.name}`,
      photos: [
        photos.slice(0, photos.length / 2).map((item) => {
          return { path: item.localPath, delay: getRandomInt(30) };
        }),
        photos.slice(photos.length / 2, photos.length).map((item) => {
          return { path: item.localPath, delay: getRandomInt(30) };
        }),
      ],
    };

    console.log(dd);

    res.render("flickr", {
      layout: "main.hbs",
      data: dd,
    });
  }
});

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

app.listen(port);
console.log("App listening on port : " + port);
