/**
* @fileoverview Viewport
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.input.InputHandlerBase');
goog.provide('pike.input.MouseInputHandler');
goog.provide('pike.input.TouchInputHandler');

goog.require('pike.graphics.Rectangle');
goog.require('pike.events.Down');
goog.require('pike.events.Up');
goog.require('pike.events.Move');
goog.require('goog.events.EventTarget');


//## InputHandlerBase ###############################################
/**
 * The Abstract class for MouseInputHandler and TouchInputHandler
 * @param {Object} element - DOM element 
 * @constructor
 * @extends {goog.events.EventTarget}
 */
pike.input.InputHandlerBase = function( element ){
	goog.events.EventTarget.call(this);
	
	/**
	* @type {!goog.events.EventHandler}
	* @protected
	*/
	this.handler = new goog.events.EventHandler(this);
	
	this.viewport_ = new pike.graphics.Rectangle(0,0,0,0);
	
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
 * @param {Object} e - DOM event
 */
pike.input.InputHandlerBase.prototype.onDownDomEvent = function( e ){
	// We must save this coordinates to support the moveThreshold
	var coords = this.lastMoveCoordinates_ = this.getInputCoordinates_(e);	
		
	if(goog.DEBUG) console.log("[pike.core.InputHanderBase] down " + coords.posX + ", " + coords.posY );
	this.dispatchEvent( new pike.events.Down(coords.posX, coords.posY, e, this) );	
	this.stopEventIfRequired_(e);
};

/**
 * Listens to the "up" DOM events: mouseup and touchend.
 * @param {Object} e - DOM event
 */
pike.input.InputHandlerBase.prototype.onUpDomEvent = function(e){
	var coords = this.getInputCoordinates_(e);
	
	if(goog.DEBUG) console.log("[pike.core.InputHanderBase] up " + coords.posX + ", " + coords.posY + ", moving: " + this.moving_ );
	this.dispatchEvent( new pike.events.Up( coords.posX, coords.posY, this.moving_, e, this) );
	this.stopEventIfRequired_(e);
	this.moving_ = false;	
};

/**
 * Listens to the "move" DOM events: mousemove and touchmove.
 * @param {Object} e - DOM move event
 */
pike.input.InputHandlerBase.prototype.onMoveDomEvent = function(e){
	var coords = this.getInputCoordinates_(e);	   
    var deltaX = coords.posX - this.lastMoveCoordinates_.posX;
    var deltaY = coords.posY - this.lastMoveCoordinates_.posY;
        
    // Check threshold
    if (!this.moving_ && Math.sqrt(deltaX*deltaX + deltaY*deltaY) > this.moveThreshold_) {
        this.moving_ = true;
    }
    
    if (this.moving_) {
    	if(goog.DEBUG) console.log("[pike.core.InputHanderBase] move " + coords.posX + ", " + coords.posY + ", deltaX: " + deltaX + ", deltaY: " + deltaY );
    	this.dispatchEvent( new pike.events.Move( coords.posX, coords.posY, deltaX, deltaY, e, this) );    	             
    	this.lastMoveCoordinates_ = coords;
    }

    this.stopEventIfRequired_(e);	
};

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
pike.input.InputHandlerBase.prototype.getInputCoordinates_ = function(e){		
	return {
		posX: e.offsetX + this.viewport_.x,
		posY: e.offsetY + this.viewport_.y
	};	
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
 * @param {Object} element - DOM element 
 * @constructor
 * @extends {pike.input.InputHandlerBase}
 */
pike.input.MouseInputHandler = function(element){	
	pike.input.InputHandlerBase.call(this, element);
		
	this.mouseDown_ = false;
    this.attachDomListeners_();	
};

goog.inherits(pike.input.MouseInputHandler, pike.input.InputHandlerBase );

/**
 * Attach the listeners to the mouseXXX DOM events
 * @private
 */
pike.input.MouseInputHandler.prototype.attachDomListeners_ = function(){
	 var el = this.element_;	 
	 this.handler.listen(el, goog.events.EventType.MOUSEDOWN, goog.bind( this.onDownDomEvent, this));
	 this.handler.listen(el, goog.events.EventType.MOUSEUP, goog.bind( this.onUpDomEvent, this));
	 this.handler.listen(el, goog.events.EventType.MOUSEMOVE, goog.bind( this.onMoveDomEvent, this));
	 this.handler.listen(el, goog.events.EventType.MOUSEOUT, goog.bind( this.onMouseOut, this));	 	
};

pike.input.MouseInputHandler.prototype.onDownDomEvent = function(e){
	this.mouseDown_ = true;
	pike.input.InputHandlerBase.prototype.onDownDomEvent.call(this, e);
};

pike.input.MouseInputHandler.prototype.onUpDomEvent = function(e){
	this.mouseDown_ = false;
	pike.input.InputHandlerBase.prototype.onUpDomEvent.call(this, e);
};

pike.input.MouseInputHandler.prototype.onMoveDomEvent = function(e){
	if (this.mouseDown_) {
		pike.input.InputHandlerBase.prototype.onMoveDomEvent.call(this, e);
	}
};

pike.input.MouseInputHandler.prototype.onMouseOut = function(){
	 this.mouseDown_ = false;
};

//## TouchInputHandler ###############################################
/**
 * MouseInputHandler
 * @param {Object} element - DOM element 
 * @constructor
 * @extends {pike.input.InputHandlerBase}
 */
pike.input.TouchInputHandler = function(element) {    
    pike.input.InputHandlerBase.call(this, element);
    this.lastInteractionCoordinates_ = null;
    this.attachDomListeners_();       
};

goog.inherits(pike.input.TouchInputHandler, pike.input.InputHandlerBase);

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

pike.input.TouchInputHandler.prototype.onDownDomEvent = function(e) {
    this.lastInteractionCoordinates_ = this.getInputCoordinates_(e);
    pike.input.InputHandlerBase.prototype.onDownDomEvent.call(this, e);
};

pike.input.TouchInputHandler.prototype.onUpDomEvent = function(e) {
	
	if(goog.DEBUG) console.log("[pike.core.TouchHanderBase] up " + this.lastInteractionCoordinates_.posX + ", " + this.lastInteractionCoordinates_.posY + ", moving: " + this.moving_);
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

pike.input.TouchInputHandler.prototype.onMoveDomEvent = function(e) {
    this.lastInteractionCoordinates_ = this.getInputCoordinates_(e);
    pike.input.InputHandlerBase.prototype.onMoveDomEvent.call(this, e);
};

