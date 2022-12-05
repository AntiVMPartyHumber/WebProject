require("dotenv").config();

var axios = require("axios");
var FormData = require("form-data");
const fs = require("fs");

const uploadImage = async (path) => {
  var data = new FormData();
  //data.append('image', 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
  //data.append('image', fs.createReadStream(`${__dirname}/public/images/flickr_downstream/32_100751251_1a50a6418d.jpg`));
  console.log(`uploading file ${path}`);
  data.append("image", fs.createReadStream(`${path}`));

  var config = {
    method: "post",
    url: "https://api.imgur.com/3/image",
    headers: {
      "Accept-Encoding": "application/json",
      Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
      ...data.getHeaders(),
    },
    data: data,
  };

  return axios(config).then(function (response) {
    console.log(`Upload success ${response.data.data.link}`);
    return response.data.data.id;
  });
};

const createImgurUrl = (id) => {
  console.log(`https://i.imgur.com/${id}.jpg`)
  return `https://i.imgur.com/${id}.jpg`;
};

module.exports = { uploadImage, createImgurUrl };
