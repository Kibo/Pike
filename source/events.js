/**
* @fileoverview Events
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/

goog.provide('pike.events.ViewportChangePosition');
goog.provide('pike.events.ViewportChangeSize');
goog.provide('pike.events.GameWorldChangeSize');

goog.provide('pike.events.Update');
goog.provide('pike.events.Render');
goog.provide('pike.events.NewEntity');
goog.provide('pike.events.RemoveEntity');

goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');

//## ViewportChangePosition #################################################################################
/**
* @param {number} x
* @param {number} y
* @param {goog.events.EventTarget} target
* @constructor
* @extends {goog.events.Event}
*/
pike.events.ViewportChangePosition = function( x, y, target){
	goog.events.Event.call(this, pike.events.ViewportChangePosition.EVENT_TYPE, target);	
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
* @param {number} width
* @param {number} height
* @param {goog.events.EventTarget} target
* @constructor
* @extends {goog.events.Event}
*/
pike.events.ViewportChangeSize = function( width, height, target){
	goog.events.Event.call(this, pike.events.ViewportChangeSize.EVENT_TYPE, target);	
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


//## GameWorldChangeSize #################################################################################
/**
* @param {number} width
* @param {number} height
* @param {goog.events.EventTarget} target
* @constructor
* @extends {goog.events.Event}
*/
pike.events.GameWorldChangeSize = function( width, height, target){
	goog.events.Event.call(this, pike.events.GameWorldChangeSize.EVENT_TYPE, target);	
	this.w = width;
	this.h = height;
};

goog.inherits( pike.events.GameWorldChangeSize, goog.events.Event );

/**
 * Event type
 * @const
 * @type {string}
 */
pike.events.GameWorldChangeSize.EVENT_TYPE = "gameworldchangesize";

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
* @param {pike.core.Entity} entity
* @param {goog.events.EventTarget} target
* @constructor 
* @extends {goog.events.Event}
*/
pike.events.NewEntity = function( entity, target){
	goog.events.Event.call(this, pike.events.NewEntity.EVENT_TYPE, target);	
	this.entity = entity;	
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
* @param {pike.core.Entity} entity
* @param {goog.events.EventTarget} target
* @constructor 
* @extends {goog.events.Event}
*/
pike.events.RemoveEntity = function( entity, target){
	goog.events.Event.call(this, pike.events.RemoveEntity.EVENT_TYPE, target);	
	this.entity = entity;	
};

goog.inherits( pike.events.RemoveEntity, goog.events.Event );

/**
 * Event type
 * @const
 * @type {string}
 */
pike.events.RemoveEntity.EVENT_TYPE = "removeentity";


