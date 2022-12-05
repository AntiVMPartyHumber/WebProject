/**************************
*
* ITE5315 – Project
* I declare that this assignment is my own work in accordance with Humber Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Group member Name: Andreas Hartanto Student IDs: N01468650 Date: 5 Dec, 2022
* Group member Name: Ankitgiri Gusai Student IDs: N01494551 Date: 5 Dec, 2022
**************************
*/
require('dotenv').config()

const { ImgurClient } = require("imgur");
const fs = require("fs");
const client = new ImgurClient({
  clientId: process.env.IMGUR_CLIENT_ID,
  clientSecret: process.env.IMGUR_SECRET,
});
// upload multiple images via fs.createReadStream (node)

const test = async () => {
    console.log(`${process.env.IMGUR_CLIENT_ID} ${process.env.CLIENT_SECRET}`)
  const response = await client.upload({
    image: fs.createReadStream(
      `${__dirname}/public/images/flickr_downstream/32_100751251_1a50a6418d.jpg`
    ),
    type: "stream",
    title: "Meme",
    description: "Dank Meme",
  });
  console.log(response.data.data.link);
};

test();


