$(document).ready(function(){

	if(!$('.navbar-collapse .nav').is(':visible')){
		// Need to make the menu bar
		
	}


	function setSize(){
		var foot = $('#footer');
		foot.css('height','auto')
		console.log('setSize')
		if(foot.length > 0){
			var h = foot.offset().top+foot.outerHeight();
			if(h < $(window).height()){
				foot.css('height',foot.outerHeight()+($(window).height()-h))
			}
		}
	}
	
	// Add resize function
	$(window).on('resize',setSize);
	setSize();
});