/*!
 * Version 0.3  
 * Adds simple touch drag and swipe listeners to jQuery.
 *
 * Requires jQuery 1.7 or later.
 *
 * This content is released under the MIT License
 * http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2012 Tyler Ault
 */

;(function($) {
	
	var START_TOUCH = 'startTouch',
		SWIPE_CALLBACK = 'swipeCallback',
		DRAG_CALLBACK = 'touchDragCallback',
		DRAG_HANDLER = 'touchDragHandler',
		DRAG_CATCHER = 'touchDragCatcher',
		DRAG_AXIS = 'touchDragAxis',
		TOUCH_BUBBLE = 'touchBubble',
		TOUCH_BINDINGS = 'touchBindings',
		UNDEF = 'undefined',
		threshold = 60,
		swipeTimeLimit = 600, // anything more won't be a swipe.
	
	getTouches = function(e){
		var orig = e.originalEvent;
		if( orig.touches && orig.touches.length ){
			return orig.touches;
		} else if( orig.changedTouches && orig.changedTouches.length ){
			return orig.changedTouches;
		}
	},
	
	killEvent = function(e){ e.stopPropagation(); e.preventDefault(); },
	
	unbindDragHandlers = function( draggable ){
		var d = $(draggable),
			handler = d.data(DRAG_HANDLER) || null,
			catcher = d.data(DRAG_CATCHER) || null;
		if(handler && catcher){
			$(catcher).off( { touchmove:handler, touchend:handler } );
		}
		d.data(DRAG_HANDLER,null);
	},
	
	onTouchMove = function(e) {
		var touches = getTouches(e),
			jqObj = $(this), cb, el, axis, start;
		if( touches.length > 1 ){ return; }
		
		start = jqObj.data(START_TOUCH);
		if(!start){ return; }
		cb = jqObj.data(DRAG_CALLBACK);
		axis = jqObj.data(DRAG_AXIS) || 0;
		el = ( axis > 0 ) ? jqObj : null;
		
		if( cb || el ){
			var touch = touches[0],
				deltaX = touch.pageX - start.pageX,
				deltaY = touch.pageY - start.pageY;
			try {
				if(el && ( axis == 1 || axis == 3 ) ){ el.css('left',(start.left + deltaX) + 'px'); }
				if(el && axis > 1){ el.css('top',(start.top + deltaY) + 'px'); }
			}catch(err){}
			if( cb ){ cb.apply( el, [ e, deltaX, deltaY, start.left, start.top ] ); }
		}
		
		killEvent(e);
	},
	
	onTouchEnd = function(e) {
		
		var touches = getTouches(e),
			touch = touches[0],
			start = $(this).data(START_TOUCH);
		
		if( !start || typeof start == UNDEF){ return; }
		if( touches.length > 1 ){ return; }
		
		var deltaX = touch.pageX - start.pageX,
			deltaY = touch.pageY - start.pageY,
			t2 = threshold * threshold,
			cb = $(this).data(SWIPE_CALLBACK);
		
		if( deltaX * deltaX > t2 || deltaY * deltaY > t2 ){
			if( cb && new Date().getTime() - start.time < swipeTimeLimit ){
				cb( e, deltaX, deltaY );
			}
			if($(this).data(TOUCH_BUBBLE) !== true ){ killEvent(e); }
		}
		
		
		$(this).data(START_TOUCH,null);
		unbindDragHandlers(this);
	},

	bindDragHandlers = function( draggable, catcher ){
		var handleDrag = function(e){
			if( e.type == 'touchmove' ){
				onTouchMove.apply( draggable, [e] );
			}
			else if( e.type == 'touchend' ){
				onTouchEnd.apply( draggable, [e] );
				unbindDragHandlers( draggable );
			}
		};
		$(draggable).data(DRAG_HANDLER, handleDrag);
		$(catcher).on( { touchmove:handleDrag, touchend:handleDrag } );
	},
	
	
	onTouchStart = function(e) {
		var touches = getTouches(e),
			touch = touches[0],
			catcher = $(this).data(DRAG_CATCHER) || null,
			el = null, pos = null;
		if( touches.length > 1 ){ return; }
		
		if( catcher ){
			el = $(e.currentTarget);
			pos = el.position();
			bindDragHandlers(this,catcher);
		}
		
		$(this).data(START_TOUCH,{
			pageX:touch.pageX, pageY:touch.pageY,
			top:el ? pos.top : 0, left: el ? pos.left : 0,
			time:new Date().getTime()
		} );
	},
	
	
	
	bindTouches = function( jqObj, type ){
		var bindings = jqObj.data(TOUCH_BINDINGS) || [];
		if( bindings.length < 1 ){
			jqObj.bind('touchstart',onTouchStart)
				.bind('touchend',onTouchEnd);
		}
		if( $.inArray( type, bindings ) < 0 ){
			bindings.push(type);
		}
		jqObj.data(TOUCH_BINDINGS,bindings);
	},
	
	unbindTouches = function( jqObj, type ){
		var bindings = jqObj.data(TOUCH_BINDINGS) || [],
			index = $.inArray( type, bindings );
		if( index > -1 ){
			bindings.splice(index,1);
		}
		if( bindings.length < 1 ){
			jqObj.unbind('touchstart',onTouchStart)
				.unbind('touchend',onTouchEnd);
		}
		unbindDragHandlers(jqObj);
	};
	
	/***
	 * Enables swipe detection on an element 
	 *
	 * @param callback function: cb( event, deltaX, deltaY )
	 * @param bubble boolean: if true, allows the 'touchend' event to bubble. defaults to false.
	 */
	$.fn.swipe = function(callback,bubble) {
		this.unswipe();
		this.data(SWIPE_CALLBACK,callback);
		var tb = this.data(TOUCH_BUBBLE)===true?true:false;
		this.data(TOUCH_BUBBLE,(bubble===true?true:tb));
		bindTouches( this, 'swipe' );
		return this;
	};
	
	/***
	 * Removes swipe listeners set by swipe()
	 ***/
	$.fn.unswipe = function() {
		this.data(SWIPE_CALLBACK,null);
		this.data(TOUCH_BUBBLE,null);
		unbindTouches(this,'swipe');
		return this;
	};
	$.fn.unSwipe = $.fn.unswipe;
	
	/***
	 * Enables touch-dragging an element
	 *
	 * @param callback function: cb( event, deltaX, deltaY, startLeft, startTop ); can be null
	 * @param catcher [optional] an element to bind 'touchmove' and 'touchend' event listeners (defaults to document)
	 * @param axis [optional] 'x', 'y', 'xy' (default), or '' (an empty String) for manual mode
	 * 			(internally this is stored as an integer: 0=none, 1=x, 2=y, 3=xy)
	 */
	$.fn.touchDrag = function(callback,catcher,axis) {
		var catchObj = typeof catcher == "object" ? catcher : null,
			axisInt = 0;
		if( !axis || typeof axis == UNDEF){
			axisInt = 3;
		} else {
			axisInt += ( axis.indexOf('x') > -1 ? 1 : 0 );
			axisInt += ( axis.indexOf('y') > -1 ? 2 : 0 );
		}
		this.unTouchDrag();
		this.data(DRAG_CALLBACK,callback);
		this.data(DRAG_CATCHER,catchObj || document);
		this.data(DRAG_AXIS,axisInt);
		this.data(TOUCH_BUBBLE,true);
		bindTouches( this, 'touchDrag' );
		return this;
	};
	
	/***
	 * Removes touch-drag listeners set by touchDrag()
	 **/
	$.fn.unTouchDrag = function() {
		this.data(DRAG_CALLBACK,null);
		this.data(DRAG_CATCHER,null);
		this.data(TOUCH_BUBBLE,null);
		this.data(DRAG_AXIS,0);
		unbindTouches(this,'touchDrag');
		return this;
	};
	
		
})(jQuery);



