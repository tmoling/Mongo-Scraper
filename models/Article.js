var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
var ArticleSchema = new Schema({

    // `title` and link are required and of type String
  title: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },

  //hmmmm, this won't show up like I want it to...check on it
  summary: {
    type: String,
    required: true
  },

  //allows to populate article with comments
  comments: [{
    type: Schema.Types.ObjectId,
    ref: "Comment"
  }]
});

// This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;