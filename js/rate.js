$(document).ready(function(){
	var pos = {'latitude':53.8019,'longitude':-1.5425,'zoom':17};
	var map;
	var layers = { 'base':{}, 'overlay':{} };
	var control;

	if(!mapdata) var mapdata = [];
	// create a map in the "map" div, set the view to a given place and zoom
	if(typeof L==="object"){
		// add an OpenStreetMap tile layer
		layers.base["Route rater"] = L.tileLayer('http://www.strudel.org.uk/routerater/tiles/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors & Route Rater',
			maxZoom: 17,
			errorTileUrl: 'missing.png'
		});
		layers.base["Gray-scale"] = L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>',
			id: 'examples.map-20v6611k',
			maxZoom: 17,
			errorTileUrl: 'missing.png'
		});
		
		map = L.map('main',{'layers':layers.base["Route rater"],'center':[pos.latitude, pos.longitude],'zoom':pos.zoom});
		control = L.control.layers(layers.base,layers.overlay);
		control.addTo(map);
		L.control.scale().addTo(map);
	}
	var icons = {};

	icons.basic = L.icon({iconUrl: 'icons/.png',shadowUrl: 'leaf-shadow.png',iconSize:[38, 95],shadowSize:[50, 64],iconAnchor:[22, 94],shadowAnchor: [4, 62],popupAnchor:  [-3, -76]});

	$.ajax({
		dataType: "jsonp",
		url: 'http://www.strudel.org.uk/cgi-bin/routerater.pl?latitude='+pos.latitude+'&longitude='+pos.longitude+'&verb=routes',
		success: function(data){
			if(data.routes) addRoutes(data.routes)
		},
		error: function(data){ console.log(data); }
	});

	function addPoints(data){
		layers.overlay.moments = new L.LayerGroup();
		
		// add markers with some popup content to it and open the popup
		for(var i = 0 ; i < data.moments.length ; i++){
			L.marker([data.moments[i].latitude, data.moments[i].longitude]).bindPopup(data.moments[i].type).addTo(layers.overlay.moments);
		}
		layers.overlay.moments.addTo(map);
		control.removeFrom(map);
		control = L.control.layers(layers.base,layers.overlay);
		control.addTo(map);
		
	}
	function onEachRoute(feature, layer) {
		// does this feature have a property named popupContent?
		if (feature.properties) {
			layer.bindPopup(feature.properties.name+': '+feature.properties.grade);
			console.log(feature,layer)
		}
	}
	function addRoutes(data){
		//layers.overlay.routes = new L.LayerGroup();
		console.log(data)
		L.geoJson(data, {
			style: function(feature) {
				switch (feature.properties.grade) {
					case 0: return {color: "#ffffff"};
					case 1:   return {color: "#2ba02c"};
					case 2:   return {color: "#3366dd"};
					case 3:   return {color: "#f04031"};
					case 4:   return {color: "#000000"};
				}
			},
			onEachFeature: onEachRoute
		}).addTo(map);
	}
});