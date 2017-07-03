// list out all the documents header & bodies in the student database
var path = "/cloudant/";
var paths = [path+"list"];
var route = function(req, res) {
	var db = req.app.get('db');
	
	db.list({include_docs:true}, function(err, data) {
		if (err) {
			res.json({err:err});
			return;
		}
		
		res.json({data:data});
	});
};

module.exports = {
		paths : paths,
		route : route
};