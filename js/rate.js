var rate;

function RouteRater(){

	this.moments = [{'lat':53.796405214684256,'lng':-1.5352481603622437,'time':'2015-04-18T21:00:03+01:00'},{'lat':53.796411551738345,'lng':-1.5335100889205933,'time':'2015-04-19T14:03:43+01:00'},{'lat':53.79833797179022,'lng':-1.5296262502670288,'time':'2015-04-19T14:11:05+01:00'}];

	this.layers = { 'base':{}, 'overlay':{} };
	this.style = {
		"green": { color: ($('.green').css('background-color') ? $('.green').css('background-color') : '#00c600') },
		"blue": { color: ($('.blue').css('background-color') ? $('.blue').css('background-color') : '#3972f8') },
		"red": { color: ($('.red').css('background-color') ? $('.red').css('background-color') : '#b00000') },
		"black": { color: "#000000" },
		"white": { color: "#ffffff" },
		"default": { weight: 8, opacity: 0.1 },
		"highlight": { weight: 8, opacity: 1 }
	}
	this.map;
	this.control;
	this.selectedLayer;
	this.linesFeatureLayer;
	this.markers = [];
	this.icons = {};
	this.routes = [];
	this.i = -1;
	this.pos = {'lat':this.moments[0].lat,'lng':this.moments[0].lng,'zoom':17};
	this.moment = L.latLng(this.moments[0].lat,this.moments[0].lng);

	return this;
}

RouteRater.prototype.makeMap = function(){

	// create a map in the "map" div, set the view to a given place and zoom
	if(typeof L==="object"){
		// add an OpenStreetMap tile layer
		this.layers.base["Route rater"] = L.tileLayer('http://www.strudel.org.uk/routerater/tiles/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors & Route Rater',
			maxZoom: 17,
			errorTileUrl: 'missing.png'
		});
		this.layers.base["Gray-scale"] = L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery &copy; <a href="http://mapbox.com">Mapbox</a>',
			id: 'examples.map-20v6611k',
			maxZoom: 17,
			minZoom: 16,
			errorTileUrl: 'missing.png'
		});
		
		this.map = L.map('main',{'layers':this.layers.base["Route rater"],'center':[this.pos.lat, this.pos.lng],'zoom':this.pos.zoom});
		this.control = L.control.layers(this.layers.base,this.layers.overlay);
		this.control.addTo(this.map);
		L.control.scale().addTo(this.map);
	}

	this.icons.basic = L.icon({iconUrl: 'icons/.png',shadowUrl: 'leaf-shadow.png',iconSize:[38, 95],shadowSize:[50, 64],iconAnchor:[22, 94],shadowAnchor: [4, 62],popupAnchor:  [-3, -76]});

	var _obj = this;
	this.map.on('moveend',function(e){
		console.log('end move',_obj.map.getBounds())
		_obj.getRoads();
	}).on('click',function(e){
		console.log('click',e,e.latlng,_obj.linesFeatureLayer);
	})
	return this;
}

RouteRater.prototype.getRoads = function(callback){
	if(this.map.getZoom() > 15){
		var bounds = this.map.getBounds();
	
		console.log('latmx='+bounds._northEast.lat+'&latmn='+bounds._southWest.lat+'&lonmx='+bounds._northEast.lng+'&lonmn='+bounds._southWest.lng+'');
		var _obj = this;
		$.ajax({
			dataType: "jsonp",
			url: 'http://www.strudel.org.uk/cgi-bin/routerater.pl?latmx='+bounds._northEast.lat+'&latmn='+bounds._southWest.lat+'&lonmx='+bounds._northEast.lng+'&lonmn='+bounds._southWest.lng+'&latitude='+_obj.pos.lat+'&longitude='+_obj.pos.lng+'&verb=routes',
			success: function(data){
				if(data.routes) _obj.addRoutes(data.routes)
				if(typeof _obj.movemap==="function") _obj.movemap.call(_obj);
				if(typeof callback==="function") callback.call(_obj);
			},
			error: function(data){ console.log(data); }
		});
	}
	return this;
}
		
RouteRater.prototype.addRoutes = function(data){

	var datatoadd = [];

	// We need to work out which roads we don't already have
	for(var i = 0; i < data.length; i++){
		var add = true;
		var id = "osmid="+data[i].properties.osm_id;	// Pre-pend a string otherwise JS treats it as a standard integer-indexed array
		if(data[i].properties.osm_id && !this.routes[id]){
			this.routes[id] = true;
			datatoadd.push(data[i]);
		}
	}
	
	if(!this.linesFeatureLayer){
		console.log('Creating '+datatoadd.length+' roads')
		var _obj = this;

		this.linesFeatureLayer = L.geoJson(datatoadd, {
			style: function(feature) {
				switch (feature.properties.grade) {
					case 0: return _obj.style.white;
					case 1: return _obj.style.green;
					case 2: return _obj.style.blue;
					case 3: return _obj.style.red;
					case 4: return _obj.style.black;
				}
			},
			onEachFeature: function(feature, layer){
		
				// Load the default style. 
				layer.setStyle(_obj.style["default"]);
		
				// Create a self-invoking function that passes in the layer
				// and the properties associated with this particular record.
				(function(layer, properties) {
		
					var style = _obj.style["default"];
					var prevlayer;
					
					// Create a special function to select/deselect this road
					layer.selectLine = function(){
		
						prevlayer = _obj.selectedLayer;
						
						// Remove existing HTML
						$('#below').html('')
		
						if(!_obj.selectedLayer || _obj.selectedLayer!=layer){
		
							style = _obj.style["highlight"];
							layer.setStyle(style)
							
							// Set the road
							_obj.setRoad(properties)

							// Update selected layer variable
							_obj.selectedLayer = layer;
						}else{
							style = _obj.style["default"]
							layer.setStyle(style);
							_obj.selectedLayer = null;
						}
		
						if(prevlayer && prevlayer!=_obj.selectedLayer){
							// De-highlight the previous layer
							prevlayer.setStyle(_obj.style["default"]);
						}
		
						return this;
					}
		
					// Create a mouseover event
					layer.on("mouseover", function (e) {
						// Change the style to the highlighted version
						layer.setStyle(_obj.style["highlight"]);
		
						// Mouseout doesn't always fire so we manually loop
						// over the layers and de-highlight the ones which
						// aren't the current layer or the selected layer
						var f = _obj.linesFeatureLayer.getLayers();
						for(var i = 0; i < f.length; i++){
							if(f[i]!=layer && f[i]!=_obj.selectedLayer) f[i].setStyle(_obj.style["default"])
						}
					});
		
					layer.on("click",function(e){ this.selectLine(); });
		
					// Reverting the style back
					layer.on("mouseout", function(e){ layer.setStyle(style); });
		
					// Close the "anonymous" wrapper function, and call it while passing
					// in the variables necessary to make the events work the way we want.
				})(layer, feature.properties);
			}
		});
		this.linesFeatureLayer.addTo(this.map);
	}else{
		console.log('Adding '+datatoadd.length+' roads')
		// We've already created the layer so just add the roads we need to
		this.linesFeatureLayer.addData(datatoadd)
	}
	
	return this;
}

RouteRater.prototype.setRoad = function(properties){
	this.road = properties;
	var grades = ['green','blue','red','black'];
	var html = '<h2>'+properties.name+'</h2>'+'<ol class="gradeselection">';
	for(var i = 0; i < grades.length ; i++){
		html += '<li'+(parseInt(properties.grade)-1==i ? ' class="selected"':'')+'><div class="'+grades[i]+'"></div></li>';
	}
	html += '</ol>';
	$('#moment_below').html(html);

}

RouteRater.prototype.selectNearestRoad = function(loc,px){
	if(!px) px = 20
	// Find the nearest graded path within px pixels
	this.nearest = L.GeometryUtil.closestLayerSnap(this.map, this.linesFeatureLayer.getLayers(), this.moment, px, true);
	if(this.nearest){
		// Call the function to select this line
		this.nearest.layer.selectLine();
	}
	return this;
}

RouteRater.prototype.processMoments = function(){

	this.i++;

	if(this.i < this.moments.length){
		this.moment = L.latLng(this.moments[this.i].lat,this.moments[this.i].lng);
		
		// Remove previous marker
		if(this.markers.length > 0) this.map.removeLayer(this.markers[this.markers.length-1])
		
		// On the initial call we will try to find the nearest road to our point
		this.markers.push(L.marker(this.moment,{'title':'Moment '+(this.i+1),'draggable':true}));
		this.markers[this.markers.length-1].addTo(this.map);

		// Update HTML
		var pre = "";
		var d = new Date(this.moments[this.i].time);
		if(this.moments.length > 0) pre = '<h2>Tap '+(this.i+1)+' of '+(this.moments.length)+'</h2><h3>'+friendlyTime(d)+'</h3>';
		$('#moment_title').html(pre);

		// Pan the map to this point
		this.map.panTo(this.moment);

		// Make a callback function for once we have roads
		this.movemap = function(){
			// Do we have the line layer?
			if(this.linesFeatureLayer){
				// Find the nearest graded path within 20 pixels
				this.selectNearestRoad(this.moment,20);
			}
			this.movemap = null;
		}

		// If this is the first moment we already have roads
		// so we can execute the callback immediately
		if(this.i == 0){
			this.movemap.call(this);
		}

	}else{
		console.log('done')
	}
}

RouteRater.prototype.init = function(){

	// Make the map
	this.makeMap();

	// Init with roads for current location
	this.getRoads(function(){ this.processMoments(); });
	return this;
}

function friendlyTime(d){
	if(!d) return "";
	var midnight = new Date();
	var now = new Date();
	midnight.setHours(0)
	midnight.setMinutes(0);
	midnight.setSeconds(0);
	dt = now-d;

	h = d.getHours();
	if(h < 10) h = "0"+h;
	m = d.getMinutes();
	if(m < 10) m = "0"+m;

	if(d-midnight >= 0) return "Today at "+h+":"+m;
	else{

		if(d-midnight > -86400000){
			return "Yesterday at "+h+":"+m;
		}else{
			var mons = new Array('January','February','March','April','May','June','July','August','September','October','November','December');
			if(typeof d.getYear!=="function") return "";
			y = d.getYear()+'';
			if(y.length < 4) y = (y-0+1900);
			if(dt < (360*86400)) return d.getDate()+' '+mons[d.getMonth()]+' at '+h+':'+m+'';
			else return d.getDate()+' '+mons[d.getMonth()]+' '+y+' at '+h+':'+m+'';
		}
	}
	return "";
}

$(document).ready(function(){
	rate = new RouteRater();
	rate.init();
});