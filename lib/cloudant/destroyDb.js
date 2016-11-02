// deletes / drops the item database,
// accepts database name, dbname value from POST & GET
var path = "/cloudant/";
var paths = [path+"destroyDb",path+"deleteDb",path+"removeDb",path+"dropDb"];
var route = function(req, res) {
	var cloudant = req.app.get('cloudant');
	
	var name = req.query.tablename || req.body.tablename || req.query.dbname || req.body.dbname ||  req.query.name || req.body.name || "item";
	cloudant.db.destroy(name, function(err, data) {
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
