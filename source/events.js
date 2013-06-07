goog.provide('pike.events.ViewportChangePosition');
goog.provide('pike.events.ViewportChangeSize');

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