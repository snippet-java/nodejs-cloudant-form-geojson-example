// updates a student document based on the id with a random studentId.
// if id / _id does not exist, create new doc.
// accepts any key-value pair from POST & GET and assign to the doc as well.
var path = "/cloudant/";
var paths = [path+"update"];
var route = function(req, res) {
	var db = req.app.get('db');
	
	var id = req.query._id || req.query.id || req.body._id || req.body.id || "";
	var point = (req.query.point || req.body.point || "0,0").split(",");

	if (point.length != 2) point = [0,0];
	
	var isNew = false;
	if (id != "") {
		db.get(id, function(err, data) {
			if (err) {
				if (err.statusCode == 404) {
					isNew = true;
				} else {
					res.json({err:err});
					return;
				}
			}

			var old_doc = {};
			var doc = {};
			if (isNew) {
				doc._id = id;
			} else {
				old_doc = data;
				doc = data;
			}

			doc.updated = new Date().getTime();
			doc.point = {
				"type" : "Point",
				"coordinates" : [point[0], point[1]]
			}

			for (var key in req.body) {
				if (key === "_id" || key === "id" || key === "point") continue;
				doc[key] = req.body[key];
			}
			for (var key in req.query) {
				if (key === "_id" || key === "id" || key === "point") continue;
				doc[key] = req.query[key];
			}
			
			// use insert to modify existing doc by id, if there's any,
			// otherwise it'll create new doc
			db.insert(doc, function(err, data) {
				if (err) {
					res.json({err:err});
					return;
				}
	
				res.json({old_doc:old_doc,doc:doc,data:data});
			});
		});
	} else {
		res.json({err:"Please specify an id or _id to update"});
	}
};

module.exports = {
		paths : paths,
		route : route
};
