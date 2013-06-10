/**
* @fileoverview Layer
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.layers.DirtyManager');

goog.require('goog.events.EventTarget');

/**
 * Create a new DirtyManager
 * @param {number} allDirtyThreshold - the value is the number between 0 and 1.
 * @constructor
 */
pike.layers.DirtyManager = function( allDirtyThreshold ){
	this.x = 0;
	this.y = 0;
	this.w = 0;
	this.h = 0;
	
	/**
	* @type {!goog.events.EventHandler}
	* @protected
	*/
	this.handler = new goog.events.EventHandler(this);
	
	// Current dirty rectangle that covers all smaller dirty areas
	this.dirtyRect_ = null;
	
	this.allDirtyThreshold_ = allDirtyThreshold == undefined ? .5 : allDirtyThreshold;
	
	// true when we have reached the trheshold
	this.allDirty_ = true;	
};

/**
 * Returns the current dirty rectangle that covers all registered dirty areas
 * @return {pike.graphics.Rectangle}
 */
pike.layers.DirtyManager.prototype.getDirtyRectangle = function(){
	return this.dirtyRect_;
};

/**
 * Mark all viewport as dirty
 */
pike.layers.DirtyManager.prototype.markAllDirty = function(){
	this.allDirty_ = true;
	this.dirtyRect_ = this.getBounds();
};

/**
 * Mark the given area as dirty.
 * @param {?pike.graphics.Rectangle} rect
 */
pike.layers.DirtyManager.prototype.markDirty = function( rect ){	
	if ( !(rect.w || rect.h) || this.allDirty_) {
		return;
	}
		
	// We are only interested in the rectangles that intersect the viewport
	rect = this.getBounds().intersection( rect );	
	
	if (!rect) {
		return;
	}
															
	if (this.dirtyRect_) {
		this.dirtyRect_ = this.dirtyRect_.convexHull(rect);		
	} else {					
		this.dirtyRect_ = rect;		
	}
	
	// Check for threshold. If it is reached, mark the whole screen dirty
	if (this.dirtyRect_.w * this.dirtyRect_.h > this.allDirtyThreshold_ * this.w * this.h){	
			this.markAllDirty();
	}	
};

/**
 * Returns true if there are not dirty area
 * @return {boolean}
 */
pike.layers.DirtyManager.prototype.isClean = function(){
	return !(this.dirtyRect_);
};

/**
 * Clear the dirty regions.
 */
pike.layers.DirtyManager.prototype.clear = function(){
	this.dirtyRect_ = null;
	this.allDirty_ = false;
};

/**
* Get boundaries
* @return {pike.graphics.Rectangle}
*/
pike.layers.DirtyManager.prototype.getBounds = function(){
	return new pike.graphics.Rectangle(this.x, this.y, this.w, this.h);
};

/**
 * Set size
 * @param {number} width
 * @param {number} height
 */
pike.layers.DirtyManager.prototype.setSize = function( width, height ){
	this.w = width;
	this.h = height;
	this.markAllDirty();	
};

/**
 * Set Position
 * @param {number} x
 * @param {number} y
 */
pike.layers.DirtyManager.prototype.setPosition = function( x, y ){
	this.x = x;
	this.y = y;
};

/**
 * On viewport change position handler
 * @param {pike.events.ChangeSize} e
 */
pike.layers.DirtyManager.prototype.onViewportChangePosition = function(e){
	this.setPosition(e.x, e.y);
};

/**
 * On viewport change size handler
 * @param {pike.events.ChangeSize} e
 */
pike.layers.DirtyManager.prototype.onViewportChangeSize = function(e){
	this.setSize(e.w, e.h);
};