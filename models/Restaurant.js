/** @format */
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

// load mongoose since we need it to define a model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

ReviewSchema = new Schema({
  date: Date,
  grade: String,
  score: Number,
});

RestaurantSchema = new Schema({
  address: {
    building: String,
    coord: [Number],
    street: String,
    zipcode: String,
  },
  borough: String,
  cuisine: String,
  grades: [ReviewSchema],
  name: String,
  restaurant_id: String,
  thumbId: String,
  creatorId: String
});

var RestaurantModel = mongoose.model("Restaurant", RestaurantSchema);
var ReviewModel = mongoose.model("Review", ReviewSchema);

module.exports = { RestaurantModel, ReviewModel };
