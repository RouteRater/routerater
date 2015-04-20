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
		for(var i = 0; i < this.q.lat.length; i++) this.addMoment(this.q.lat[i],this.q.lng[i],this.q.time[i]);
	}

	this.layers = { 'base':{}, 'overlay':{} };
	this.style = {
		"green": { color: ($('.green').css('background-color') ? $('.green').css('background-color') : '#00c600') },
		"blue": { color: ($('.blue').css('background-color') ? $('.blue').css('background-color') : '#3972f8') },
		"red": { color: ($('.red').css('background-color') ? $('.red').css('background-color') : '#b00000') },
		"black": { color: "#000000" },
		"white": { color: "#ffffff" },
		"default": { weight: 8, opacity: 0.2 },
		"highlight": { weight: 8, opacity: 1 }
	}
	this.grades = ['green','blue','red','black'];
	this.map;
	this.control;
	this.selectedLayer;
	this.linesFeatureLayer;
	this.userselections = [];
	this.markers = [];
	this.icons = {};
	this.routes = [];
	this.trygeolocate = true;
	this.clickable = false;
	this.i = -1;
	this.pos = {'lat':(this.moments.length > 0 ? this.moments[0].lat : 53.796405214684256),'lng':(this.moments.length > 0 ? this.moments[0].lng : -1.5352481603622437),'zoom':17};
	this.moment;
	this.marker;
	
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
			errorTileUrl: 'missing.png'
		});
		
		this.map = L.map('map',{'layers':this.layers.base["Gray-scale"],'center':[this.pos.lat, this.pos.lng],'zoom':this.pos.zoom});
		this.control = L.control.layers(this.layers.base,this.layers.overlay);
		this.control.addTo(this.map);
		L.control.scale().addTo(this.map);
	}

	this.icons.basic = L.icon({iconUrl: 'images/marker-icon.png',shadowUrl: 'images/marker-shadow.png',iconSize:[38, 95],shadowSize:[50, 64],iconAnchor:[22, 94],shadowAnchor: [4, 62],popupAnchor:  [-3, -76]});

	var _obj = this;
	this.map.on('moveend',function(e){
		console.log('end move',_obj.map.getBounds(),_obj.clickable)
		_obj.getRoads();
	}).on('click',function(e){
		console.log(e.latlng)
		if(_obj.clickable){
			console.log('click',e,e.latlng,_obj.linesFeatureLayer);
			var d = new Date();
			_obj.addMoment(e.latlng.lat,e.latlng.lng,d.toISOString());
			_obj.processMoments();
			_obj.clickable = false;
		}
	}).on('locationfound',function(e){
		var d = new Date();
		// We've found the location so clear the clickable timeout
		clearTimeout(this.timeout);
		_obj.addMoment(e.latlng.lat,e.latlng.lng,d.toISOString());//.moments.push({'lat':this.q.lat[i],'lng':this.q.lng[i],'time':(this.q.time[i] ? this.q.time[i]:'')});
		_obj.processMoments();
	}).on('locationerror',function(e){
		console.log('locationerror')
		_obj.trygeolocate = false;
		_obj.clickable = true;
		_obj.processMoments();
	});
	
	// Build grader
	var html = '<ol class="gradeselection">';
	for(var i = 0; i < this.grades.length ; i++) html += '<li><div class="'+this.grades[i]+'"></div></li>';
	html += '</ol>';
	html += '<div id="gradedescriptiontoggle">\?</div>';
	html += '<div id="gradedescription"></div>';
	$(document).on('click','#gradedescriptiontoggle',function(e){
		$('#gradedescription').toggle();
	});

	$('#grade').html(html).hide();
	$(document).on('click','.gradeselection li div',{me:this},function(e){ e.data.me.setRoad($(this).attr("class")); })

	// Build typeahead events
	$(document).on('click','.selectedmoment',{me:this},function(e){
		e.preventDefault();
		e.stopPropagation();
		e.data.me.deselectMomentType();
	});

	// Build mood board events
	$(document).on('click','.mood',{me:this},function(e){
		$('.mood.selected').removeClass('selected');
		e.data.me.mood = $(this).attr('data');
		e.data.me.saveable();
		$(this).addClass('selected');
	});
	
	// Add events for save button
	$(document).on('click','.button.save',{me:this},function(e){ e.data.me.save(); });

	return this;
}

RouteRater.prototype.addMoment = function(la,ln,ts){
	this.moments.push({'lat':la,'lng':ln,'time':(ts ? ts:'')});
	return this;
}

RouteRater.prototype.getRoads = function(callback){
	console.log('getRoads')
	if(this.map.getZoom() > 15){
		var bounds = this.map.getBounds();
	
		console.log('latmx='+bounds._northEast.lat+'&latmn='+bounds._southWest.lat+'&lonmx='+bounds._northEast.lng+'&lonmn='+bounds._southWest.lng+'');
		var _obj = this;
		$.ajax({
			dataType: "jsonp",
			url: 'http://www.strudel.org.uk/cgi-bin/routerater.pl?latmx='+bounds._northEast.lat+'&latmn='+bounds._southWest.lat+'&lonmx='+bounds._northEast.lng+'&lonmn='+bounds._southWest.lng+'&latitude='+_obj.pos.lat+'&longitude='+_obj.pos.lng+'&verb=routes',
			success: function(data){
				if(data.routes) _obj.addRoutes(data.routes)
				//if(typeof _obj.movemap==="function") _obj.movemap.call(_obj);
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

	$('.gradeselection li.selected').removeClass('selected');
	$('.gradeselection li div').html('&nbsp;');//&#x2713;
	if(properties){
		$('#grade').show();
		if(typeof properties==="string"){
			var g = 0;
			if(this.road){
				for(var i = 0; i < this.grades.length; i++){
					if(this.grades[i] == properties) g = i;
				}
				this.road.newgrade = g+1;
			}
		}else{
			this.road = properties;
			this.road.grade = parseInt(this.road.grade);
		}
		if(this.road.newgrade == this.road.grade) this.road.newgrade = null;
		g = (this.road.newgrade ? this.road.newgrade : this.road.grade);
		grade = this.grades[g-1];
		$('.gradeselection li:eq('+(g-1)+')').addClass('selected').find('div').html('&#x2713;');
		$('#grade').show();

		// Update form
		if(this.road.newgrade && this.road.newgrade != this.road.grade){
			console.log(this.road.newgrade,this.road.grade,this.road.osm_id);
		}
		$('#details .routename').html(this.road.name ? '&nbsp;/&nbsp;'+this.road.name : '');

	}else{
		this.road = null;
		$('#grade').hide();
	}


	this.saveable();

	return this;
}

RouteRater.prototype.selectNearestRoad = function(loc,px){
	if(!px) px = 20

	// Find the nearest graded path within px pixels
	this.nearest = L.GeometryUtil.closestLayerSnap(this.map, this.linesFeatureLayer.getLayers(), loc, px, true);

	// Call the function to select this line
	if(this.nearest) this.nearest.layer.selectLine();

	return this;
}

RouteRater.prototype.clear = function(txt){

	console.log('clear')
	if(!txt) txt = 'Click on the map to add a moment.';
	$('#title').html(txt);
	$('#details').html('');
	$('#moment').hide();
	this.clickable = true;

	return this;
}

RouteRater.prototype.processMoments = function(){

	this.i++;
	
	console.log('processMoments')
	// Reset
	this.deselectMomentType();
	this.setRoad();
	this.mood = null;

	// Remove previous marker
	if(this.markers.length > 0) this.map.removeLayer(this.markers[this.markers.length-1])

	if(this.moments.length == 0){

		// We have no moments
		var _obj = this;
		var s = 10000;
		this.timeout = setTimeout(function(){ console.log('timeout'); _obj.clear('Couldn\'t find your location. Click on the map to add a moment'); this.i = -1; },s);
		if(this.trygeolocate){
			this.i = -1;	// reset counter
			// Try to use the user's location
			this.map.locate({setView: true,timeout:s});
		}
		//console.log(this.trygeolocate,this.clickable)

	}else{

		if(this.timeout) clearTimeout(this.timeout);
		
		if(this.i < this.moments.length){
			this.marker = L.latLng(this.moments[this.i].lat,this.moments[this.i].lng);
			
			// On the initial call we will try to find the nearest road to our point
			this.markers.push(L.marker(this.marker,{'title':'Moment '+(this.i+1),'draggable':true}));
			this.markers[this.markers.length-1].addTo(this.map);
			
			var _obj = this;
			this.markers[this.markers.length-1].on('dragend',function(e){
				var marker = e.target;
				_obj.selectNearestRoad(marker.getLatLng(),20);
			})
	
			// Update HTML
			var pre = "";
			var d = new Date(this.moments[this.i].time);
			this.timestamp = this.moments[this.i].time;
			if(this.moments.length > 0) pre = '<h2>Rating moment'+(this.moments.length > 1 ? ' '+(this.i+1)+' of '+(this.moments.length) : '')+'</h2>';
			$('#title').html(pre);
			$('#details').html('<time datetime="'+this.moments[this.i].time+'" class="datestamp">'+friendlyTime(d)+'</time><div class="routename"></div>')
	
			// Pan the map to this point
			this.map.panTo(this.marker);
	
			$('#moment').show();

			// Init with roads for this location
			this.getRoads(function(){
				// Once we've loaded the roads we'll select the nearest one
				// Do we have the line layer?
				if(this.linesFeatureLayer){
					// Find the nearest graded path within 20 pixels
					this.selectNearestRoad(this.marker,20);
				}
			});

			$(window).trigger('resize')
			
		}else{
			console.log('done')
			this.i = -1;
			this.moments = [];
			this.clear();
		}		
	}
}

RouteRater.prototype.saveable = function(){
	var saveable = false;
	if(this.marker){
		if(this.road && this.road.newgrade) saveable = true;
		if(this.mood && this.moment) saveable = true;
	}

	if(saveable){
		$('#nav').html('<button class="button save">Save</button>')
		console.log('Can save')
	}else{
		$('#nav').html('')
		console.log('No save')
	}
	return this;
}

RouteRater.prototype.save = function(){
	var query = "";
	var saved = false;
	
	if(this.marker){
		if(this.road.newgrade){
			query = (query ? '&':'')+'osm_id='+this.road.osm_id+'&grade='+this.road.newgrade+'&timestamp='+this.timestamp;
			console.log(query);
			saved = true;
		}
		if(this.mood && this.moment){
			query = 'lat='+this.marker.lat+'&lng='+this.marker.lng+'mood='+this.mood+'&type='+this.moment+'&timestamp='+this.timestamp;
			console.log(query);
			saved = true;
		}
	}

	if(saved){
		this.processMoments();
	}
	return this;
}

RouteRater.prototype.deselectMomentType = function(){

	// Update the search text
	$('#filter').val('').show();

	// Filter list to this item
	$('#typeahead').html(this.search('')).show();
	
	$('.mood_neutral').trigger('click');
	
	$('.selectedmoment').html('');
	
	this.moment = null;
	
	this.saveable();

}

RouteRater.prototype.selectMomentType = function(id,i){

	// Store this selection to improve the typeahead results
	this.userselections.push(id);

	this.moment = id;
	
	// Trigger default mood for this type of moment
	if(this.results[i][0].mood) $('.mood_'+this.results[i][0].mood+' input').trigger('click');

	if($('.selectedmoment').length==0) $('#typeahead').after('<div class="selectedmoment"></div>')
	$('.selectedmoment').html('<a href="#"><img src="../images/icon_'+this.results[i][2]+'_selected.png" alt="'+this.results[i][0].title+'" /><span href="#" class="change">&#10799;</span><span class="title">'+this.results[i][0].title+'</span><span class="desc">'+this.results[i][0].desc+'</span></a></div>');

	// Update the search text
	$('#filter').val(this.results[i][0].title).hide();
	
	// Filter list to this item
	$('#typeahead').html(this.search(this.results[i][0].title)).hide();
	
	$('#typeahead .momentlist li:first-child').addClass('selected');
	
	this.saveable();

	return this;
}

// Build a typeahead search field attached to the element with ID=id
RouteRater.prototype.typeahead = function(id){
	if(!id) id = 'filter';
	var t = 'typeahead';

	if(!this.typeaheadsetup){
	
		this.typeaheadsetup = true;
	
		if($('#'+id).length == 0) $('#moment').prepend('<div class="filterholder"><label for="filter" class="">Category:</label> <input type="text" name="filter" id="filter" class="fullwidth" placeholder="Find e.g. cycle-path, steps, obstruction" /></div>');
	
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

		// Deal with the click event
		$(document).on('click','#'+t+' a',{me:this},function(e){
			e.preventDefault();
			e.stopPropagation();
			// Trigger the click event for the item
			var s = $(this);
			if(s.length == 1 && s.attr('data')) e.data.me.selectMomentType(e.data.me.results[parseInt(s.attr('data'))][2],parseInt(s.attr('data')));
		});
	
		$('#'+id).on('keyup',{citation:this},function(e){
	
			// Once a key has been typed in the search field we process it
			var s = $('#'+t+' a.selecter.selected');
			var list = $('#'+t+' a.selecter');
			var i = 0;
	
			if(e.keyCode==40 || e.keyCode==38){
	
				// Up or down cursor keys
				i = 0;
	
				// If an item is selected we move to the next one
				if(s.length > 0){
					s.removeClass('selected');
					i = parseInt(s.attr('data'))+(e.keyCode==40 ? 1 : -1);
					if(i >= list.length) i = 0;
					if(i < 0) i = list.length-1;
				}
	
				// Select the new item
				$(list[i]).addClass('selected');
	
				
			}else if(e.keyCode==13){
	
				// The user has pressed return
				if(s.length > 0) i = parseInt(s.attr('data'));
				$(list[i]).trigger('click');
	
			}else{
	
				var html = e.data.citation.search($(this).val());
				
				$('#'+t).html(html);
				$('#'+t+' a.selecter:first').addClass('selected');
			}
			var container = document.getElementById(t);
			container.scrollTop = $(list[i]).outerHeight()*i;
		});
		$('#'+t).html(this.search(''));	// Default list
	}

	return this;
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
			results.push([this.data.moments[mom],score,mom]);
		}
	}else{
		// Work out the score for each item
		var score = {};
		// Set an initial score
		for(var mom in this.data.moments) score[mom] = (this.data.moments[mom].initial ? this.data.moments[mom].initial : 0.1);
		for(var i = 0; i < this.userselections.length; i++){
			// Increase the score by how recently the user selected it
			score[this.userselections[i]] += (i+1)/(this.userselections.length);
		}
		// Add to the results list
		for(var mom in this.data.moments) results.push([this.data.moments[mom],score[mom],mom]);
	}

	if(results.length > 0){
		// Get order
		var results = results.sort(function(a, b) {return b[1] - a[1]});
		html = '<ol class="momentlist">';
		//n = Math.min(10,results.length)
		n = results.length;
		for(var i = 0; i < n; i++){
			//if(results[i][1] > 0 && results[i][1] >= results[0][1]/10) html += '<li><a href="#" data="'+i+'"><span class="score">'+Math.round(100*results[i][1]/results[0][1])+'% match</span><span class="title">'+results[i][0].title+'</span><span class="desc">'+results[i][0].desc+'</span></a></li>';
			if(results[i][1] > 0) html += '<li><a href="#" class="selecter" data="'+i+'"><img src="../images/icon_'+results[i][2]+'.png" alt="'+results[i][0].title+'" /><span class="score">'+Math.round(100*results[i][1]/results[0][1])+'% match</span><span class="title">'+results[i][0].title+'</span><span class="desc">'+results[i][0].desc+'</span></a></li>';
		}//<img src="../images/icon_'+results[i][2]+'.png" 
		html += "</ol>";
	}

	this.results = results;
	return html;
}

RouteRater.prototype.init = function(){

	// Make the map
	this.makeMap();
	
	// Load the available moments
	$.ajax({
		dataType: "json",
		url: 'config/config.json',
		context: this,
		success: function(data){
			this.data = data;

			//BLAH
			html = '<ol>';
			for(var i in this.data.grades) html += '<li><span class="'+i+' box"></span>'+this.data.grades[i].desc+"</li>"
			html += '</ol>';
			$('#gradedescription').append(html);

			this.typeahead('filter');
			
			$('#moment').append('<div id="mood"><div class="mood mood_happy" data="happy"><input type="radio" name="mood" value="good" /></div><div class="mood mood_neutral" data="neutral"><input type="radio" name="mood" value="none" /></div><div class="mood mood_sad" data="sad"><input type="radio" name="mood" value="problem" /></div></div>');

			this.clear('Trying to find your location...');
			$('#moment').hide();

			// Once we have the config data we can process any moments
			this.processMoments();
		}
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