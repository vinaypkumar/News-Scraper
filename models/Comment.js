var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CommentSchema=new Schema({

	title: {
		type: String
		//required: true
	},
	message: {
		type: String
		//required: true
	}
});

var Comment = mongoose.model("Comment", CommentSchema);
module.exports = Comment;