var createDb	= require('./createDb.js');
var set			= require('./set.js');
var list		= require('./list.js');
var listGeo		= require('./listGeo.js');
var get			= require('./get.js');
var update		= require('./update.js');
var destroy		= require('./destroy.js');
var destroyDb	= require('./destroyDb.js');

var exports = {
	createDb	: createDb,
	set			: set,
	list		: list,
	listGeo		: listGeo,
	get			: get,
	update		: update,
	destroy		: destroy,
	destroyDb	: destroyDb
}

module.exports = exports;
