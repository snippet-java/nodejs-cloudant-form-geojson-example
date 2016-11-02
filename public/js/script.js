$(function() {
	loadList();
	$("#submit").click(addItem);
	$("#list").on("click", "li .glyphicon-trash", deleteItem);
	$("#list").on("click", "li .id", populateForm);
})

function loadList() {
	$.get("/cloudant/list")
	.done(function(data) {
		for (var i in data.data.rows) {
			var doc = data.data.rows[i].doc;

			var id = doc._id || doc.id || "";
			var name = doc.name || "";
			var description = doc.description || "";
			var point = doc.point || {};

			createListItem(id, name, description, point);
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
			point = point.coordinates[0] + "," + point.coordinates[1]
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
		if (result)
			alert("item " + id + " added!");
		else
			alert("item " + id + " updated!");
	})
}


function deleteItem() {
	var id = $(this).parents(".list-group-item").attr("doc_id");
	console.log(id);
	$.get("/cloudant/destroy?id=" + id)
	.done(function(data) {
		var $target = $("#list li[doc_id='"+id+"']");
		$target.hide('slow', function(){ 
			$target.remove();
			alert("item " + id + " removed!");
		});
	})
}