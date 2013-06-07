/**
* @fileoverview Events
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.events.ViewportChangePosition');
goog.provide('pike.events.ViewportChangeSize');
goog.provide('pike.events.Update');
goog.provide('pike.events.Render');

goog.require('goog.events.Event');

//## ViewportChangePosition #################################################################################
/**
* @param {number} oldX
* @param {number} oldY
* @param {number} x
* @param {number} y
* @constructor
* @extends {goog.events.Event}
*/
pike.events.ViewportChangePosition = function(oldX, oldY, x, y, viewport){
	goog.events.Event.call(this, pike.events.ViewportChangePosition.EVENT_TYPE, viewport);
	
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
pike.events.ViewportChangePosition.EVENT_TYPE = "changeposition";

//## ViewportChangeSize #################################################################################
/**
* @param {number} oldX
* @param {number} oldY
* @param {number} x
* @param {number} y
* @constructor
* @extends {goog.events.Event}
*/
pike.events.ViewportChangeSize = function(oldW, oldH, width, height, viewport){
	goog.events.Event.call(this, pike.events.ViewportChangeSize.EVENT_TYPE, viewport);
	
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
pike.events.ViewportChangeSize.EVENT_TYPE = "changesize";

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
* @param {goog.events.EventTarget} target*
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
