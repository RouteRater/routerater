var rate;

// Get the URL query string and parse it
$.query = function() {
	var r = {length:0};
	var q = location.search;
	if(q && q != '#'){
		// remove the leading ? and trailing &
		q = q.replace(/^\?/,'').replace(/\&$/,'');
		jQuery.each(q.split('&'), function(){
			var key = this.split('=')[0];
			var val = this.split('=')[1];
			if(/^[0-9\+\-\.Ee]+$/.test(val)) val = parseFloat(val);	// convert floats
			if(!r[key]) r[key] = val;
			else{
				if(typeof r[key]!=="object"){
					r[key] = [r[key]];
				}
				r[key].push(val);
			}
		});
	}
	return r;
};


function RouteRater(){

	this.q = $.query();
	this.moments = [];

	if(this.q.lat && this.q.lng && this.q.lat.length == this.q.lng.length){
		for(var i = 0; i < this.q.lat.length; i++){
			this.moments.push({'lat':this.q.lat[i],'lng':this.q.lng[i],'time':(this.q.time[i] ? this.q.time[i]:'')});
		}
	}
	//this.moments = [{'lat':53.796405214684256,'lng':-1.5352481603622437,'time':'2015-04-18T21:00:03+01:00'},{'lat':53.796411551738345,'lng':-1.5335100889205933,'time':'2015-04-19T14:03:43+01:00'},{'lat':53.79833797179022,'lng':-1.5296262502670288,'time':'2015-04-19T14:11:05+01:00'}];

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
	this.pos = {'lat':(this.moments.length > 0 ? this.moments[0].lat : 53.796405214684256),'lng':(this.moments.length > 0 ? this.moments[0].lng : -1.5352481603622437),'zoom':17};
	this.moment;// = L.latLng(this.moments[0].lat,this.moments[0].lng);

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
		
		this.map = L.map('map',{'layers':this.layers.base["Route rater"],'center':[this.pos.lat, this.pos.lng],'zoom':this.pos.zoom});
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

					layer.deselectLine = function(){
						this.setStyle(_obj.style["default"])
						if(_obj.selectedLayer==layer) _obj.selectedLayer = null;
					}
					
					layer.selectLine = function(){
						console.log('selectLine',layer==_obj.selectedLayer)

						if(!_obj.selectedLayer || layer!=_obj.selectedLayer){

							if(_obj.selectedLayer) _obj.selectedLayer.setStyle(_obj.style["default"]);

							style = _obj.style["highlight"];
							// Change the style to the highlighted version
							layer.setStyle(style);
			
							// Loop over the layers and de-highlight the ones which
							// aren't the current layer or the selected layer
							var f = _obj.linesFeatureLayer.getLayers();
							for(var i = 0; i < f.length; i++){
								if(f[i]!=layer && f[i]!=_obj.selectedLayer) f[i].deselectLine();
							}
							_obj.selectedLayer = layer;
							
							// Set the road
							_obj.setRoad(properties)
						}
					}

					// Create a special function to select/deselect this road
					layer.toggleLine = function(){
		
						console.log('toggleLine')
						
						if(!_obj.selectedLayer || _obj.selectedLayer!=layer) layer.selectLine();
						else layer.deselectLine();
		
						return this;
					}
		
					// Create a mouseover event
					layer.on("mouseover", function(e){
						// Change the style to the highlighted version
						layer.setStyle(_obj.style["highlight"]);
		
						// Mouseout doesn't always fire so we manually loop
						// over the layers and de-highlight the ones which
						// aren't the current layer or the selected layer
						var f = _obj.linesFeatureLayer.getLayers();
						for(var i = 0; i < f.length; i++){
							if(f[i]!=layer && f[i]!=_obj.selectedLayer) f[i].deselectLine()
						}
					});
		
					layer.on("click",function(e){ this.toggleLine(); });
		
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
	var html = '<ol class="gradeselection">';
	for(var i = 0; i < grades.length ; i++){
		html += '<li'+(parseInt(properties.grade)-1==i ? ' class="selected"':'')+'><div class="'+grades[i]+'"></div></li>';
	}
	html += '</ol>';
	$('#details .routename').html('&nbsp;/&nbsp;'+properties.name);
	$('#grade').html(html);

}

RouteRater.prototype.selectNearestRoad = function(loc,px){
	if(!px) px = 20

	// Find the nearest graded path within px pixels
	this.nearest = L.GeometryUtil.closestLayerSnap(this.map, this.linesFeatureLayer.getLayers(), loc, px, true);

	// Call the function to select this line
	if(this.nearest) this.nearest.layer.selectLine();

	return this;
}

RouteRater.prototype.processMoments = function(){

	this.i++;
	
	this.typeahead('filter');

	if(this.i < this.moments.length){
		this.moment = L.latLng(this.moments[this.i].lat,this.moments[this.i].lng);
		
		// Remove previous marker
		if(this.markers.length > 0) this.map.removeLayer(this.markers[this.markers.length-1])
		
		// On the initial call we will try to find the nearest road to our point
		this.markers.push(L.marker(this.moment,{'title':'Moment '+(this.i+1),'draggable':true}));
		this.markers[this.markers.length-1].addTo(this.map);
		
		var _obj = this;
		this.markers[this.markers.length-1].on('dragend',function(e){
			var marker = e.target;
			_obj.selectNearestRoad(marker.getLatLng(),20);
		})

		// Update HTML
		var pre = "";
		var d = new Date(this.moments[this.i].time);
		if(this.moments.length > 0) pre = '<h2>Tap '+(this.i+1)+' of '+(this.moments.length)+'</h2>';
		$('#title').html(pre);
		$('#details').html('<time datetime="'+this.moments[this.i].time+'" class="datestamp">'+friendlyTime(d)+'</time><div class="routename"></div>')

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
/*
function onMapClick(e) {
    gib_uni();
    marker = new L.marker(e.latlng, {id:uni, icon:redIcon, draggable:'true'});
    marker.on('dragend', function(event){
            var marker = event.target;
            var position = marker.getLatLng();
            alert(position);
            marker.setLatLng([position],{id:uni,draggable:'true'}).bindPopup(position).update();
    });
    map.addLayer(marker);
};*/


// Build a typeahead search field attached to the element with ID=id
RouteRater.prototype.typeahead = function(id){
	var t = 'typeahead';

	if($('#'+id).length == 0) $('#moment').prepend('<h3><label for="filter" class="sr-only">Category:</label> <input type="text" name="filter" id="filter" class="fullwidth" placeholder="Category e.g. Busy road, good cycle path" /></h3>');

	// Add the typeahead div and hide it
	$('#moment').append('<div id="'+t+'"></div>');

	// We want to remove the suggestion box if we lose focus on the 
	// input text field but not if the user is selecting from the list
	this.typeaheadactive = true;
	$('#'+t).on('mouseenter',{citation:this},function(e){
		e.data.citation.typeaheadactive = true;
	}).on('mouseleave',{citation:this},function(e){
		e.data.citation.typeaheadactive = false;
	});

	$('#'+id).on('keyup',{citation:this},function(e){

		// Once a key has been typed in the search field we process it
		var s = $('#'+t+' a.selected');
		var list = $('#'+t+' a');

		if(e.keyCode==40 || e.keyCode==38){

			// Up or down cursor keys
			var i = 0;

			// If an item is selected we move to the next one
			if(s.length > 0){
				s.removeClass('selected');
				i = parseInt(s.attr('data'))+(e.keyCode==40 ? 1 : -1);
				if(i >= list.length) i = 0;
				if(i < 0) i = list.length-1;
			}

			// Select the new item
			$(list[i]).addClass('selected');

			// Update the search text
			$(this).val(e.data.citation.results[i].name)

		}else if(e.keyCode==13){

			// The user has pressed return
			if(s.length > 0) $(list[parseInt(s.attr('data'))]).trigger('click');
			else $(list[0]).trigger('click');

		}else{

			var html = e.data.citation.search($(this).val());

			$('#'+t).html(html);//.css({'width':$(this).outerWidth()+'px'});
			$('#'+t+' a:first').addClass('selected');
			$('#'+t+' a').each(function(i){
				$(this).on('click',{citation:e.data.citation,s:s,t:t,id:id},function(e){
					e.preventDefault();
					// Trigger the click event for the item
					$('#'+e.data.citation.results[i].id).trigger('click');
					// Remove the suggestion list
					$('#'+e.data.t).html('');
					// Clear the search field
					$('#'+e.data.id).val('');
				});
			
			});
		}
	});
}

// Get an HTML list of items which match str
RouteRater.prototype.search = function(str){
	var results = [];
	var html = "";
	// Return a score for how well a pattern matches a string
	function getScore(str,pattern){
		if(pattern=="") return 0;

		var words = pattern.split(/[\W]/);
		var scores = [];
		for(var w = 0; w < words.length; w++){
			var score = 0;
			var i = str.toLowerCase().indexOf(words[w].toLowerCase());
			if(i >= 0){
				score += 1/(i+1);//(str.length - i)/str.length;
				if(i == 0) score += 1.5;
				else{
					if(str.substr(i-1,1).match(/[^A-Za-z]/)) score += 1;
				}
				// If this matches a word exactly we increase the weight
				if(str.substr(i-1,1).match(/[^A-Za-z]/) && str.substr(i+words[w].length,1).match(/[^A-Za-z]/)) score += 1;
			}
			scores.push(score);
		}
		var n = 0;
		var t = 0;
		for(var s = 0; s < scores.length; s++){
			if(scores[s] > 0) n++;
			t += scores[s];
		}
		if(n==scores.length) return t/n;
		else return 0;
	}
	if(str){
		for(var mom in this.data.moments){
			var score = getScore(this.data.moments[mom].title,str);
			score += getScore(this.data.moments[mom].desc,str)/4;	// Also search the description but give it lower weight
			if(this.data.moments[mom].keywords){
				for(var k = 0; k < this.data.moments[mom].keywords.length; k++){
					score += getScore(this.data.moments[mom].keywords[k],str);
				}
			}
			results.push([this.data.moments[mom],score])
		}
		// Get order
		var results = results.sort(function(a, b) {return b[1] - a[1]});

		html = '<ul>';
		n = Math.min(10,results.length)
		for(var i = 0; i < n; i++){
			if(results[i][1] > 0 && results[i][1] > results[0][1]/10) html += '<li><a href="" data="'+i+'"><span class="score">'+Math.round(100*results[i][1]/results[0][1])+'% match</span><span class="title">'+results[i][0].title+'</span><span class="desc">'+results[i][0].desc+'</span></a></li>';
		}
		html += "</ul>";
	}
	this.results = results;
	return html;
}

RouteRater.prototype.init = function(){

	// Make the map
	this.makeMap();

	// Init with roads for current location
	this.getRoads(function(){ this.processMoments(); });
	
	// Load the available moments
	$.ajax({
		dataType: "json",
		url: 'config/config.json',
		context: this,
		success: function(data){ this.data = data; }
	});

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

	if(d-midnight >= 0) return "today at "+h+":"+m;
	else{

		if(d-midnight > -86400000){
			return "yesterday at "+h+":"+m;
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