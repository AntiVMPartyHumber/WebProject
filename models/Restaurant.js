// load mongoose since we need it to define a model
var mongoose = require("mongoose");
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
});

var RestaurantModel = mongoose.model("Restaurant", RestaurantSchema);
var ReviewModel = mongoose.model("Review", ReviewSchema);

module.exports = { RestaurantModel, ReviewModel };
