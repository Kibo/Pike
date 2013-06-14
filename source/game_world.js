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

	this.viewport_ = new pike.graphics.Rectangle(0,0,0,0); 	

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
	var oldW = this.viewport_.w;
	var oldH = this.viewport_.h;
	this.viewport_.w = width;
	this.viewport_.h = height;

	if(goog.DEBUG) console.log("[pike.core.GameWorld] changesize");
	this.dispatchEvent( new pike.events.ChangeSize(this.viewport_.w, this.viewport_.h, oldW, oldH, this) );
};

/**
* Get boundaries of GameWorld
* @return {pike.graphics.Rectangle}
*/
pike.core.GameWorld.prototype.getBounds = function(){
	return this.viewport_.copy();
};