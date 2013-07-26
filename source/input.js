/**
* @fileoverview Keyboard, mouse, touchboard control
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.input.InputHandlerBase');
goog.provide('pike.input.MouseInputHandler');
goog.provide('pike.input.TouchInputHandler');
goog.provide('pike.input.Utils');

goog.require('pike.graphics.Rectangle');
goog.require('pike.events.Down');
goog.require('pike.events.Up');
goog.require('pike.events.Move');
goog.require('goog.events.EventTarget');
goog.require('goog.style');

//## InputHandlerBase ###############################################
/**
 * The Abstract class for MouseInputHandler and TouchInputHandler
 * @param {Object} element - DOM element 
 * @constructor
 * @extends {goog.events.EventTarget}
 */
pike.input.InputHandlerBase = function(){
	goog.events.EventTarget.call(this);
	
	/**
	* @type {!goog.events.EventHandler}
	* @protected
	*/
	this.handler = new goog.events.EventHandler(this);
	
	this.viewport_ = new pike.graphics.Rectangle(0,0,0,0);
	
	// The DOM element
	this.element_ = null;
	
    this.moving_ = false;
    this.lastMoveCoordinates_ = null;
    this.moveThreshold_ = 10;
    this.stopDomEvents_ = true;	
};

goog.inherits(pike.input.InputHandlerBase, goog.events.EventTarget);

/**
 * Listens to the "down" DOM events: mousedown and touchstart.
 * @param {Object} e - DOM event
 */
pike.input.InputHandlerBase.prototype.onDownDomEvent = function( e ){
	// We must save this coordinates to support the moveThreshold
	var coords = this.lastMoveCoordinates_ = this.getInputCoordinates(e);	
	
	if(goog.DEBUG) window.console.log("[pike.core.InputHanderBase] down " + coords.posX + ", " + coords.posY );
	this.dispatchEvent( new pike.events.Down(coords.posX, coords.posY, e, this.element_) );	
	this.stopEventIfRequired_(e);
};

/**
 * Listens to the "up" DOM events: mouseup and touchend.
 * @param {Object} e - DOM event
 */
pike.input.InputHandlerBase.prototype.onUpDomEvent = function(e){
	var coords = this.getInputCoordinates(e);
	
	if(goog.DEBUG) window.console.log("[pike.core.InputHanderBase] up " + coords.posX + ", " + coords.posY + ", moving: " + this.moving_ );
	this.dispatchEvent( new pike.events.Up( coords.posX, coords.posY, this.moving_, e, this.element_) );
	this.stopEventIfRequired_(e);
	this.moving_ = false;	
};

/**
 * Listens to the "move" DOM events: mousemove and touchmove.
 * @param {Object} e - DOM move event
 */
pike.input.InputHandlerBase.prototype.onMoveDomEvent = function(e){	
	var coords = this.getInputCoordinates(e);	   
    var deltaX = coords.posX - this.lastMoveCoordinates_.posX;
    var deltaY = coords.posY - this.lastMoveCoordinates_.posY;
        
    // Check threshold
    if (!this.moving_ && Math.sqrt(deltaX*deltaX + deltaY*deltaY) > this.moveThreshold_) {
        this.moving_ = true;
    }
    
    if (this.moving_) {
    	if(goog.DEBUG) window.console.log("[pike.core.InputHanderBase] move " + coords.posX + ", " + coords.posY + ", deltaX: " + deltaX + ", deltaY: " + deltaY );
    	this.dispatchEvent( new pike.events.Move( coords.posX, coords.posY, deltaX, deltaY, e, this.element_));    	             
    	this.lastMoveCoordinates_ = coords;
    }

    this.stopEventIfRequired_(e);	
};

/**
 * 
 * @param {Object} DOM event
 * @private
 */
pike.input.InputHandlerBase.prototype.stopEventIfRequired_ = function(e){
	if (this.stopDomEvents_) {
	  e.stopPropagation();
      e.preventDefault();
	}
};

/**
 * Input coordinates
 * @param {Object} e - DOM event
 * @returns {Object}
 */
pike.input.InputHandlerBase.prototype.getInputCoordinates = function(e){		
	return pike.input.Utils.getInputCoordinates( e.getBrowserEvent(), this.element_ );	
};

/**
 * On Viewport change position handler
 * @param {pike.events.ViewportChangePosition} e
 */
pike.input.InputHandlerBase.prototype.onViewportChangePosition = function(e){
	this.viewport_.x = e.x;
	this.viewport_.y = e.y;
};

//## MouseInputHandler ###############################################
/**
 * MouseInputHandler
 * @constructor
 * @extends {pike.input.InputHandlerBase}
 */
pike.input.MouseInputHandler = function(){	
	pike.input.InputHandlerBase.call(this);		
	this.mouseDown_ = false;    	
};

goog.inherits(pike.input.MouseInputHandler, pike.input.InputHandlerBase );

/**
 * 
 * @param {Object} eventTarget - DOM element
 */
pike.input.MouseInputHandler.prototype.setEventTarget = function( eventTarget ){
	this.element_ = eventTarget;
	this.attachDomListeners_();
};

/**
 * Attach the listeners to the mouseXXX DOM events
 * @private
 */
pike.input.MouseInputHandler.prototype.attachDomListeners_ = function(){
	 var el = this.element_;	 
	 this.handler.listen(el, goog.events.EventType.MOUSEDOWN, this.onDownDomEvent, false, this);
	 this.handler.listen(el, goog.events.EventType.MOUSEUP, this.onUpDomEvent, false, this);
	 this.handler.listen(el, goog.events.EventType.MOUSEMOVE, this.onMoveDomEvent, false, this);
	 this.handler.listen(el, goog.events.EventType.MOUSEOUT, this.onMouseOut, false, this);	 	
};

/**
 * @param {Object} e - DOM Event
 */
pike.input.MouseInputHandler.prototype.onDownDomEvent = function(e){	
	this.mouseDown_ = true;
	pike.input.InputHandlerBase.prototype.onDownDomEvent.call(this, e);
};

/**
 * @param {Object} e - DOM Event
 */
pike.input.MouseInputHandler.prototype.onUpDomEvent = function(e){	
	this.mouseDown_ = false;
	pike.input.InputHandlerBase.prototype.onUpDomEvent.call(this, e);
};

/**
 * @param {Object} e - DOM Event
 */
pike.input.MouseInputHandler.prototype.onMoveDomEvent = function(e){	
	if (this.mouseDown_) {
		pike.input.InputHandlerBase.prototype.onMoveDomEvent.call(this, e);
	}
};

/**
 * @param {Object} e - DOM Event
 */
pike.input.MouseInputHandler.prototype.onMouseOut = function(){
	 this.mouseDown_ = false;
};

//## TouchInputHandler ###############################################
/**
 * MouseInputHandler
 * @constructor
 * @extends {pike.input.InputHandlerBase}
 */
pike.input.TouchInputHandler = function() {    
    pike.input.InputHandlerBase.call(this);
    this.lastInteractionCoordinates_ = null;
};

goog.inherits(pike.input.TouchInputHandler, pike.input.InputHandlerBase);

/**
 * 
 * @param {Object} eventTarget - DOM element
 */
pike.input.TouchInputHandler.prototype.setEventTarget = function( eventTarget ){
	this.element_ = eventTarget;
	this.attachDomListeners_();
};

/**
 * Attach the listeners to the touchXXX DOM events
 * @private
 */
pike.input.TouchInputHandler.prototype.attachDomListeners_ = function(){
	 var el = this.element_;	 
	 this.handler.listen(el, goog.events.EventType.TOUCHSTART, goog.bind( this.onDownDomEvent, this));
	 this.handler.listen(el, goog.events.EventType.TOUCHEND, goog.bind( this.onUpDomEvent, this));
	 this.handler.listen(el, goog.events.EventType.TOUCHMOVE, goog.bind( this.onMoveDomEvent, this));	 
};

/**
 * @param {Object} e - DOM Event
 */
pike.input.TouchInputHandler.prototype.onDownDomEvent = function(e) {	
    this.lastInteractionCoordinates_ = this.getInputCoordinates(e);
    pike.input.InputHandlerBase.prototype.onDownDomEvent.call(this, e);
};

/**
 * @param {Object} e - DOM Event
 */
pike.input.TouchInputHandler.prototype.onUpDomEvent = function(e) {
	
	if(goog.DEBUG) window.console.log("[pike.core.TouchHanderBase] up " + this.lastInteractionCoordinates_.posX + ", " + this.lastInteractionCoordinates_.posY + ", moving: " + this.moving_);
	this.dispatchEvent( new pike.events.Up(
			this.lastInteractionCoordinates_.posX, 
			this.lastInteractionCoordinates_.posY, 
			this.moving_,
			e, 
			this));
	
	this.stopEventIfRequired_(e);
    this.lastInteractionCoordinates_ = null;
    this.moving_ = false;
};

/**
 * @param {Object} e - DOM Event
 */
pike.input.TouchInputHandler.prototype.onMoveDomEvent = function(e) {
    this.lastInteractionCoordinates_ = this.getInputCoordinates(e);
    pike.input.InputHandlerBase.prototype.onMoveDomEvent.call(this, e);
};

//## Utils ###############################################
/**
 * Is touch device
 * @return {boolean}
 */
pike.input.Utils.isTouchDevice = function(){
	return ('ontouchstart' in document.documentElement);	
};

/**
 * Get input handler
 * mouse or touch
 * @return {pike.input.MouseInputHandler | pike.input.TouchInputHandler} 
 */
pike.input.Utils.getDeviceInputHandler = function(){	
	return pike.input.Utils.isTouchDevice() ? new pike.input.TouchInputHandler() : new pike.input.MouseInputHandler();
	//return new pike.input.TouchInputHandler();
};

/**
 * Calculate a input coordinates
 * @param {Object} e - DOM event
 * @param {Object} element - DOM element
 * @returns {Object}
 */
pike.input.Utils.getInputCoordinates = function(e, element){
	var coords = e.targetTouches ? e.targetTouches[0] : e;
	
	var offset = goog.style.getPageOffset(element);	
	
	return {
		posX: (coords.pageX || coords.clientX + document.body.scrollLeft ) - offset.x,
		posY: (coords.pageY || coords.clientY + document.body.scrollTop ) - offset.y
	};
};

