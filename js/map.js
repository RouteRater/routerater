$(document).ready(function(){
	var pos = {'latitude':53.8019,'longitude':-1.5425,'zoom':13};

	if(!mapdata) var mapdata = [];
	// create a map in the "map" div, set the view to a given place and zoom
	if(typeof L==="object"){
		var map = L.map('main').setView([pos.latitude, pos.longitude], pos.zoom);
		// add an OpenStreetMap tile layer
		L.tileLayer('http://www.strudel.org.uk/routerater/tiles/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors & Route Rater',
			maxZoom: 17,
			errorTileUrl: 'missing.png'
		}).addTo(map);

	}

	$.ajax({
		dataType: "jsonp",
		url: 'http://www.strudel.org.uk/cgi-bin/routerater.pl?latitude='+pos.latitude+'&longitude='+pos.longitude+'&verb=get',
		success: function(data){ addPoints(data); },
		error: function(data){ console.log(data); }
	});

	function addPoints(data){
		// add markers with some popup content to it and open the popup
		for(var i = 0 ; i < data.moments.length ; i++){
			L.marker([data.moments[i].latitude, data.moments[i].longitude]).addTo(map).bindPopup(data.moments[i].type);//.openPopup();
		}
	}
});