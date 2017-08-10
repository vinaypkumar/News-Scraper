var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var cheerio = require("cheerio");
var request = require("request");

var logger = require("morgan");

var Article = require("./models/Article.js");
var Comment = require("./models/Comment.js");

var app = express();

mongoose.Promise = Promise;

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost/newsscraper");
var db = mongoose.connection;

db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connection successful!");
});

app.get("/scrape", function(req, res) {
  
  request("https://www.nytimes.com/section/health?action=click&contentCollection=science&module=collectionsnav&pagetype=sectionfront&pgtype=sectionfront&region=navbar", function(error, response, html) {
    
    var $ = cheerio.load(html);
    
    $("h2.headline").each(function(i, element) {

      console.log("Begin scrape.");

      var result = {};      
      result.title = ($(element).text()).trim();
      result.link = $(this).parent().parent().attr("href");      
      var newArticle = new Article(result);

      console.log("Behold: "+newArticle);
      
      newArticle.save(function(err, doc) {
        
        if (err) {
          console.log(err);
        }
        
        else {        	
          console.log(doc);
        }

      });

    });
  });
  
  res.send("Scrape finished.");
});

app.get("/articles", function(req, res) {  
  Article.find({}, function(error, doc) {
    
    if (error) {
      console.log(error);
    }
    
    else {
      res.json(doc);
    }
  });
});

app.get("/articles/:id", function(req, res) {  
	Article.findOne({ "_id": req.params.id }).populate("comment").exec(function(error, doc) {
    
    if (error) {
      console.log(error);
    }
    
    else {
      res.json(doc);
    }
  });
  
});

app.post("/articles/:id", function(req, res) {

	var newComment=new Comment(req.body);

	newComment.save(function(error, doc){
		if(error){
			console.log(error);
		}
		else{
			Article.findOneAndUpdate({"_id": req.params.id}, {"comment": doc._id}).exec(function(err, doc){
				if(err){
					console.log(err);
				}
				else{
					res.send(doc);
				}
			});
		}

	});

});

app.listen(3000, function() {
  console.log("App running on port 3000!");
});



