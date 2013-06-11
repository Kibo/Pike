/**
* @fileoverview Layer
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.layers.Layer');

goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventHandler');
goog.require('pike.events.NewEntity');
goog.require('pike.events.RemoveEntity');
goog.require('pike.core.Entity');

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
	
	this.entities_ = [];
	this.screen_ = {};
	this.offScreen_ = {}; 
	
	this.screen_.canvas = document.createElement("canvas");
	this.screen_.canvas.width = 0;
	this.screen_.canvas.height = 0;
	this.screen_.canvas.style.position  = "absolute";
	this.screen_.canvas.style.top  = "0";
	this.screen_.canvas.style.left  = "0";        		
	this.screen_.context = this.screen_.canvas.getContext('2d');
	this.screen_.isDirty = false;
	        		        	
	this.offScreen_.canvas = document.createElement("canvas");  
	this.offScreen_.canvas.width = 0;
	this.offScreen_.canvas.height = 0;
	this.offScreen_.context = this.offScreen_.canvas.getContext('2d');
	this.offScreen_.isDirty = false;  
};

goog.inherits(pike.layers.Layer, goog.events.EventTarget);

/**
 * Set dirty manager 
 * @param {pike.layers.DirtyManager} dirtyManager
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

/**
 * Add a entity to the layer
 * @param {pike.core.Entity} entity
 * @fires {pike.events.NewEntity} newentity
 */
pike.layers.Layer.prototype.addEntity = function( entity ){
	this.entities_.push( entity );
	entity.layer = this;
	this.dispatchEvent( new pike.events.NewEntity( entity, this) );
	if(goog.DEBUG) console.log("[pike.core.Layer] newentity");
};

/**
 * Remove entity
 * @param {pike.core.Entity} entity
 * @fires {pike.events.RemoveEntity} removeentity
 */
pike.layers.Layer.prototype.removeEntity = function( entity ){
	entity.dispose();
	goog.array.remove(this.entities_, entity);
	delete entity.layer;
	this.dispatchEvent( new pike.events.RemoveEntity( entity, this));
	if(goog.DEBUG) console.log("[pike.core.Layer] removeentity");
};


