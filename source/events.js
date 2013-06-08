/**
* @fileoverview Events
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.events.ChangePosition');
goog.provide('pike.events.ChangeSize');
goog.provide('pike.events.Update');
goog.provide('pike.events.Render');
goog.provide('pike.events.NewEntity');
goog.provide('pike.events.RemoveEntity');

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
pike.events.ChangePosition = function(oldX, oldY, x, y, target){
	goog.events.Event.call(this, pike.events.ChangePosition.EVENT_TYPE, target);
	
	this.oldX = oldX;
	this.oldY = oldY;
	this.x = x;
	this.y = y;
};

goog.inherits( pike.events.ChangePosition, goog.events.Event );

/**
 * Event type
 * @const
 * @type {string}
 */
pike.events.ChangePosition.EVENT_TYPE = "changeposition";

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
pike.events.ChangeSize = function(oldW, oldH, width, height, target){
	goog.events.Event.call(this, pike.events.ChangeSize.EVENT_TYPE, target);
	
	this.oldW = oldW;
	this.oldH = oldH;
	this.w = width;
	this.h = height;
};

goog.inherits( pike.events.ChangeSize, goog.events.Event );

/**
 * Event type
 * @const
 * @type {string}
 */
pike.events.ChangeSize.EVENT_TYPE = "changesize";

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

//## Done #################################################################################
/**
* @param {goog.events.EventTarget} target
* @constructor
* @extends {goog.events.Event}
*/
pike.events.Done = function(target){
	goog.events.Event.call(this, pike.events.Done.EVENT_TYPE, target);
};

goog.inherits( pike.events.Done, goog.events.Event );

/**
 * Event type
 * @const
 * @type {string}
 */
pike.events.Done.EVENT_TYPE = "done";

//## Progress #################################################################################
/**
* @param {number} progress - range <0,1>
* @param {goog.events.EventTarget} target
* @constructor
* @extends {goog.events.Event}
*/
pike.events.Progress = function( progress, target){
	goog.events.Event.call(this, pike.events.Progress.EVENT_TYPE, target);
	this.progress = progress;
};

goog.inherits( pike.events.Progress, goog.events.Event );

/**
 * Event type
 * @const
 * @type {string}
 */
pike.events.Progress.EVENT_TYPE = "progress";

