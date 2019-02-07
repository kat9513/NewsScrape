var express = require("express");
var expressHandlebars = require("express-handlebars");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var PORT = process.env.PORT || 3000;

//var db = require("./models");

var app = express();

app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

app.get("/", function (req, res) {
    res.send("Hello world");
});

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });