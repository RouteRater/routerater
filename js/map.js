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
		layers.base["Route rater calm"] = L.tileLayer('http://www.strudel.org.uk/routerater/oldtiles/{z}/{x}/{y}.png', {
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>',
			id: 'examples.map-20v6611k',
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
		
		map = L.map('main',{'layers':layers.base["Route rater calm"],'center':[pos.latitude, pos.longitude],'zoom':pos.zoom});
		control = L.control.layers(layers.base,layers.overlay);
		control.addTo(map);
		L.control.scale().addTo(map);
	}
	var icons = {};
	var categories = ['obstructions','cycleways','bikeshops','potholes','signs','congestion','destinations','steps','unevenroad','cafe','junction','lighting','pub','incident']
	var ratings = ['happy','neutral','sad'];
	
	for(var i = 0; i < categories.length; i++){
		icons[categories[i]] = L.icon({iconUrl: 'images/icon_'+categories[i]+'.png',shadowUrl: 'images/icon_shadow.png',iconSize:[32, 32],shadowSize:[40, 40],iconAnchor:[16, 16],shadowAnchor: [18, 14],popupAnchor:  [0, -16]});
		for(var j = 0; j < ratings.length; j++){
			icons[categories[i]+"_"+ratings[j]] = L.icon({iconUrl: 'images/icon_'+categories[i]+'_'+ratings[j]+'.png',shadowUrl: 'images/icon_shadow.png',iconSize:[32, 32],shadowSize:[40, 40],iconAnchor:[16, 16],shadowAnchor: [18, 14],popupAnchor:  [0, -16]});
		}
	}

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
			L.marker([data.moments[i].latitude, data.moments[i].longitude],{icon:icons[data.moments[i].type+(data.moments[i].rating ? "_"+data.moments[i].rating : "")]}).bindPopup(data.moments[i].type).addTo(layers.overlay.moments);
		}
		layers.overlay.moments.addTo(map);
		control.removeFrom(map);
		control = L.control.layers(layers.base,layers.overlay);
		control.addTo(map);
		
	}
});