$(document).ready(function(){

	if(!$('.navbar-collapse .nav').is(':visible')){
		// Need to make the menu bar
		
	}

	if($('#key').length == 0 && $('#gradedescription').length==0) $('#content').append('<div id="key"><ol id="gradedescription"><li><div class="green box"></div> <strong>Novice</strong>: Off-road/separate to vehicles/gentle gradients</li><li><div class="blue box"></div> Beginner: Some or limited experience. Residential roads/low traffic/slow speeds.</li><li><div class="red box"></div> Intermediate: Busy roads/heavy traffic/filter lanes/big roundabouts/traffic lights/steep hills.</li><li><div class="black box"></div> Extreme: Multi-lane sections/gyratories/lots of experience and luck.</li><li><div class="yellow box"></div> Local authority official routes.</li></ol></div>');
	var lb = new lightbox('#key','.togglekey',{'max-width': '800px'});


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

function lightbox(content,trigger,options){
	if(!content || !trigger) return this;

	this.content = content;
	this.trigger = trigger;
	this.options = (options) ? options : {}
	if(!this.options.speed) this.options.speed = 500;
	if(!this.options['max-width']) this.options['max-width'] = '500px';
	this.lb = $(this.content);

	this.style = {
		'top':{ 'z-index': 1002, 'left':'0px','top':'0px','bottom':'0px','right':'0px','width':'100%','position': 'absolute', 'background-color': 'white' },
		'inner':{'max-width':this.options['max-width'],'margin':'auto'}
	}

	// Trigger the lightbox
	$(document).on('click',this.trigger,{me:this},function(e){
		e.preventDefault();
		// Event to open full screen mode
		e.data.me.fullscreen();
	});
	
	// Close the lightbox
	$(document).on('click','.lightbox_top .close',{me:this},function(e){
		e.preventDefault();
		e.data.me.close();
	});
	
	$(document).on('click',this.content,function(e){
		e.stopPropagation();
	});
	$(document).on('click','.lightbox_top',{me:this},function(e){
		e.data.me.close();
	});


	// Deal with the window changing size
	var _obj = this;
	$(window).resize(function(){ _obj.centre(); });
	
	// Hide the content
	$(this.content).hide()

	return this;
}

lightbox.prototype.centre = function(){
	if($('.lightbox_top').is(':visible')){
		$('.lightbox_top').css(this.style.top).css({'height':$(document).height()+'px'});

		// Change top margin of lightbox_inner to keep it centred
		var t = $(window).scrollTop();
		$('.lightbox_top .close').css({'top':(t+10)+'px'});
		if($(window).height() > this.lb.height()) t += (($(window).height()-this.lb.outerHeight())/2);
		$('.lightbox_inner').css(this.style.inner).css({'margin-top':t+'px'});
	}
	return this;
}

lightbox.prototype.fullscreen = function(){

	this.lb.show()
	// Wrap content
	if($('.lightbox_top').length==0) this.lb.wrap("<div class='lightbox_top'><div class='lightbox_inner'><\/div><\/div>");
	var me = $('.lightbox_top').detach();
	me.appendTo('body');
		
	// Add a close button
	if(this.lb.find('.close').length==0) $('.lightbox_top').prepend('<a href="#" class="close">&times;<\/a>');
	$('.lightbox_top .close').css({'font-size': '2em','line-height': '0.8em','position': 'absolute', 'right': '10px','text-decoration': 'none', 'top': '10px','color':'inherit'});
		
	// Centre it
	this.centre();

	// Remove scroll bars from page
	$('body').css('overflow-y','hidden');

	return this;
}

lightbox.prototype.close = function(){
	if(this.lb.length > 0){
		this.lb.attr('role','').fadeOut(this.options.speed,function(){
			$('.lightbox_top .close').remove();
			$(this).unwrap().unwrap();
			$('body').css('overflow-y','auto');
		});
	}
	return this;
}
