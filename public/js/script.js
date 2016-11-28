// declare map on global
var map;

$(function() {
	// load item list
	loadList(true);
	
	// initialize map
	loadMap();
	
	// Buttons click action
	$("#submit").click(addItem);
	$("#clear").click(clearForm);
	
	// List item click action
	$("#list").on("click", "li .glyphicon-trash", deleteItem);
	$("#list").on("click", "li .id", populateForm);
})

// load item list
function loadList(first) {
	// get from /list API
	$.get("/cloudant/list")
	.done(function(data) {
		// if database does not exist, create database
		if (first && data.err && data.err.errid == "non_200") {
			$.get("/cloudant/createDb").done(loadList);
		} else if (data.data) {
			// populate list on page
			for (var i in data.data.rows) {
				var doc 		= data.data.rows[i].doc;
	
				var id			= doc._id || doc.id || "";
				var name		= doc.name || "";
				var description	= doc.description || "";
				var point		= doc.point || {};
	
				createListItem(id, name, description, point);
			}
		}
	})
}

// append item to list
function createListItem(id, name, description, point) {
	var $target = $("#list li[doc_id='"+id+"']");
	// if item id exists, update on the same list item
	if ($target.length > 0) {
		$target.find(".id").text(id);
		$target.find(".name").text(name);
		$target.find(".description").text(description);
		if (typeof point === "object") {
			point = parseFloat(point.coordinates[0]) + "," + parseFloat(point.coordinates[1]);
		}
		$target.find(".point").text(point);
		return 0;
	} 
	// create new item and append to list
	else {
		var $list	= $("#template .list");
		
		var $clone	= $list.clone();
		$clone.find(".id").text(id);
		$clone.find(".name").text(name);
		$clone.find(".description").text(description);
		if (typeof point === "object") {
			point = parseFloat(point.coordinates[0]) + "," + parseFloat(point.coordinates[1]);
		}
		$clone.find(".point").text(point);
		$clone.attr("doc_id", id);
		$("#list").append($clone);
		return 1;
	}
}

// populate the form on item click with existing values
function populateForm() {
	$listItem		= $(this).parents(".list-group-item");
	var id			= $listItem.find(".id").text();
	var name		= $listItem.find(".name").text();
	var description	= $listItem.find(".description").text();
	var point		= $listItem.find(".point").text();

	if (id == "ID") return;
	
	$("#_id").val(id);
	$("#_name").val(name);
	$("#_description").val(description);
	$("#_point").val(point);
}

// clear the form to enter new values
function clearForm() {
	$("#_point").val("");
	$("#_id").val("");
	$("#_name").val("");
	$("#_description").val("");
}

// add item using /update API
function addItem() {
	var point		= $("#_point").val();
	var id			= $("#_id").val();
	var name		= $("#_name").val();
	var description	= $("#_description").val();
	
	$.get("/cloudant/update?id=" + id + "&name=" + name + "&description=" + description + "&point=" + point)
	.done(function(data) {
		var result = createListItem(id, name, description, point);
		if (result) {
			alert("item " + id + " added!");
			addFeature(id, name, point);
		} else {
			alert("item " + id + " updated!");
			updateFeature(id, name, point);
		}
		
		clearForm();
	})
}


// delete item using /destroy API
function deleteItem() {
	var id = $(this).parents(".list-group-item").attr("doc_id");

	$.get("/cloudant/destroy?id=" + id)
	.done(function(data) {
		var $target = $("#list li[doc_id='"+id+"']");
		$target.hide('slow', function(){ 
			$target.remove();
			removeFeature(id)
			alert("item " + id + " removed!");
		});
	})
}

//== Map functions =======================================================//

// map initialization
function loadMap() {
	var mapOptions = {
			center: new google.maps.LatLng(0,0),
			zoom: 5
	};
	map = new google.maps.Map(document.getElementById("map"), mapOptions);
	google.maps.event.addListener(map.data, 'addfeature', focusMap);
	google.maps.event.addListener(map.data, 'removefeature', focusMap);
	map.data.loadGeoJson('cloudant/geojson', focusMap);
	map.data.setStyle(function(feature) {
		if (feature.getProperty('title'))
			return {title: feature.getProperty('title')};
		return {};
	});
}

// refocus map on item add or remove
function focusMap() {
	console.log("Focussing map");
	map.setCenter({lat:0,lng:0});
	var bounds = new google.maps.LatLngBounds();
	map.data.forEach(function(feature) {
		feature.getGeometry().forEachLatLng(function(latlng) {
			bounds.extend(latlng);
			map.fitBounds(bounds);			
		})
	});
}

// add item (feature) to map
function addFeature(id, name, point) {
	var featureOptions = {
			id : id,
			properties : {
				updated : new Date().getTime(),
				title : name
			},
			geometry : {lat: parseFloat(point.split(",")[1]), lng: parseFloat(point.split(",")[0])}
	};
	map.data.add(featureOptions);
}

// update item (feature) on map
function updateFeature(id, name, point) {
	var feature = map.data.getFeatureById(id)
	if (feature) {
		feature.setGeometry({lat: parseFloat(point.split(",")[1]), lng: parseFloat(point.split(",")[0])});
		feature.setProperty("updated", new Date().getTime());
		feature.setProperty("title", name);
	} else {
		addFeature(id, name, point);
	}
}

// remove item (feature) from map
function removeFeature(id) {
	var feature = map.data.getFeatureById(id);
	if (feature)
		map.data.remove(feature);
}
