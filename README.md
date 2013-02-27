jquery-touch-swipe-drag
=======================

A tiny jQuery plugin adding swipe and drag capabilities for elements when viewed on touch screens

## touch-drag use

To make an element touch-draggable, use the <code>$.touchDrag()</code> function.


	$('.dragElement').touchDrag( callback, catcher, axis );

**callback**  
A function called at every step of the drag (i.e. on 'touchmove').  
Can be null. The following properties are passed:  
```
function( event, deltaX, deltaY, startLeft, startTop ){...}
```  
Inside the callback, **this** references the element being dragged.

**catcher**  
An element (or jQuery object) to bind 'touchmove' and 'touchend' event listeners to (defaults to document).  
Usually this is a container for the element you're dragging. The touch won't always happen on the drag element, so you generally want a DOM parent underneath to "catch" the event.

**axis**  
A string denoting the axis for build-in movement. Defaults to "xy" (both axis).  
Valid values: "**x**", "**y**", "**xy**", or **""** (an empty String) for manual mode.  
In manual mode no movement is automated; you do whatever you gotta do using the callback function.

### Examples:

Log progress via a callback:

    $('.dragElement').touchDrag( function( e, dx, dy, startLeft, startTop ){
         console.log( "I've moved ",dx," pixels on the x axis and ",dy," pixels on the y." );
    });

Restrict movement to the x axis:

    $('.dragElement').touchDrag( null, null 'x' );

Limit movement to a container:

    $('.dragElement').touchDrag( null, $('#dragContainer') );
    // or
    $('.dragElement').touchDrag( null, document.getElementById('dragContainer') );


## swipe use

To detect a touch-swipe motion, use the  <code>$.swipe()</code> function.

	$('.swipeArea').swipe( callback, bubble );

**callback**  
A function called after a swipe has occurred.  
Can be null. The following properties are passed:  
```
function( event, deltaX, deltaY ){...}
```  

**bubble**  
A boolean: if true, allows the 'touchend' event to bubble. defaults to false.

### Example:

In this example, you'd want <code>'.swipeArea'</code> to occupy a significant area of the screen, to give users room to swipe their fingers. This area can have child elements.

    $('.swipeArea').swipe( function( e, dx, dy ){
        if( dx < 0 ){
            console.log( "swipe left!" );
        } else {
            console.log( "swipe right!" );
        }
    });


## removing listeners

You can remove listeners and functionality set via the above methods.

**unTouchDrag**:

    $('.dragElement').unTouchDrag();

**unSwipe**:

    $('.swipeArea').unSwipe();

