$(document).ready(function(){
	if(!mapdata) var mapdata = [];
	// create a map in the "map" div, set the view to a given place and zoom
	if(typeof L==="object"){
		var map = L.map('main').setView([53.8019, -1.5425], 13);
		// add an OpenStreetMap tile layer
		L.tileLayer('http://www.strudel.org.uk/routerater/tiles/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors & Route Rater',
			maxZoom: 17,
			errorTileUrl: 'missing.png'
		}).addTo(map);

		// add markers with some popup content to it and open the popup
		for(var i = 0 ; i < mapdata.length ; i++){
			L.marker([mapdata[i].lat, mapdata[i].lon]).addTo(map).bindPopup(mapdata[i].title).openPopup();
		}
	}
	/*
	$('.place').each(function(i){
		if($(this).attr('data-lat') &&  $(this).attr('data-lon')){
			var lat = $(this).attr('data-lat').replace('N','');
			var lon = $(this).attr('data-lon').replace('E','');
			if(lat.indexOf('S') > 0) lat = '-'+lat.replace('S','')
			if(lon.indexOf('W') > 0) lon = '-'+lon.replace('W','')
			$(this).append('<a href="http://www.openstreetmap.org/?mlat='+lat+'&mlon='+lon+'&zoom=10" class="placelink" title="View in OpenStreetMap">&nbsp;</a>')
		}
	});
	*/
});