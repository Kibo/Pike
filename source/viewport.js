/**
* @fileoverview Viewport
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.core.Viewport');

goog.require('pike.graphics.Rectangle');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventHandler');

/**
* Creates a new Viewport.
* @constructor
* @extends {goog.events.EventTarget}
*/
pike.core.Viewport = function(){
	goog.events.EventTarget.call(this);

	this.viewport_ = new pike.graphics.Rectangle(0,0,0,0); 

	/**
	* @type {!goog.events.EventHandler}
	* @protected
	*/
	this.handler = new goog.events.EventHandler(this);	
};

goog.inherits(pike.core.Viewport, goog.events.EventTarget);

/**
* Set size of Viewport
* @param {number} width
* @param {number} height
* @fires {pike.events.ChangeSize} event
*/
pike.core.Viewport.prototype.setSize = function( width, height ){
	this.viewport_.w = width;
	this.viewport_.h = height;
		
	if(goog.DEBUG) console.log("[pike.core.Viewport] changesize");
	this.dispatchEvent( new pike.events.ChangeSize( this.viewport_.w, this.viewport_.h, this) );
};

/**
* Set position of Viewport
* @param {number} x
* @param {number} y
* @fires {pike.events.ChangePosition} event
*/
pike.core.Viewport.prototype.setPosition = function( x, y ){
	this.viewport_.x = x;
	this.viewport_.y = y;
	
	if(goog.DEBUG) console.log("[pike.core.Viewport] changeposition");
	this.dispatchEvent(new pike.events.ChangePosition( this.viewport_.x, this.viewport_.y, this));
};

/**
* Get boundaries of Viewport
* @return {pike.graphics.Rectangle}
*/
pike.core.Viewport.prototype.getBounds = function(){
	return this.viewport_.copy();
};
