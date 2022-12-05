var mongoose = require("mongoose");
var database = require("../config/database");

async function initialize() {
    console.log("connection string...");
    const client = await mongoose
        .connect(database.url, {
            useNewUrlParser: true,
        })

        .catch((err) => {
            console.log(err);
        });

    if (!client) return;

    try {
        const dbase = client.db("sample_restaurants");
        const res = await dbase.collection("restaurants");
        console.log("Connection established", dbase, res);
    } catch (err) {
        console.log(err);
    } finally {
        console.log("Connected");
    }
}

async function addNewRestaurant(data) { }

async function getAllRestaurants(page, perPage, borough) { }

async function getRestaurantById(Id) { }

async function updateRestaurantById(data, Id) { }

async function deleteRestaurantById(Id) { }

module.exports = {
    initialize,
    addNewRestaurant,
    getAllRestaurants,
    getRestaurantById,
    updateRestaurantById,
    deleteRestaurantById,
};
