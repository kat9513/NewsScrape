// Dependencies
var express = require("express");
var expressHandlebars = require("express-handlebars");
var mongoose = require("mongoose");
// scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

app.use(express.static("public"));

// Setup Handlebars
app.engine("handlebars", expressHandlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('views', (__dirname + '/public/views'));

app.use("/public", express.static(__dirname + "/public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsdb";

mongoose.connect(MONGODB_URI);

// Routes
//app.get("/", function (req, res) {
//    res.send("Hello world");
//});

app.get("/scrape", function (req, res) {
  axios.get("https://www.vox.com/").then(function (response) {
    var $ = cheerio.load(response.data);
    $("h2.c-entry-box--compact__title").each(function (i, element) {
      var result = {};
      //console.log(element);
      result.headline = $(this)
        .children("a")
        .text();
      result.url = $(this)
        .children("a")
        .attr("href");
      /*result.summary = $(this)
        .children("div.item-content")
        .children("p")
        .text();*/


      db.stories.create(result)
        .then(function (dbStories) {
          console.log(dbStories)
        })
        .catch(function (err) {
          console.log(err);
        });
    });
    res.send("Scrape Complete");
  })

})

app.get("/all", function (req, res) {
  db.stories.find({}, function (error, found) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(found);
    }
  })
})

app.get("/articles", function (req, res) {
  db.stories.find({}, function (error, found) {
    if (error) {
      console.log(error);
    }
    else {
      //res.json(found);
      var hbsObject = {
        stories: found
      };
      console.log(hbsObject);
      res.render("stories", hbsObject);
    };
  });
});

app.post("articles/:id", function(req, res) {
  db.comment.create(req.body)
    .then(function(dbComment) {
      return db.stories.findOneAndUpdate({ _id: req.params.id}, {comment: dbComment._id});
    })
    .then(function(dbStories) {
      res.json(dbStories);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/articles/:id", function(req, res){
  db.stories.findOne({_id: req.params.id})
    .populate("comment")
})




app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});

