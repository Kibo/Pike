/**
* @fileoverview Render manager
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.core.RenderManager');

goog.require('pike.graphics.Rectangle');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventHandler');
goog.require('goog.array');

/**
* Render manager 
* manages layers and render system
* @constructor
* @extends {goog.events.EventTarget}
*/
pike.core.RenderManager = function(){
	goog.events.EventTarget.call(this);
	
	/**
	* @type {!goog.events.EventHandler}
	* @protected
	*/
	this.handler = new goog.events.EventHandler(this);
	
	this.layers_ = [];	
};

goog.inherits(pike.core.RenderManager, goog.events.EventTarget);

/**
 * Get a layer
 * @param {string} name - layer name
 * @return {?pike.layers.Layer}
 */
pike.core.RenderManager.prototype.getLayer = function( name ){
	for(var idx = 0; idx < this.layers_.length; idx++){
		if(this.layers_[idx].name == name){
			return this.layers_[idx]; 
		}		
	}
};

/**
 * Register a layer
 * @param {pike.layers.Layer} layer
 */
pike.core.RenderManager.prototype.addLayer = function( layer ){
	this.layers_.push(layer);
};

/**
 * onViewportChangePosition event handler
 * @param {pike.events.ViewportChangePosition} e
 */
pike.core.RenderManager.prototype.onViewportChangePosition = function(e){
	for(var idx = 0; idx < this.layers_.length; idx++){
		var screen = this.layers_[idx].getScreen();		
		screen.isDirty = true;		
	}
};

/**
 * onViewportChangeSize event handler
 * @param {pike.events.ViewportChangeSize} e
 */
pike.core.RenderManager.prototype.onViewportChangeSize = function(e){
	for(var idx = 0; idx < this.layers_.length; idx++){
		var screen = this.layers_[idx].getScreen();
		screen.canvas.width = e.w;
		screen.canvas.height = e.h;
		screen.isDirty = true;		
	}		
};

/**
 * onGameWorldChangeSize event handler
 * @param {pike.events.GameWorldChangeSize} e
 */
pike.core.RenderManager.prototype.onGameWorldChangeSize = function(e){
	for(var idx = 0; idx < this.layers_.length; idx++){
		var offScreen = this.layers_[idx].getOffScreen();
		offScreen.canvas.width = e.w;
		offScreen.canvas.height = e.h;
		offScreen.isDirty = true;		
	}
};

/**
 * Render layer to canvas
 * @param {pike.layers.Layer} layer
 * @private
 */
pike.core.RenderManager.prototype.render_ = function( layer ){
	console.log("render layer " + layer.name);
	//TODO
};

/**
 * onRender event handler
 * @param {pike.events.Render} e
 */
pike.core.RenderManager.prototype.onRender = function( e ){
	for(var idx = 0; idx < this.layers_.length; idx++){
		this.render_( this.layers_[idx] );			
	}
};
