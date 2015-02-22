// Initialize the main function with the data we've loaded
function init(data){
	var rr = new RouteRater(data);
}

// Main function
function RouteRater(data){
	this.data = data;
	this.typeahead('filter');
	return this;
}

// Build a typeahead search field attached to the element with ID=id
RouteRater.prototype.typeahead = function(id){
	var t = 'typeahead';

	if($('#'+id).length == 0) $('#main').prepend('<h3><label for="filter">Find:</label> <input type="text" name="filter" id="filter" placeholder="Find e.g. Busy road, good cycle path" /></h3>');

	// Add the typeahead div and hide it
	$('#main').append('<div id="'+t+'"></div>');

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
		for(var i = 0; i < results.length; i++){
			if(results[i][1] > 0 && results[i][1] > results[0][1]/10) html += '<li><a href="" data="'+i+'"><span class="score">'+Math.round(100*results[i][1]/results[0][1])+'% match</span><span class="title">'+results[i][0].title+'</span><span class="desc">'+results[i][0].desc+'</span></a></li>';
		}
		html += "</ul>";
	}
	this.results = results;
	return html;
}


$(document).ready(function(){
	// Load JSON database of acknowledgments
	$.getJSON("config/config.json", init);
})

