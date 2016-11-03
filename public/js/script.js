var map;

$(function() {
	loadList(true);
	loadMap();
	$("#submit").click(addItem);
	$("#list").on("click", "li .glyphicon-trash", deleteItem);
	$("#list").on("click", "li .id", populateForm);
})

function loadList(first) {
	$.get("/cloudant/list")
	.done(function(data) {
		if (first && data.err && data.err.errid == "non_200") {
			$.get("/cloudant/createDb").done(loadList);
		} else if (data.data) {
			for (var i in data.data.rows) {
				var doc = data.data.rows[i].doc;
	
				var id = doc._id || doc.id || "";
				var name = doc.name || "";
				var description = doc.description || "";
				var point = doc.point || {};
	
				createListItem(id, name, description, point);
			}
		}
	})
}


function createListItem(id, name, description, point) {
	var $target = $("#list li[doc_id='"+id+"']");
	if ($target.length > 0) {
		$target.find(".id").text(id);
		$target.find(".name").text(name);
		$target.find(".description").text(description);
		if (typeof point === "object") {
			point = parseFloat(point.coordinates[0]).toFixed(4) + "," + parseFloat(point.coordinates[1]).toFixed(4);
		}
		$target.find(".point").text(point);
		return 0;
	} else {
		var $list	= $("#template .list");
		
		var $clone	= $list.clone();
		$clone.find(".id").text(id);
		$clone.find(".name").text(name);
		$clone.find(".description").text(description);
		if (typeof point === "object") {
			point = point.coordinates[0] + "," + point.coordinates[1]
		}
		$clone.find(".point").text(point);
		$clone.attr("doc_id", id);
		$("#list").append($clone);
		return 1;
	}
}

function populateForm() {
	$listItem		= $(this).parents(".list-group-item");
	var id			= $listItem.find(".id").text();
	var name		= $listItem.find(".name").text();
	var description	= $listItem.find(".description").text();
	var point		= $listItem.find(".point").text();

	$("#_id").val(id);
	$("#_name").val(name);
	$("#_description").val(description);
	$("#_point").val(point);
}

function addItem() {
	var point = $("#_point").val();
	var id = $("#_id").val();
	var name = $("#_name").val();
	var description = $("#_description").val();
	
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
		
		$("#_point").val("");
		$("#_id").val("");
		$("#_name").val("");
		$("#_description").val("");
	})
}

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

function removeFeature(id) {
	var feature = map.data.getFeatureById(id);
	if (feature)
		map.data.remove(feature);
}
