/**
* @fileoverview Gameworld
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.core.GameWorld');

goog.require('pike.graphics.Rectangle');
goog.require('pike.events.ChangeSize'); 
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventHandler');

/**
* Creates a new Gameworld.
* @constructor
* @extends {goog.events.EventTarget}
*/
pike.core.GameWorld = function(){
	goog.events.EventTarget.call(this);
	
	this.x = 0;
	this.y = 0;
	this.w = 0;
	this.h = 0;	
	
	/**
	* @type {!goog.events.EventHandler}
	* @protected
	*/
	this.handler = new goog.events.EventHandler(this);			
};

goog.inherits(pike.core.GameWorld, goog.events.EventTarget);

/**
* Set size of GameWorld
* @param {number} width
* @param {number} height
* @fires {pike.events.ChangeSize} event
*/
pike.core.GameWorld.prototype.setSize = function( width, height ){
	var oldW = this.w;
	var oldH = this.h;
	this.w = width;
	this.h = height;
	
	if(goog.DEBUG) console.log("[pike.core.GameWorld] changesize");
	this.dispatchEvent( new pike.events.ChangeSize(oldW, oldH, this.w, this.h, this) );
};

/**
* Get boundaries of GameWorld
* @return {pike.graphics.Rectangle}
*/
pike.core.GameWorld.prototype.getBounds = function(){
	return new pike.graphics.Rectangle(this.x, this.y, this.w, this.h);
};

/**
 * Viewport change size handler
 * @param {pike.events.ChangeSize} e
 */
pike.core.GameWorld.prototype.onViewportChangeSize = function(e){
	this.setSize( Math.max(this.w, e.w), Math.max(this.h, e.h));
};


									   