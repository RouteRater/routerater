var map;

$(document).ready(function(){

	var pos = {'latitude':53.79664602206642,'longitude':-1.5338534116744995,'zoom':17};
	var layers = { 'base':{}, 'overlay':{} };
	var control;
	var green = { color: "#2ba02c" };
	var blue = { color: "#3366dd" };
	var red = { color: "#f04031" };
	var black = { color: "#000000" };
	var white = { color: "#ffffff" };
	var defaultStyle = {
		weight: 8,
		opacity: 0.1,
	};
	var highlightStyle = {
		weight: 8,
		opacity: 1,
	};
	var icons = {};
	var bounds;
	var selectedLayer;
	var linesFeatureLayer;
	var marker;
	var routes = [];
	var moment = L.latLng(53.796405214684256,-1.5352481603622437);

	if(!mapdata) var mapdata = [];
	// create a map in the "map" div, set the view to a given place and zoom
	if(typeof L==="object"){
		// add an OpenStreetMap tile layer
		layers.base["Route rater"] = L.tileLayer('http://www.strudel.org.uk/routerater/tiles/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors & Route Rater',
			maxZoom: 17,
			minZoom: 16,
			errorTileUrl: 'missing.png'
		});
		layers.base["Gray-scale"] = L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery &copy; <a href="http://mapbox.com">Mapbox</a>',
			id: 'examples.map-20v6611k',
			maxZoom: 17,
			minZoom: 16,
			errorTileUrl: 'missing.png'
		});
		
		map = L.map('main',{'layers':layers.base["Route rater"],'center':[pos.latitude, pos.longitude],'zoom':pos.zoom});
		control = L.control.layers(layers.base,layers.overlay);
		control.addTo(map);
		L.control.scale().addTo(map);
	}

	icons.basic = L.icon({iconUrl: 'icons/.png',shadowUrl: 'leaf-shadow.png',iconSize:[38, 95],shadowSize:[50, 64],iconAnchor:[22, 94],shadowAnchor: [4, 62],popupAnchor:  [-3, -76]});

	map.on('moveend',function(e){
		console.log('end move',map.getBounds())
		getRoads();
	}).on('click',function(e){
		console.log('click',e,e.latlng,linesFeatureLayer);
	})
	
	function getRoads(callback){
		bounds = map.getBounds();
		console.log('latmx='+bounds._northEast.lat+'&latmn='+bounds._southWest.lat+'&lonmx='+bounds._northEast.lng+'&lonmn='+bounds._southWest.lng+'')
		$.ajax({
			dataType: "jsonp",
			url: 'http://www.strudel.org.uk/cgi-bin/routerater.pl?latmx='+bounds._northEast.lat+'&latmn='+bounds._southWest.lat+'&lonmx='+bounds._northEast.lng+'&lonmn='+bounds._southWest.lng+'&latitude='+pos.latitude+'&longitude='+pos.longitude+'&verb=routes',
			success: function(data){
				if(data.routes) addRoutes(data.routes)
				if(typeof callback==="function") callback.call();
			},
			error: function(data){ console.log(data); }
		});
	}

	// Init with roads for current location
	getRoads(function(){
		// On the initial call we will try to find the nearest road to our point
		marker = L.marker(moment).addTo(map);
		// Do we have the line layer?
		if(linesFeatureLayer){
			// Find the nearest graded path within 20 pixels
			var nearest = L.GeometryUtil.closestLayerSnap(map, linesFeatureLayer.getLayers(), moment, 20, true);
			if(nearest){
				// Set the style of the line
				//nearest.layer.setStyle(highlightStyle);
				// Call the function to select this line
				nearest.layer.selectLine();
			}
		}
	});
/*	
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
*/	
	function onEachRoute(feature, layer){

		// Load the default style. 
		layer.setStyle(defaultStyle);

		// Create a self-invoking function that passes in the layer
		// and the properties associated with this particular record.
		(function(layer, properties) {

			var style = defaultStyle;
			var prevlayer;
			
			// Create a special function to select/deselect this road
			layer.selectLine = function(){

				prevlayer = selectedLayer;
				
				// Remove existing HTML
				$('#below').html('')

				if(!selectedLayer || selectedLayer!=layer){

					style = highlightStyle;
					layer.setStyle(style)
	
					var grades = ['green','blue','red','black'];
					var html = '<h3>'+properties.name+'</h3>'+'<ol class="gradeselection">';
					for(var i = 0; i < grades.length ; i++){
						html += '<li'+(parseInt(properties.grade)-1==i ? ' class="selected"':'')+'><div class="'+grades[i]+'"></div></li>';
					}
					html += '</ol>';
					$('#below').html(html);

					// Update selected layer variable
					selectedLayer = layer;
				}else{
					style = defaultStyle
					layer.setStyle(style);
					selectedLayer = null;
				}

				if(prevlayer && prevlayer!=selectedLayer){
					// De-highlight the previous layer
					prevlayer.setStyle(defaultStyle);
				}

				return this;
			}

			// Create a mouseover event
			layer.on("mouseover", function (e) {
				// Change the style to the highlighted version
				layer.setStyle(highlightStyle);

				// Mouseout doesn't always fire so we manually loop
				// over the layers and de-highlight the ones which
				// aren't the current layer or the selected layer
				var f = linesFeatureLayer.getLayers();
				for(var i = 0; i < f.length; i++){
					if(f[i]!=layer && f[i]!=selectedLayer) f[i].setStyle(defaultStyle)
				}
			});

			layer.on("click",function(e){ this.selectLine(); });

			// Reverting the style back
			layer.on("mouseout", function(e){ layer.setStyle(style); });

			// Close the "anonymous" wrapper function, and call it while passing
			// in the variables necessary to make the events work the way we want.
		})(layer, feature.properties);

	}
	
		
	function addRoutes(data){

		var datatoadd = [];

		// We need to work out which roads we don't already have
		for(var i = 0; i < data.length; i++){
			var add = true;
			var id = "osmid="+data[i].properties.osm_id;	// Pre-pend a string otherwise JS treats it as a standard integer-indexed array
			if(data[i].properties.osm_id && !routes[id]){
				routes[id] = true;
				datatoadd.push(data[i]);
			}
		}

		if(!linesFeatureLayer){
			console.log('Creating '+datatoadd.length+' roads')
			linesFeatureLayer = L.geoJson(datatoadd, {
				style: function(feature) {
					switch (feature.properties.grade) {
						case 0: return white;
						case 1: return green;
						case 2: return blue;
						case 3: return red;
						case 4: return black;
					}
				},
				onEachFeature: onEachRoute
			});
			linesFeatureLayer.addTo(map);
		}else{
			console.log('Adding '+datatoadd.length+' roads')
			// We've already created the layer so just add the roads we need to
			linesFeatureLayer.addData(datatoadd)
		}
	}
});