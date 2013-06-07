/**
* @fileoverview Events
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.events.ViewportChangePosition');
goog.provide('pike.events.ViewportChangeSize');
goog.provide('pike.events.Update');
goog.provide('pike.events.Render');
goog.provide('pike.events.NewEntity');
goog.provide('pike.events.RemoveEntity');
goog.provide('pike.events.GameworldChangeSize');

goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');

//## ViewportChangePosition #################################################################################
/**
* @param {number} oldX
* @param {number} oldY
* @param {number} x
* @param {number} y
* @param {goog.events.EventTarget} target
* @constructor
* @extends {goog.events.Event}
*/
pike.events.ViewportChangePosition = function(oldX, oldY, x, y, target){
	goog.events.Event.call(this, pike.events.ViewportChangePosition.EVENT_TYPE, target);
	
	this.oldX = oldX;
	this.oldY = oldY;
	this.x = x;
	this.y = y;
};

goog.inherits( pike.events.ViewportChangePosition, goog.events.Event );

/**
 * Event type
 * @const
 * @type {string}
 */
pike.events.ViewportChangePosition.EVENT_TYPE = "viewportchangeposition";

//## ViewportChangeSize #################################################################################
/**
* @param {number} oldW
* @param {number} oldH
* @param {number} width
* @param {number} height
* @param {goog.events.EventTarget} target
* @constructor
* @extends {goog.events.Event}
*/
pike.events.ViewportChangeSize = function(oldW, oldH, width, height, target){
	goog.events.Event.call(this, pike.events.ViewportChangeSize.EVENT_TYPE, target);
	
	this.oldW = oldW;
	this.oldH = oldH;
	this.w = width;
	this.h = height;
};

goog.inherits( pike.events.ViewportChangeSize, goog.events.Event );

/**
 * Event type
 * @const
 * @type {string}
 */
pike.events.ViewportChangeSize.EVENT_TYPE = "viewportchangesize";

//## Update #################################################################################
/**
* @param {Date} now
* @param {goog.events.EventTarget} target
* @constructor
* @extends {goog.events.Event}
*/
pike.events.Update = function( now, target){
	goog.events.Event.call(this, pike.events.Update.EVENT_TYPE, target);	
	this.now = now;	
};

goog.inherits( pike.events.Update, goog.events.Event );

/**
 * Event type
 * @const
 * @type {string}
 */
pike.events.Update.EVENT_TYPE = "update";

//## Render #################################################################################
/**
* @param {Date} now
* @param {goog.events.EventTarget} target
* @constructor 
* @extends {goog.events.Event}
*/
pike.events.Render = function( now, target){
	goog.events.Event.call(this, pike.events.Render.EVENT_TYPE, target);	
	this.now = now;	
};

goog.inherits( pike.events.Render, goog.events.Event );

/**
 * Event type
 * @const
 * @type {string}
 */
pike.events.Render.EVENT_TYPE = "render";

//## NewEntity #################################################################################
/**
* @param {number} id - entity id
* @param {goog.events.EventTarget} target
* @constructor 
* @extends {goog.events.Event}
*/
pike.events.NewEntity = function( id, target){
	goog.events.Event.call(this, pike.events.NewEntity.EVENT_TYPE, target);	
	this.id = id;	
};

goog.inherits( pike.events.NewEntity, goog.events.Event );

/**
 * Event type
 * @const
 * @type {string}
 */
pike.events.NewEntity.EVENT_TYPE = "newentity";

//## RemoveEntity #################################################################################
/**
* @param {number} id - entity id
* @param {goog.events.EventTarget} target
* @constructor 
* @extends {goog.events.Event}
*/
pike.events.RemoveEntity = function( id, target){
	goog.events.Event.call(this, pike.events.RemoveEntity.EVENT_TYPE, target);	
	this.id = id;	
};

goog.inherits( pike.events.RemoveEntity, goog.events.Event );

/**
 * Event type
 * @const
 * @type {string}
 */
pike.events.RemoveEntity.EVENT_TYPE = "removeentity";

//## GameworldChangeSize #################################################################################
/**
* @param {number} oldW
* @param {number} oldH
* @param {number} width
* @param {number} height
* @param {goog.events.EventTarget} target
* @constructor
* @extends {goog.events.Event}
*/
pike.events.GameworldChangeSize = function(oldW, oldH, width, height, target){
	goog.events.Event.call(this, pike.events.GameworldChangeSize.EVENT_TYPE, target);
	
	this.oldW = oldW;
	this.oldH = oldH;
	this.w = width;
	this.h = height;
};

goog.inherits( pike.events.GameworldChangeSize, goog.events.Event );

/**
 * Event type
 * @const
 * @type {string}
 */
pike.events.GameworldChangeSize.EVENT_TYPE = "gameworldchangesize";




