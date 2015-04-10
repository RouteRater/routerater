$(document).ready(function(){
	var pos = {'latitude':53.8019,'longitude':-1.5425,'zoom':13};
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
	}
	var icons = {};

	icons.basic = L.icon({iconUrl: 'icons/.png',shadowUrl: 'leaf-shadow.png',iconSize:[38, 95],shadowSize:[50, 64],iconAnchor:[22, 94],shadowAnchor: [4, 62],popupAnchor:  [-3, -76]});

	$.ajax({
		dataType: "jsonp",
		url: 'http://www.strudel.org.uk/cgi-bin/routerater.pl?latitude='+pos.latitude+'&longitude='+pos.longitude+'&verb=get',
		success: function(data){ addPoints(data); },
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
});