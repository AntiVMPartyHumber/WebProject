require("dotenv").config();
var Flickr = require("flickr-sdk");
const fs = require("fs");
const axios = require("axios");
const { createImgurUrl } = require("./imgur");
const { resolve } = require("path");
var flickr = new Flickr(process.env.FLICKR_KEY);

const searchPhotos = (name) => {
  return flickr.photos
    .search({
      text: name,
      // lat: 40.579505,
      // lon: -73.98241999999999,
      per_page: 24,
      ///accuracy: 1
    })
    .then((flickrRes) => {
      const photos = [];

      flickrRes.body.photos.photo.forEach(async (photo) => {
        const url = `${process.env.FLICKR_IMAGE_DOMAIN}/${photo.server}/${photo.id}_${photo.secret}.jpg`;
        const localPath = `/images/flickr_downstream/${photo.server}_${photo.id}_${photo.secret}.jpg`;
        const downloadPromise = downloadImageFromUrl(
          url,
          `public/images/flickr_downstream/${photo.server}_${photo.id}_${photo.secret}.jpg`
        );

        photos.push({ url, localPath, downloadPromise });
      });

      return photos;
    });
};

const downloadImageFromUrl = (url, image_path) => {
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

const downloadRestaurantThumb = async (restaurant) => {
  console.log(restaurant.thumbId)
  //restaurant.thumbId = "1LVwd6v";
  if (restaurant.thumbId) {
    const thumbPath = `/images/flickr_downstream/${restaurant._id}_${restaurant.thumbId}.jpg`;
    return downloadImageFromUrl(
      createImgurUrl(restaurant.thumbId),
      `public/${thumbPath}`
    ).then(() => {
      return thumbPath;
    });
  } else {
    return new Promise((resolve, reject) => {
      resolve("/static/restaurant_placeholder.png");
    });
  }
};

module.exports = { searchPhotos, downloadRestaurantThumb };
