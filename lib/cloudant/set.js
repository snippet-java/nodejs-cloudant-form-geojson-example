//insert a default student row with the firstname John, lastname Doe & random student_id.
//accepts any key-value pair from POST & GET and assign to the doc as well.
var path = "/cloudant/";
var paths = [path+"set",path+"create",path+"insert",path+"add"];
var route = function(req, res) {
	var db = req.app.get('db');

	var id = req.query._id || req.query.id || req.body._id || req.body.id || "";
	var point = (req.query.point || req.body.point || "0,0").split(",");

	if (point.length != 2) point = [0,0];

	var doc = {
			_id : id,
			point : {
				"type" : "Point",
				"coordinates" : [parseFloat(point[0]), parseFloat(point[1])]
			},
			created : new Date().getTime(),
			updated : new Date().getTime()
	};

	for (var key in req.body) {
		if (key === "_id" || key === "id" || key === "point") continue;
		doc[key] = req.body[key]
	}
	for (var key in req.query) {
		if (key === "_id" || key === "id" || key === "point") continue;
		doc[key] = req.query[key]
	}
	db.insert(doc, function(err, data) {
		if (err) {
			res.json({err:err});
			return;
		}

		res.json({doc:doc,data:data});
	});
};

module.exports = {
		paths : paths,
		route : route
};
