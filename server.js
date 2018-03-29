// var express = require("express");
// var bodyParser = require("body-parser");
// var logger = require("morgan");
// var mongoose = require("mongoose");

// // Our scraping tools
// // Axios is a promised-based http library, similar to jQuery's Ajax method
// // It works on the client and on the server
// var axios = require("axios");
// var cheerio = require("cheerio");

// // Require all models
// var db = require("./models");

// var PORT = 3000;

// // Initialize Express
// var app = express();

// // Configure middleware

// // Use morgan logger for logging requests
// app.use(logger("dev"));
// // Use body-parser for handling form submissions
// app.use(bodyParser.urlencoded({ extended: false }));
// // Use express.static to serve the public folder as a static directory
// app.use(express.static("public"));

// // Set mongoose to leverage built in JavaScript ES6 Promises
// // Connect to the Mongo DB
// mongoose.Promise = Promise;
// mongoose.connect("mongodb://localhost/week18Populater", {
//   useMongoClient: true
// });

// // Routes

// // A GET route for scraping the echojs website
// app.get("/scrape", function(req, res) {
//   // First, we grab the body of the html with request
//   axios.get("http://www.abcnews.go.com/").then(function(response) {
//     // Then, we load that into cheerio and save it to $ for a shorthand selector
//     var $ = cheerio.load(response.data);

//     // Now, we grab every h2 within an article tag, and do the following:
//     $("article h1").each(function(i, element) {
//       // Save an empty result object
//       var result = {};

//       // Add the text and href of every link, and save them as properties of the result object
//       result.title = $(this)
//         .children("a")
//         .text();
//       result.link = $(this)
//         .children("a")
//         .attr("href");

//       // Create a new Article using the `result` object built from scraping
//       db.Article
//         .create(result)
//         .then(function(dbArticle) {
//           // If we were able to successfully scrape and save an Article, send a message to the client
//           res.send("Scrape Complete");
//         })
//         .catch(function(err) {
//           // If an error occurred, send it to the client
//           res.json(err);
//         });
//     });
//   });
// });

// // Route for getting all Articles from the db
// app.get("/articles", function(req, res) {
//   // Grab every document in the Articles collection
//   db.Article
//     .find({})
//     .then(function(dbArticle) {
//       console.log('result:', dbArticle)
//       // If we were able to successfully find Articles, send them back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });

// // Route for grabbing a specific Article by id, populate it with it's note
// app.get("/articles/:id", function(req, res) {
//   // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
//   db.Article
//     .findOne({ _id: req.params.id })
//     // ..and populate all of the notes associated with it
//     .populate("note")
//     .then(function(dbArticle) {
//       // If we were able to successfully find an Article with the given id, send it back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });

// // Route for saving/updating an Article's associated Note
// app.post("/articles/:id", function(req, res) {
//   console.log(req)

//   // Create a new note and pass the req.body to the entry
//   db.Note
//     .create(req.body) // { title: 'my not, body: 'my note'}
//     .then(function(dbNote) {
//       // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
//       // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
//       // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
//       return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
//     })
//     .then(function(dbArticle) {
//       // If we were able to successfully update an Article, send it back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });

// // Start the server
// app.listen(PORT, function() {
//   console.log("App running on port " + PORT + "!");
// });

// dependencies
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
// Notice: Our scraping tools are prepared, too
var request = require('request'); 
var cheerio = require('cheerio');

// use morgan and bodyparser with our app
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));

// make public a static dir
app.use(express.static('public'));


// Database configuration with mongoose
mongoose.connect('mongodb://localhost/news_scraper');
var db = mongoose.connection;

// show any mongoose errors
db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

// once logged in to the db through mongoose, log a success message
db.once('open', function() {
  console.log('Mongoose connection successful.');
});


// And we bring in our comment and Article models
//var Comment = require('./models/Comment.js');
var Article = require('./models/Article.js');


// Routes
// ======

// Simple index route
app.get('/', function(req, res) {
  res.send(index.html);
});

// A GET request to scrape the echojs website.
app.get('/scrape', function(req, res) {
  // first, we grab the body of the html with request
  request('http://abcnews.go.com/', function(error, response, html) {
    // then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // now, we grab every h2 within an article tag, and do the following:
    $("article h1").each(function(i, element) {

        // save an empty result object
        var result = {};

        // add the text and href of every link, 
        // and save them as properties of the result obj
        result.title = $(this).children('a').text();
        result.link = $(this).children('a').attr("href");
        // using our Article model, create a new entry.
        // Notice the (result):
        // This effectively passes the result object to the entry (and the title and link)
        var entry = new Article (result);

        // now, save that entry to the db
        entry.save(function(err, doc) {
          // log any errors
          if (err) {
            console.log(err);
          } 
          // or log the doc
          else {
            console.log(doc);
          }
        });


    });
  });
  // tell the browser that we finished scraping the text.
  res.send("Scrape Complete");
});

// this will get the articles we scraped from the mongoDB
app.get('/articles', function(req, res){
  // grab every doc in the Articles array
  Article.find({}, function(err, doc){
    // log any errors
    if (err){
      console.log(err);
    }
    // or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// grab an article by it's ObjectId
app.get('/articles/:id', function(req, res){
  // using the id passed in the id parameter, 
  // prepare a query that finds the matching one in our db...
  Article.findOne({'_id': req.params.id})
  // and populate all of the comments associated with it.
  .populate('comment')
  // now, execute our query
  .exec(function(err, doc){
    // log any errors
    if (err){
      console.log(err);
    }
    // otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});


// replace the existing comment of an article with a new one
// or if no comment exists for an article, make the posted comment it's comment.
app.post('/articles/:id', function(req, res){
  // create a new comment and pass the req.body to the entry.
  var newComment = new Comment(req.body);

  // and save the new comment the db
  newComment.save(function(err, doc){
    // log any errors
    if(err){
      console.log(err);
    }
    // otherwise
    else {
      // using the Article id passed in the id parameter of our url, 
      // prepare a query that finds the matching Article in our db
      // and update it to make it's lone comment the one we just saved
      Article.findOneAndUpdate({'_id': req.params.id}, {'comment':doc._id})
      // execute the above query
      .exec(function(err, doc){
        // log any errors
        if (err){
          console.log(err);
        } else {
          // or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});
// listen on port 3000
app.listen(3000, function() {
  console.log('App running on port 3000!');
});
