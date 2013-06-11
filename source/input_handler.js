/**
* @fileoverview Viewport
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.input.InputHandlerBase');
goog.provide('pike.input.MouseInputHandler');
goog.provide('pike.input.TouchInputHandler');

goog.require('pike.events.Down');
goog.require('pike.events.Up');
goog.require('pike.events.Move');

/**
 * The Abstract class for MouseInputHandler and TouchInputHandler
 * @param {Object} element - DOM element 
 * @constructor
 * @extends {goog.events.EventTarget}
 */
pike.input.InputHandlerBase = function( element ){
	goog.events.EventTarget.call(this);
	
	// The DOM element
	this.element_ = element;
	
    this.moving_ = false;
    this.lastMoveCoordinates_ = null;
    this.moveThreshold_ = 10;
    this.stopDomEvents_ = true;	
};

goog.inherits(pike.input.InputHandlerBase, goog.events.EventTarget);

/**
 * Listens to the "down" DOM events: mousedown and touchstart.
 * @param {} e
 */
pike.input.InputHandlerBase.prototype.onDownDomEvent = function( e ){
	// We must save this coordinates to support the moveThreshold
	var coords = this.lastMoveCoordinates_ = this.getInputCoordinates(e);	
	this.dispatchEvent( new pike.events.Down(coords.posX, coords.posY, e, this) );	
	this.stopEventIfRequired(e);
};

pike.input.InputHandlerBase.prototype.onUpDomEvent = function(e){
	var coords = this.getInputCoordinates(e);
	this.dispatchEvent( new pike.events.Up( coords.posX, coords.posY, this.moving_, e, this) );
	this.stopEventIfRequired(e);
	this.moving_ = false;	
};

pike.input.InputHandlerBase.prototype.onMoveDomEvent = function(e){
	var coords = this.getInputCoordinates(e);	   
    var deltaX = coords.posX - this.lastMoveCoordinates_.posX;
    var deltaY = coords.posY - this.lastMoveCoordinates_.posY;
    
    // Check threshold
    if (!this.moving_ && Math.sqrt(deltaX*deltaX + deltaY*deltaY) > this.moveThreshold_) {
        this.moving_ = true;
    }
    
    if (this.moving_) {       
    	this.dispatchEvent( new pike.events.Move( coords.posX, coords.posY, deltaX, deltaY, e, this) );    	             
    	this.lastMoveCoordinates_ = coords;
    }

    this.stopEventIfRequired(e);	
};

pike.input.InputHandlerBase.prototype.stopEvent = function(e){
	if (this.stopDomEvents_) {
	  e.stopPropagation();
      e.preventDefault();
	}
};

pike.input.InputHandlerBase.prototype.getInputCoordinates = function(e){
	var rec = this.element_.getBoundingClientRect();        		        		        		       		      
	return {
		posX: (e.pageX - rec.left) + Pike.viewport.x,
		posY: (e.pageY - rec.top) + Pike.viewport.y
	};	
};


