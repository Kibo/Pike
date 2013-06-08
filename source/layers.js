/**
* @fileoverview Layer
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.layers.Layer');
goog.provide('pike.layers.DirtyRectangleManager');

goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventHandler');


/**
 * Create a new layer
 * @param {string} name
 * @constructor
 * @extends {goog.events.EventTarget}
 */
pike.layers.Layer = function( name ){
	goog.events.EventTarget.call(this);
	
	this.name = name;
	
	/**
	* @type {!goog.events.EventHandler}
	* @protected
	*/
	this.handler = new goog.events.EventHandler(this);
	
	this.screen_ = {};
	this.offScreen_ = {}; 
	
	this.screen_.canvas = document.createElement("canvas");
	this.screen_.canvas.style.position  = "absolute";
	this.screen_.canvas.style.top  = "0";
	this.screen_.canvas.style.left  = "0";        		
	this.screen_.context = this.screen_.canvas.getContext('2d');
	this.screen_.isDirty = true;
	        		        	
	this.offScreen_.canvas = document.createElement("canvas");        		       	
	this.offScreen_.context = this.offScreen_.canvas.getContext('2d');
	this.offScreen_.isDirty = true;  
};

goog.inherits(pike.layers.Layer, goog.events.EventTarget);

/**
 * Set dirty manager 
 * @param {pike.layers.DirtyRectangleManager} dirtyManager
 */
pike.layers.Layer.prototype.setDirtyManager = function( dirtyManager ){
	this.dirtyManager = dirtyManager;
};

/**
 * Determines whether the layer has a DirtyManager
 * @return {boolean}
 */
pike.layers.Layer.prototype.hasDirtyManager = function(){
	return this.dirtyManager; //TODO
};

/**
 * Get a screen object
 * @returns {Object}
 */
pike.layers.Layer.prototype.getScreen = function(){
	return this.screen_;
};

/**
 * Get a offScreen object
 * @returns {Object}
 */
pike.layers.Layer.prototype.getOffScreen = function(){
	return this.offScreen_;
};

//## DirtyRectangleManager ######################################

/**
 * Create a new DirtyRectangleManager
 * @constructor
 */
pike.layers.DirtyRectangleManager = function(){};






