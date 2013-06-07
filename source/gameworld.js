/**
* @fileoverview Gameworld
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.core.Gameworld');

goog.require('pike.graphics.Rectangle');
goog.require('pike.events.GameworldChangeSize'); 
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventHandler');

/**
* Creates a new Gameworld.
* @param {number} width
* @param {number} height
* @constructor
* @extends {goog.events.EventTarget}
*/
pike.core.Gameworld = function( width, height ){
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
		
	this.setSize(width, height);		
};

goog.inherits(pike.core.Gameworld, goog.events.EventTarget);

/**
* Set size of Gameworld
* @param {number} width
* @param {number} height
* @fires {pike.events.ViewportChangeSize} event
*/
pike.core.Gameworld.prototype.setSize = function( width, height ){
	var oldW = this.w;
	var oldH = this.h;
	this.w = width;
	this.h = height;
	
	this.dispatchEvent( new pike.events.GameworldChangeSize(oldW, oldH, this.w, this.h, this) );
	if(goog.DEBUG) console.log("[pike.core.Gameworld] changesize");
};

/**
* Get boundaries of Gameworld
* @return {pike.graphics.Rectangle}
*/
pike.core.Gameworld.prototype.getBounds = function(){
	return new pike.graphics.Rectangle(this.x, this.y, this.w, this.h);
};


									   