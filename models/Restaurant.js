// load mongoose since we need it to define a model
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
RestaurantSchema = new Schema({});
module.exports = mongoose.model("Restaurant", RestaurantSchema);
