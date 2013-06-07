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
	
	this.layers_ = {};	
};

goog.inherits(pike.core.RenderManager, goog.events.EventTarget);

/**
 * Get a layer
 * @param {string} name - layer name
 * @return {pike.layers.Layer}
 */
pike.core.RenderManager.prototype.getLayer = function( name ){};

/**
 * Register a layer
 * @param {pike.layers.Layer} layer
 */
pike.core.RenderManager.prototype.addLayer = function( layer ){};

/**
 * Render layer to canvas
 * @param {pike.layers.Layer} layer
 * @private
 */
pike.core.RenderManager.prototype.render_ = function( layer ){};

/**
 * onRender event handler
 * @param {pike.events.Render} e
 * @private
 */
pike.core.RenderManager.prototype.onRender_ = function( e ){};

/**
 * onViewportChangeSize event handler
 * @param {pike.events.ViewportChangeSize} e
 * @private
 */
pike.core.RenderManager.prototype.onViewportChangeSize_ = function(e){};

/**
 * onViewportChangePosition event handler
 * @param {pike.events.ViewportChangePosition} e
 * @private
 */
pike.core.RenderManager.prototype.onViewportChangePosition_ = function(e){};

/**
 * onGameWorldChangeSize event handler
 * @param {pike.events.GameWorldChangeSize} e
 * @private
 */
pike.core.RenderManager.prototype.onGameWorldChangeSize_ = function(e){};


