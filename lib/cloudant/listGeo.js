// list out all the documents header & bodies in the student database
var path = "/cloudant/";
var paths = [path+"listgeo",path+"listGeo",path+"geojson"];
var route = function(req, res) {
	var db = req.app.get('db');
	
	db.list({include_docs:true}, function(err, data) {
		if (err) {
			res.json({err:err});
			return;
		}
		
		var features = [];
		for (var i in data.rows) {
			var doc = data.rows[i].doc;
			var id = doc._id || doc.id;
			var name = doc.name || "";
			var description = doc.description || "";
			var point = doc.point || {};
			var updated = doc.updated || 0;
			features.push(createFeature(id, name, description, point, updated));
		}

		var json = {
			type: "FeatureCollection",
			features : features,
			metadata: {
				generated: new Date().getTime(),
//				url: "http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
//				title: "USGS All Earthquakes, Past Day",
				status: 200,
//				api: "1.5.2",
				count: features.length
			},
		};
		
		console.log(json);
		
		res.json(json);
	});
};

function createFeature(id, name, description, point, updated) {
	var feature = {
			type: "Feature",
			properties: {
				//mag: 4.8,
				//place: "115km E of Neiafu, Tonga",
				//time: 1478077330600,
				updated: updated,
				//tz: -720,
				//url: "http://earthquake.usgs.gov/earthquakes/eventpage/us100073ns",
				//detail: "http://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/us100073ns.geojson",
				//felt: null,
				//cdi: null,
				//mmi: null,
				//alert: null,
				//status: "reviewed",
				//tsunami: 0,
				//sig: 354,
				//net: "us",
				//code: "100073ns",
				//ids: ",us100073ns,",
				//sources: ",us,",
				//types: ",cap,geoserve,origin,phase-data,",
				//nst: null,
				//dmin: 2.839,
				//rms: 0.61,
				//gap: 99,
				//magType: "mb",
				//type: "earthquake",
				title: name
		},
		geometry: point
//		id: "us100073ns"
	};
	return feature;
}

module.exports = {
		paths : paths,
		route : route
};
