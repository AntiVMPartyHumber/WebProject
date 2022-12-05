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
