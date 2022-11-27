//var express = require("express");
const e = require("cors");
var mongoose = require("mongoose");
var database = require("./config/database");
var restaurantModels = require("./models/Restaurant");
require("dotenv").config();

mongoose.connect(process.env.ATLAS_URL);

const getAllRestaurants = () => {
  return restaurantModels.RestaurantModel.find({}, '_id').limit(3).exec();
};

//const getRes


const main = async () => {
  try {
    const list = await getAllRestaurants();
    list.forEach((element) => {
      console.log(element);
    });
  } catch (error) {
    console.error(error);
  }
};

main();
